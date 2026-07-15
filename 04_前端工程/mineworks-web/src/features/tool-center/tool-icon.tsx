import {
  BookOpenText,
  Building2,
  Cable,
  Calculator,
  ChartNoAxesCombined,
  Cpu,
  Database,
  Droplets,
  Factory,
  FlaskConical,
  Gauge,
  Mountain,
  MoveRight,
  Scale,
  Settings2,
  SlidersHorizontal,
  Waves,
  Wind,
  Workflow,
  Zap,
} from "lucide-react";
import type { ToolIconName } from "./types";

const icons = {
  calculator: Calculator,
  droplets: Droplets,
  scale: Scale,
  workflow: Workflow,
  chart: ChartNoAxesCombined,
  flask: FlaskConical,
  gauge: Gauge,
  settings: Settings2,
  cpu: Cpu,
  cable: Cable,
  zap: Zap,
  pump: Waves,
  conveyor: MoveRight,
  book: BookOpenText,
  mountain: Mountain,
  wind: Wind,
  building: Building2,
  database: Database,
} satisfies Record<ToolIconName, typeof Calculator>;

export function ToolIcon({ name, size = 22 }: { name: ToolIconName; size?: number }) {
  const Icon = icons[name] ?? Factory;
  return <Icon size={size} aria-hidden="true" />;
}

export function DisciplineIcon({ id, size = 20 }: { id: string; size?: number }) {
  const Icon = id === "mineral-processing" ? SlidersHorizontal : id === "automation" ? Cpu : id === "electrical" ? Zap : id === "mining" ? Mountain : id === "equipment" ? Settings2 : id === "civil" ? Building2 : id === "general" ? Database : Factory;
  return <Icon size={size} aria-hidden="true" />;
}
