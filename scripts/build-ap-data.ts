import { existsSync, writeFileSync } from "node:fs";
import XLSX from "xlsx";

import { AP_CENTERS, AP_CENTER_COORDINATES } from "../src/data/ap-centers";

// ---------------------------------------------------------------------------
// Incremental builder for src/data/ap-centers.ts.
//
// Reads AP location sheets (same column layout each:
// School, Address, City, Location link, Lat, Lng) and merges them with the
// centers already generated:
//
//   - public/جدول بيانات بدون عنوان.xlsx — Egypt
//   - public/جدول بيانات بدون عنوان (1).xlsx — Saudi Arabia (missing after
//     its centers were first generated; those rows are carried over as-is so
//     never lose previously generated centers when their sheet is removed).
//
// Codes are stable: rows whose source sheet still exists keep their generated
// code; brand-new rows get the next free code (900001, 900002, …), and carried
// over centers (missing source sheet) reuse their existing code.
// ---------------------------------------------------------------------------

// Rows whose coordinates were copy/pasted from another school in the sheet.
// The sheet is otherwise used verbatim. Remove an entry once the sheet itself
// is corrected.
const OVERRIDES: Record<string, { link: string; lat: number; lng: number }> = {
  "Riyadh Schools for Boys and Girls": {
    link: "https://maps.app.goo.gl/6XMF5vmBTBX7tACh9",
    lat: 24.6583445,
    lng: 46.6917818,
  },
  "Cairo American College": {
    link: "https://maps.app.goo.gl/iyT19FdDgaPMvCDj8",
    lat: 29.9587901,
    lng: 31.2748515,
  },
  "Dar El Tarbiah Language School-American Division": {
    link: "https://maps.app.goo.gl/EUHhH86rrqdxoGWPA",
    lat: 30.0625938,
    lng: 31.2231827,
  },
  "International School of Choueifat Cairo": {
    link: "https://maps.app.goo.gl/VohMhyddFTxEBRS7A",
    lat: 30.0019185,
    lng: 31.4072483,
  },
  "Kayan International College": {
    link: "https://maps.app.goo.gl/5s2fkKainLewqn2A6",
    lat: 30.0557943,
    lng: 31.4556911,
  },
};

const SOURCES: Array<{ file: string; country: string }> = [
  { file: "public/جدول بيانات بدون عنوان.xlsx", country: "eg" },
  { file: "public/جدول بيانات بدون عنوان (1).xlsx", country: "sa" },
];

const CODE_BASE = 900000;

type CenterSeed = {
  code: string;
  name: string;
  address: string;
  country: string;
  city: string | null;
  test: string;
  link: string;
};

const existingByName = new Map<string, { center: CenterSeed; coords: { lat: number; lng: number } | undefined }>();
let maxExistingCode = CODE_BASE;
for (const center of AP_CENTERS) {
  existingByName.set(center.name, {
    center: center as CenterSeed,
    coords: AP_CENTER_COORDINATES[center.code],
  });
  const num = Number(center.code);
  if (!isNaN(num) && num > maxExistingCode) maxExistingCode = num;
}

const q = (v: string) => JSON.stringify(v);

const seenInSheets = new Set<string>();
const centerLines: string[] = [];
const coordLines: string[] = [];
let newCount = 0;
let skipped = 0;

for (const source of SOURCES) {
  if (!existsSync(source.file)) {
    console.log(`Skipping missing source: ${source.file}`);
    continue;
  }

  const wb = XLSX.readFile(source.file);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];

  for (const raw of rows) {
    const cells = raw.map((c) => String(c ?? "").trim());
    const [name, address, city, link, latRaw, lngRaw] = cells;

    if (!name || /^School$/i.test(name)) continue;
    if (!/^https?:\/\//.test(link)) continue;

    const lat = parseFloat(latRaw);
    const lng = parseFloat(lngRaw);
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`Skipping row without coordinates: ${name} (${source.country})`);
      skipped++;
      continue;
    }

    seenInSheets.add(name);
    const override = OVERRIDES[name];
    const coords = override ?? { lat, lng };
    const linkFinal = override?.link ?? link;

    const previous = existingByName.get(name);
    const code =
      previous?.center.code ?? String(CODE_BASE + ++newCount + (maxExistingCode - CODE_BASE));

    centerLines.push(
      `  { code: ${q(code)}, name: ${q(name)}, address: ${q(address)}, country: ${q(
        source.country
      )}, city: ${q(city)}, test: "ap", link: ${q(linkFinal)} },`
    );
    coordLines.push(`  ${q(code)}: { lat: ${coords.lat}, lng: ${coords.lng} },`);
  }
}

// Carry over centers whose source sheet no longer exists so we never lose
// previously generated data (e.g. the Saudi sheet was removed after seeding).
for (const [name, { center }] of existingByName) {
  if (seenInSheets.has(name)) continue;
  const coords = existingByName.get(name)?.coords;
  if (!coords) {
    console.warn(`Carry-over skipped (no coordinates): ${name}`);
    continue;
  }
  centerLines.push(
    `  { code: ${q(center.code)}, name: ${q(center.name)}, address: ${q(
      center.address
    )}, country: ${q(center.country)}, city: ${q(center.city ?? "")}, test: "ap", link: ${q(
      center.link
    )} },`
  );
  coordLines.push(
    `  ${q(center.code)}: { lat: ${coords.lat}, lng: ${coords.lng} },`
  );
}

const src = `// Generated by scripts/build-ap-data.ts — do not edit by hand.
// Sources:
//   public/جدول بيانات بدون عنوان.xlsx — Egypt (${existsSync(SOURCES[0].file) ? "loaded" : "missing"})
//   public/جدول بيانات بدون عنوان (1).xlsx — Saudi Arabia (${
  existsSync(SOURCES[1].file) ? "loaded" : "missing, carried over from previous runs"
})
import type { TestCenterSeed } from "@/data/test-centers";

export const AP_CENTERS: TestCenterSeed[] = [
${centerLines.join("\n")}
];

export const AP_CENTER_COORDINATES: Record<string, { lat: number; lng: number }> = {
${coordLines.join("\n")}
};
`;

writeFileSync("src/data/ap-centers.ts", src, "utf8");
console.log(
  `AP centers written: ${centerLines.length} (${existingByName.size} carried over) · new: ${newCount} · skipped: ${skipped}`
);