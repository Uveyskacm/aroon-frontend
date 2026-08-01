interface Featurable {
  featured: boolean;
  featuredOrder: number | null;
  publishedAt?: string;
}

/**
 * Featured-content ordering (Phase 3 resolved decisions §1):
 * 1. featured = true first
 * 2. featuredOrder ascending (unset sorts after set, by publish date desc)
 * 3. Fill remainder with latest-by-date, no duplicates, never short.
 */
export function sortFeaturedFirst<T extends Featurable>(items: T[], count: number): T[] {
  const featured = items
    .filter((i) => i.featured)
    .sort((a, b) => {
      if (a.featuredOrder != null && b.featuredOrder != null) {
        return a.featuredOrder - b.featuredOrder;
      }
      if (a.featuredOrder != null) return -1;
      if (b.featuredOrder != null) return 1;
      return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    });

  const chosen = featured.slice(0, count);
  if (chosen.length >= count) return chosen;

  const rest = items
    .filter((i) => !chosen.includes(i))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return [...chosen, ...rest.slice(0, count - chosen.length)];
}
