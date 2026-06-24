import { XMLParser } from "fast-xml-parser";

// General market news via MarketWatch's dedicated syndication feed
// (Dow Jones) — built specifically for RSS aggregation. Using this over
// Yahoo Finance's feed mainly because it's purpose-built infrastructure
// for syndication rather than served from the main website.
// NOTE: This sandbox can't reach external domains to test the live
// fetch (confirmed via x-deny-reason: host_not_allowed — a restriction
// on this dev environment, not evidence either feed blocks anything).
// Verify the live fetch once running locally or on Vercel, and confirm
// current licensing/usage terms before relying on this in production.
const FEED_URL = "https://feeds.content.dowjones.io/public/rss/mw_topstories";

export const dynamic = "force-dynamic";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
};

function stripCdata(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

export async function GET() {
  try {
    const res = await fetch(FEED_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return Response.json(
        { ok: false, error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);

    const rawItems = parsed?.rss?.channel?.item;
    const itemList = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    const items: NewsItem[] = itemList.slice(0, 10).map((item: Record<string, unknown>) => ({
      title: stripCdata(item.title) || "Untitled",
      link: typeof item.link === "string" ? item.link : "",
      pubDate: typeof item.pubDate === "string" ? item.pubDate : "",
      source: stripCdata(item.source) || "MarketWatch",
    }));

    if (items.length === 0) {
      return Response.json(
        { ok: false, error: "No items parsed from feed" },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, items, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
