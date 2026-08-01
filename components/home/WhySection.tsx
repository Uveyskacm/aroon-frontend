import { FadeInStagger } from "@/components/motion/FadeInStagger";
import { resolveIcon } from "@/lib/icons";
import type { HomeFields } from "@/lib/types/wordpress";

export function WhySection({ why }: { why: HomeFields["why"] }) {
  if (!why.items.length) return null;

  return (
    <section className="bg-surface-alt py-[clamp(64px,8vw,128px)]">
      <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)]">
        {why.heading ? (
          <h2 className="text-[length:var(--text-h2)] text-text-primary">{why.heading}</h2>
        ) : null}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FadeInStagger>
            {why.items.map((item, i) => {
              const Icon = resolveIcon(item.icon);
              return (
                <div
                  key={i}
                  className="rounded-[var(--radius-md)] bg-surface-page p-6 shadow-[var(--shadow-elevation-1)]"
                >
                  {Icon ? (
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-surface-accent">
                      <Icon aria-hidden size={22} className="text-accent-primary" />
                    </div>
                  ) : null}
                  <h3 className="text-[length:var(--text-h4)] text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-[length:var(--text-body-sm)] text-text-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
