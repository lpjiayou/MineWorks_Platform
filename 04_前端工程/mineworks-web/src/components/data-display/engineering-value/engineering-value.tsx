import { formatEngineeringNumber } from "@/lib/format/engineering-number";
import styles from "./engineering-value.module.css";

export type EngineeringValueProps = {
  value: number | null | undefined;
  unit: string;
  precision?: number;
  label?: string;
  emphasize?: boolean;
};

export function EngineeringValue({ value, unit, precision = 2, label, emphasize = false }: EngineeringValueProps) {
  return <span className={emphasize ? styles.emphasize : styles.value}>{label && <span className={styles.label}>{label}</span>}<span className={styles.number}>{formatEngineeringNumber(value, { precision })}</span><span className={styles.unit}>{unit}</span></span>;
}
