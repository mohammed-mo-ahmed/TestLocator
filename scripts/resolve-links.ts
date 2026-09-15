import { readFileSync, writeFileSync, existsSync } from "node:fs";

type SheetRow = {
  country: "EG" | "SA";
  name: string;
  city: string;
  address: string;
  code: string;
  avail: [string, string, string];
  link: string;
};

type Coords = { lat: number; lng: number };

const data: SheetRow[] = JSON.parse(readFileSync("scripts/sheet-data.json", "utf8"));
const cacheFile = "scripts/coords-cache.json";
const cache: Record<string, Coords | null> = existsSync(cacheFile)
  ? JSON.parse(readFileSync(cacheFile, "utf8"))
  : {};

function extractCoords(url: string): Coords | null {
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return { lat: Number(at[1]), lng: Number(at[2]) };

  const dll4 = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dll4) return { lat: Number(dll4[1]), lng: Number(dll4[2]) };

  const ll = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (ll) return { lat: Number(ll[1]), lng: Number(ll[2]) };

  const q = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (q) return { lat: Number(q[1]), lng: Number(q[2]) };

  return null;
}

async function resolve(link: string): Promise<Coords | null> {
  if (link in cache) return cache[link];
  try {
    const res = await fetch(link, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 TestLocator" },
    });
    const coords = extractCoords(res.url);
    cache[link] = coords;
    return coords;
  } catch {
    try {
      const res = await fetch(link, {
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      const coords = extractCoords(res.url);
      cache[link] = coords;
      return coords;
    } catch {
      cache[link] = null;
      return null;
    }
  }
}

async function run() {
  const pending = data.filter((row) => !(row.link in cache));
  console.log(`total: ${data.length}, pending: ${pending.length}, cached: ${data.length - pending.length}`);

  const queue = [...pending];
  const workers = Array.from({ length: 5 }, async () => {
    while (queue.length > 0) {
      const row = queue.shift()!;
      const coords = await resolve(row.link);
      console.log(`${coords ? "OK " : "FAIL"} ${row.code} ${row.name}`);
    }
  });
  await Promise.all(workers);

  writeFileSync(cacheFile, JSON.stringify(cache, null, 1), "utf8");
  const failed = data.filter((row) => cache[row.link] === undefined || cache[row.link] === null);
  console.log(`\nfailed or unresolved: ${failed.length}`);
  for (const row of failed) console.log(`  ${row.code} ${row.name} ${row.link}`);
}

run();