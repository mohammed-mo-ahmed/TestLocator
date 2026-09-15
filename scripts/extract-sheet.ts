import { writeFileSync } from "node:fs";
import XLSX from "xlsx";

type Row = {
  country: "EG" | "SA";
  name: string;
  city: string;
  address: string;
  code: string;
  avail: [string, string, string];
  link: string;
};

const wb = XLSX.readFile("public/جدول بيانات بدون عنوان.xlsx");

function parseSheet(sheet: XLSX.Sheet | undefined, country: "EG" | "SA"): Row[] {
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
  const out: Row[] = [];
  for (const raw of rows) {
    const cells = raw.map((c) => String(c ?? "").trim());

    if (country === "SA") {
      const [name, city, address, code, oct, nov, dec, link] = cells;
      if (/رمز المركز|قسم/.test(cells[3] ?? "")) continue;
      if (!/^\d+$/.test(code)) continue;
      if (!/^https?:\/\//.test(link)) continue;
      out.push({ country, name, city, address, code, avail: [oct, nov, dec], link });
    } else {
      const [name, address, code, oct, nov, dec, link] = cells;
      if (!/^\d+$/.test(code)) continue;
      if (!/^https?:\/\//.test(link)) continue;
      const isHeaderText = (v: string) => /حالة المقعد/.test(v);
      out.push({
        country,
        name,
        city: "",
        address,
        code,
        avail: [oct, nov, dec].map((v) => (isHeaderText(v) ? "متاح" : v)) as [
          string,
          string,
          string,
        ],
        link,
      });
    }
  }
  return out;
}

const eg = parseSheet(wb.Sheets[wb.SheetNames[0]], "EG");
const sa = parseSheet(wb.Sheets[wb.SheetNames[1]], "SA");

const all = eg.concat(sa);
writeFileSync("scripts/sheet-data.json", JSON.stringify(all, null, 1), "utf8");
console.log(`EG: ${eg.length}, SA: ${sa.length}, total: ${all.length}`);

const uniqueCodes = new Set(all.map((r) => r.code));
console.log(`unique codes: ${uniqueCodes.size}`);

const statuses = new Set(all.flatMap((r) => r.avail));
console.log(`status values: ${[...statuses].join(", ")}`);

for (const r of all.slice(0, 2).concat(all.slice(-1))) {
  console.log(JSON.stringify(r));
}