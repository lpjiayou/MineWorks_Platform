import { findUnit } from "./registry";
import type { UnitQuantity } from "./types";

export function convertUnit(value: number, quantity: UnitQuantity, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {
    return value;
  }
  const from = findUnit(quantity, fromUnit);
  const to = findUnit(quantity, toUnit);
  return to.fromBase(from.toBase(value));
}

export function normalizeUnit(value: number, quantity: UnitQuantity, unit: string): number {
  return findUnit(quantity, unit).toBase(value);
}
