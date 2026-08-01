export type Locale = "tr" | "en";

export interface WpMedia {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
  sizes: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    full: string;
  };
}

export interface Seo {
  title: string | null;
  metaDescription: string | null;
  ogImage: { url: string; width: number; height: number } | null;
  canonicalUrl: string | null;
  canonicalIsExplicit: boolean;
  robots: { index: boolean; follow: boolean };
}

export interface Translations {
  [locale: string]: { id: number; slug: string } | undefined;
}

export interface SpecTableRow {
  label: string;
  value: string;
}

export type DownloadType =
  | "technical_datasheet"
  | "certificate"
  | "installation_guide"
  | "cad_drawing"
  | "pdf_catalogue";

export interface DownloadItem {
  type: DownloadType;
  label: string;
  url: string;
  filesize: number;
  filename: string;
  mimeType: string;
}

export interface ProductCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: WpMedia | null;
  count: number;
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  content: string;
  featuredImage: WpMedia | null;
  gallery: WpMedia[];
  category: ProductCategory | null;
  code: string;
  materialType: string;
  sizeOptions: string;
  wallThickness: string;
  length: string;
  surfaceFinish: string;
  useCases: string;
  packagingInfo: string;
  specTable: SpecTableRow[];
  downloads: DownloadItem[];
  relatedCatalogId: number | null;
  seo: Seo;
  translations: Translations;
  lang: Locale;
}

export interface Catalog {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: WpMedia | null;
  pdfUrl: string | null;
  fileSize: number | null;
  lastUpdated: string;
  featured: boolean;
  featuredOrder: number | null;
  seo: Seo;
  translations: Translations;
  lang: Locale;
}

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: WpMedia | null;
  publishedAt: string;
  featured: boolean;
  featuredOrder: number | null;
  seo: Seo;
  translations: Translations;
  lang: Locale;
}

export interface ReferenceItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  featuredImage: WpMedia | null;
  gallery: WpMedia[];
  clientName: string;
  projectLocation: string;
  completionYear: number | null;
  featured: boolean;
  featuredOrder: number | null;
  seo: Seo;
  translations: Translations;
  lang: Locale;
}

export interface ContentPage {
  id: number;
  title: string;
  content: string;
  featuredImage: WpMedia | null;
  seo: Seo;
  translations: Translations;
  lang: Locale;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
}

export interface SiteSettings {
  companyName: string;
  hqAddress: string;
  factoryAddress: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  businessHours: string;
  mapsEmbedUrl: string;
  socialLinks: { platform: string; url: string }[];
  footerBlurb: string;
  foundingYear: number | null;
  productionCapacity: string;
  employeeCount: number | null;
  exportCountries: string[];
  certifications: string[];
  ga4MeasurementId: string | null;
  metaPixelId: string | null;
  searchConsoleTag: string | null;
}

export interface NavItem {
  id: number;
  label: string;
  url: string;
  children: NavItem[];
}

export interface HomeFields {
  hero: {
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    visualMode: "3d" | "image";
    fallbackImage: WpMedia | null;
  };
  intro: {
    eyebrow: string;
    heading: string;
    body: string;
    ctaLabel: string;
  };
  stats: { label: string; value: string }[];
  why: {
    heading: string;
    items: { icon: string; title: string; description: string }[];
  };
  process: {
    heading: string;
    steps: { icon: string; title: string }[];
  };
  featured: {
    catalogsHeading: string;
    catalogsCount: number;
    referencesHeading: string;
    referencesCount: number;
    newsHeading: string;
    newsCount: number;
  };
  cta: {
    heading: string;
    body: string;
    buttonLabel: string;
  };
}
