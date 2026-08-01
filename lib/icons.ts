import {
  ShieldCheck,
  Gauge,
  Globe2,
  Award,
  Factory,
  Truck,
  PackageCheck,
  Wrench,
  Ruler,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated, finite subset of Lucide names (Phase 3 resolved §2) — the
 * `icon` field in why_items/process_steps repeaters is a constrained
 * select sourced from these keys only, never a freeform string.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  gauge: Gauge,
  globe: Globe2,
  award: Award,
  factory: Factory,
  truck: Truck,
  "package-check": PackageCheck,
  wrench: Wrench,
  ruler: Ruler,
  "flask-conical": FlaskConical,
};

export function resolveIcon(key: string): LucideIcon | null {
  return ICON_REGISTRY[key] ?? null;
}
