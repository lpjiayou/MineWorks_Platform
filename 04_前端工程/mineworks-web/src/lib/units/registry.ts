import type { UnitDefinition, UnitQuantity } from "./types";

const identity = (value: number): number => value;

export const unitRegistry: Record<UnitQuantity, readonly UnitDefinition[]> = {
  volumeFlow: [
    { id: "m3/h", symbol: "m³/h", quantity: "volumeFlow", baseUnit: "m3/h", precision: 2, toBase: identity, fromBase: identity },
    { id: "L/s", symbol: "L/s", quantity: "volumeFlow", baseUnit: "m3/h", precision: 2, toBase: (value) => value * 3.6, fromBase: (value) => value / 3.6 },
  ],
  massFlow: [
    { id: "t/h", symbol: "t/h", quantity: "massFlow", baseUnit: "t/h", precision: 2, toBase: identity, fromBase: identity },
    { id: "kg/s", symbol: "kg/s", quantity: "massFlow", baseUnit: "t/h", precision: 3, toBase: (value) => value * 3.6, fromBase: (value) => value / 3.6 },
  ],
  density: [
    { id: "t/m3", symbol: "t/m³", quantity: "density", baseUnit: "t/m3", precision: 3, toBase: identity, fromBase: identity },
    { id: "kg/L", symbol: "kg/L", quantity: "density", baseUnit: "t/m3", precision: 3, toBase: identity, fromBase: identity },
    { id: "kg/m3", symbol: "kg/m³", quantity: "density", baseUnit: "t/m3", precision: 1, toBase: (value) => value / 1000, fromBase: (value) => value * 1000 },
  ],
  concentration: [
    { id: "%", symbol: "%", quantity: "concentration", baseUnit: "fraction", precision: 2, toBase: (value) => value / 100, fromBase: (value) => value * 100 },
    { id: "fraction", symbol: "fraction", quantity: "concentration", baseUnit: "fraction", precision: 4, toBase: identity, fromBase: identity },
  ],
};

export function findUnit(quantity: UnitQuantity, unitId: string): UnitDefinition {
  const definition = unitRegistry[quantity].find((item) => item.id === unitId);
  if (!definition) {
    throw new Error(`Unsupported unit "${unitId}" for quantity "${quantity}".`);
  }
  return definition;
}
