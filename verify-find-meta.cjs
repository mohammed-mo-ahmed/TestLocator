const fs = require("fs");
const path = require("path");

const ROOT = "D:/Projects/test-center-finder/src";
const MSG = path.join(ROOT, "messages");
const SRC_ROUTE = path.join(ROOT, "app/[locale]/find/page.tsx");

const CANDIDATES = [
  "meta.title",
  "meta.description",
  "meta.find.title",
  "meta.find.description",
];

const src = fs.readFileSync(SRC_ROUTE, "utf8");
const used = new Set();
const reCall = /\bt\(["'`]([^"'`]+)["'`]/g;
let m;
while ((m = reCall.exec(src)) !== null) {
  const k = m[1].trim();
  if (k.startsWith("meta.")) used.add(k);
}

console.log("meta.* keys referenced in find/page.tsx:");
for (const k of [...used].sort()) console.log("  -", katex);
console.log("");

const locales = fs.readdirSync(MSG).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();

let bad = 0;
for (const loc of locales) {
  const j = JSON.parse(fs.readFileSync(path.join(MSG, `${loc}.json`), "utf8"));
  const rows = [];
  for (const k of [...used].sort()) {
    const val = k.split(".").reduce((o, p) => (o == null ? null : o[p]), j);
    rows.push(`${k}: ${val == null ? "MISSING" : "ok"}`);
  }
  const missing = rows.filter((r) => r.includes("MISSING")).length;
  if (missing) bad++;
  console.log(`${loc.padEnd(5)} ${missing ? "MISSING " + missing : "OK      "} | ${rows.join(" | ")}`);
}

console.log("");
console.log(bad ? `RESULT: FAIL (${bad} locale(s) with missing meta.find keys)` : "RESULT: ALL 10 LOCALES HAVE meta.find.title + meta.find.description ✅");
process.exit(bad ? 1 : 0);
