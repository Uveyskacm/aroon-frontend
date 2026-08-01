import { FadeInStagger } from "@/components/motion/FadeInStagger";
import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";
import type { WpMedia } from "@/lib/types/wordpress";

interface FeaturedGridItem {
  id: number;
  href: string;
  title: string;
  description?: string;
  image?: WpMedia | null;
}

interface FeaturedGridProps {
  heading?: string;
  items: FeaturedGridItem[];
  cta?: ReactNode;
}

/** One shared component reused for Featured Catalogs / References / News (Phase 3). */
export function FeaturedGrid({ heading, items, cta }: FeaturedGridProps) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-[clamp(64px,8vw,128px)]">
      <div className="flex items-center justify-between">
        {heading ? <h2 className="text-[length:var(--text-h2)] text-text-primary">{heading}</h2> : null}
        {cta}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FadeInStagger>
          {items.map((item) => (
            <Card
              key={item.id}
              href={item.href}
              title={item.title}
              description={item.description}
              image={item.image ?? undefined}
            />
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
