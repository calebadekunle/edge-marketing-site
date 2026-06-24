// Real-time-ish equity quotes via Alpaca's Market Data API (Snapshot
// endpoint), using the free-tier IEX feed.
//
// NOTE — what this does and doesn't cover:
// - This covers NASDAQ/NYSE-listed equities. It does NOT cover true
//   OTC/pink-sheet penny stocks — that requires Alpaca's paid OTC feed
//   add-on. The symbols below are liquid, lower-priced, actively-traded
//   small-caps as the closest free equivalent, not actual OTC penny stocks.
// - Free tier uses the IEX feed: genuinely real-time, but reflects one
//   exchange's tape rather than the full consolidated (SIP) tape.
//
// Requires two environment variables (set in Vercel project settings,
// and in .env.local for local dev — get these from your Alpaca dashboard,
// a free paper-trading account works fine):
//   ALPACA_API_KEY_ID
//   ALPACA_API_SECRET_KEY

const SYMBOLS = ["PRSO", "NOK", "PLUG", "SIRI", "SOFI", "RIOT", "MARA", "NIO", "LCID", "RIVN", "GSAT"];

export const dynamic = "force-dynamic";

type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
};

type AlpacaSnapshot = {
  latestTrade?: { p: number };
  dailyBar?: { c: number };
  prevDailyBar?: { c: number };
};

export async function GET() {
  const keyId = process.env.ALPACA_API_KEY_ID;
  const secretKey = process.env.ALPACA_API_SECRET_KEY;

  if (!keyId || !secretKey) {
    return Response.json(
      { ok: false, error: "Missing ALPACA_API_KEY_ID / ALPACA_API_SECRET_KEY env vars" },
      { status: 500 }
    );
  }

  try {
    const url = `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${SYMBOLS.join(",")}&feed=iex`;
    const res = await fetch(url, {
      headers: {
        "APCA-API-KEY-ID": keyId,
        "APCA-API-SECRET-KEY": secretKey,
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return Response.json(
        { ok: false, error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const snapshots: Record<string, AlpacaSnapshot> = data?.snapshots ?? data ?? {};

    const quotes: Quote[] = SYMBOLS.map((symbol) => {
      const snap = snapshots[symbol];
      const price = snap?.latestTrade?.p ?? snap?.dailyBar?.c ?? null;
      const prevClose = snap?.prevDailyBar?.c ?? null;

      if (price == null || prevClose == null || prevClose === 0) {
        return null;
      }

      const changePercent = ((price - prevClose) / prevClose) * 100;
      return { symbol, price, changePercent };
    }).filter((q): q is Quote => q !== null);

    if (quotes.length === 0) {
      return Response.json(
        { ok: false, error: "No quotes parsed from response" },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, quotes, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
