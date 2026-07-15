export type UnitQuantity = "volumeFlow" | "massFlow" | "density" | "concentration";

export type UnitDefinition = {
  id: string;
  symbol: string;
  quantity: UnitQuantity;
  baseUnit: string;
  precision: number;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

export type UnitValue = {
  value: number | null;
  unit: string;
};
