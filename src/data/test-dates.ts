import type { TestInfo } from "@/lib/types";

/**
 * SAT administrations covered by the user-provided availability sheet
 * (October / November / December). Must stay in sync with the sheet's
 * column order (scripts/sheet-data.json `avail` array).
 */
export const SAT_DATES = ["2026-10-03", "2026-11-07", "2026-12-05"];

/**
 * Test catalog. `available: false` keeps the card disabled (Coming soon)
 * while the data model stays ready for future tests.
 */
export const TESTS: TestInfo[] = [
  {
    code: "sat",
    available: true,
    dates: SAT_DATES,
  },
  {
    code: "act",
    available: false,
    dates: ["2026-11-14", "2026-12-12", "2027-02-06"],
  },
  {
    code: "ielts",
    available: false,
    dates: [],
  },
  {
    code: "toefl",
    available: false,
    dates: [],
  },
];

export function getTestByCode(code: string): TestInfo | undefined {
  return TESTS.find((test) => test.code === code);
}