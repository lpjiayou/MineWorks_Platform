export type EngineeringNumberOptions = {
  precision?: number;
  useGrouping?: boolean;
  locale?: string;
  nullDisplay?: string;
  nanDisplay?: string;
};

export function formatEngineeringNumber(
  value: number | null | undefined,
  options: EngineeringNumberOptions = {},
): string {
  const {
    precision = 2,
    useGrouping = true,
    locale = "zh-CN",
    nullDisplay = "—",
    nanDisplay = "计算错误",
  } = options;

  if (value === null || value === undefined) {
    return nullDisplay;
  }

  if (!Number.isFinite(value)) {
    return nanDisplay;
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping,
  }).format(value);
}
