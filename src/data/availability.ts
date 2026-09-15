import { TEST_AVAILABILITY } from "@/data/test-availability";

/**
 * Builds the availability schedule for a test.
 *
 * Mirrors the user-provided sheet exactly: 1 = متاح, 0 = غير متاح. Missing
 * sheet entries default to available (1) rather than inventing a seat count.
 */
export function buildSchedule(
  testCode: string,
  dates: string[],
  centerCodes: string[]
): Record<string, Record<string, number>> {
  const centers: Record<string, Record<string, number>> = {};
  for (const centerCode of centerCodes) {
    const schedule: Record<string, number> = {};
    for (const date of dates) {
      const sheet = TEST_AVAILABILITY[centerCode]?.[date];
      schedule[date] = sheet !== undefined ? sheet : 1;
    }
    centers[centerCode] = schedule;
  }
  return centers;
}