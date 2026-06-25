// Real-time-ish equity quotes via Alpaca's Market Data API (Snapshot
// endpoint), using the free-tier IEX feed.
//
// This route serves two independent things from two separate upstream
// fetches, deliberately decoupled:
//   1. `quotes`   — the stable ticker-tape symbols (mid/small-cap names)
//   2. `heroPick` — a daily-rotating sub-$1 "penny" pick for the hero card
//
// Why separate fetches instead of one combined batch: Alpaca's snapshot
// endpoint fails the ENTIRE batch if even one symbol in it is invalid
// (delisted, renamed, typo'd). The penny pool below is inherently higher
// delisting-risk than the stable pool (that's structurally what being
// sub-$1 on NASDAQ means — see README). Splitting the fetches means a
// bad penny symbol only takes out the hero pick, not the whole ticker tape.
//
// NOTE — what this does and doesn't cover:
// - Covers NASDAQ/NYSE-listed equities. Does NOT cover true OTC/pink-sheet
//   penny stocks — that needs Alpaca's paid OTC feed add-on.
// - Free tier uses the IEX feed: genuinely real-time, but reflects one
//   exchange's tape rather than the full consolidated (SIP) tape.
//
// Requires two environment variables (Vercel project settings, and
// .env.local for local dev — from your Alpaca dashboard; a free
// paper-trading account works fine):
//   ALPACA_API_KEY_ID
//   ALPACA_API_SECRET_KEY

const STABLE_SYMBOLS = ["NOK", "PLUG", "SIRI", "SOFI", "RIOT", "MARA", "NIO", "LCID", "RIVN", "GSAT"];

// Rotation pool for the hero card. Each entry must be re-verified
// periodically against a live screener (e.g. MarketBeat's "Stocks Under $1")
// — NASDAQ requires listed stocks to stay above $1 or face delisting, so
// this list WILL go stale over time. See README for the swap procedure.
const PENNY_POOL: { symbol: string; name: string }[] = [
  { symbol: "PRSO", name: "Peraso Inc." },
  { symbol: "CAN", name: "Canaan Inc." },
  { symbol: "GOCO", name: "GoHealth Inc." },
  { symbol: "GOSS", name: "Gossamer Bio Inc." },
  { symbol: "DEFT", name: "DeFi Technologies Inc." },
];

export const dynamic = "force-dynamic";

type Quote = { symbol: string; price: number; changePercent: number };
type HeroPick = { symbol: string; name: string; price: number; changePercent: number };

type AlpacaSnapshot = {
  latestTrade?: { p: number };
  dailyBar?: { c: number };
  prevDailyBar?: { c: number };
};

async function fetchSnapshots(
  symbols: string[],
  keyId: string,
  secretKey: string
): Promise<{ ok: true; map: Record<string, AlpacaSnapshot> } | { ok: false; error: string }> {
  try {
    const url = `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols.join(",")}&feed=iex`;
    const res = await fetch(url, {
      headers: {
        "APCA-API-KEY-ID": keyId,
        "APCA-API-SECRET-KEY": secretKey,
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return { ok: false, error: `Upstream returned ${res.status}` };
    }

    const data = await res.json();
    const map: Record<string, AlpacaSnapshot> = data?.snapshots ?? data ?? {};
    return { ok: true, map };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function priceAndChange(snap: AlpacaSnapshot | undefined): { price: number; changePercent: number } | null {
  const price = snap?.latestTrade?.p ?? snap?.dailyBar?.c ?? null;
  const prevClose = snap?.prevDailyBar?.c ?? null;
  if (price == null || prevClose == null || prevClose === 0) return null;
  return { price, changePercent: ((price - prevClose) / prevClose) * 100 };
}

export async function GET() {
  const keyId = process.env.ALPACA_API_KEY_ID;
  const secretKey = process.env.ALPACA_API_SECRET_KEY;

  if (!keyId || !secretKey) {
    const error = "Missing ALPACA_API_KEY_ID / ALPACA_API_SECRET_KEY env vars";
    return Response.json(
      { ok: false, quotes: null, quotesError: error, heroPick: null, heroPickError: error },
      { status: 500 }
    );
  }

  const [stableResult, pennyResult] = await Promise.all([
    fetchSnapshots(STABLE_SYMBOLS, keyId, secretKey),
    fetchSnapshots(PENNY_POOL.map((p) => p.symbol), keyId, secretKey),
  ]);

  // ── Stable ticker-tape quotes ──
  let quotes: Quote[] | null = null;
  let quotesError: string | null = null;
  if (stableResult.ok) {
    quotes = STABLE_SYMBOLS
      .map((symbol) => {
        const pc = priceAndChange(stableResult.map[symbol]);
        return pc ? { symbol, ...pc } : null;
      })
      .filter((q): q is Quote => q !== null);
    if (quotes.length === 0) {
      quotes = null;
      quotesError = "No quotes parsed from response";
    }
  } else {
    quotesError = stableResult.error;
  }

  // ── Daily-rotating sub-$1 hero pick ──
  let heroPick: HeroPick | null = null;
  let heroPickError: string | null = null;
  if (pennyResult.ok) {
    const qualifying: HeroPick[] = PENNY_POOL
      .map(({ symbol, name }) => {
        const pc = priceAndChange(pennyResult.map[symbol]);
        return pc ? { symbol, name, ...pc } : null;
      })
      .filter((q): q is HeroPick => q !== null && q.price < 1.0);

    if (qualifying.length > 0) {
      const dayIndex = Math.floor(Date.now() / 86400000);
      heroPick = qualifying[dayIndex % qualifying.length];
    } else {
      heroPickError = "No sub-$1 candidate currently available";
    }
  } else {
    heroPickError = pennyResult.error;
  }

  return Response.json({
    ok: true,
    quotes,
    quotesError,
    heroPick,
    heroPickError,
    fetchedAt: new Date().toISOString(),
  });
}
