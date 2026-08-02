import { clsx } from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import type { WpMedia } from "@/lib/types/wordpress";

interface CardProps {
  href: string;
  image?: WpMedia | null;
  eyebrow?: string;
  title: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  /** Set when `href` points straight at a file (e.g. a catalog PDF) rather than another page — prompts a save-to-disk instead of navigating. */
  download?: boolean;
}

/** One shared card primitive reused by Product/Catalog/News/Reference cards (Phase 2 §6). */
export function Card({ href, image, eyebrow, title, description, footer, className, download }: CardProps) {
  return (
    <a
      href={href}
      download={download}
      {...(download ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={clsx(
        "group flex flex-col overflow-hidden rounded-[var(--radius-md)] bg-surface-page",
        "shadow-[var(--shadow-elevation-1)] transition-all duration-[var(--motion-base)] ease-[var(--ease-confident)]",
        "hover:-translate-y-1 hover:shadow-[var(--shadow-elevation-2)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-surface-alt">
        {image ? (
          <Image
            src={image.sizes.medium ?? image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {eyebrow ? (
          <span className="text-[length:var(--text-caption)] font-medium uppercase tracking-[0.04em] text-text-muted">
            {eyebrow}
          </span>
        ) : null}
        <h3 className="text-[length:var(--text-h4)] text-text-primary">{title}</h3>
        {description ? (
          <p className="line-clamp-2 text-[length:var(--text-body-sm)] text-text-muted">{description}</p>
        ) : null}
        {footer ? <div className="mt-auto pt-3">{footer}</div> : null}
      </div>
    </a>
  );
}
