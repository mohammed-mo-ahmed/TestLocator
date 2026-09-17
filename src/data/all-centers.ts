import { AP_CENTERS, AP_CENTER_COORDINATES } from "@/data/ap-centers";
import { TEST_CENTERS } from "@/data/test-centers";
import { TEST_CENTER_COORDINATES } from "@/data/test-center-coordinates";

/**
 * Every seeded center across all exams. Each center carries the exam it
 * belongs to (`test`), defaulting to "sat", so tests can be scoped without
 * mixing SAT and AP centers.
 */
export const ALL_CENTERS = [...TEST_CENTERS, ...AP_CENTERS];

export const ALL_CENTER_COORDINATES: Record<string, { lat: number; lng: number }> = {
  ...TEST_CENTER_COORDINATES,
  ...AP_CENTER_COORDINATES,
};