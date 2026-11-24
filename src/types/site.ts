export type SectionType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'split'
  | 'metrics'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'footer';

export type SurfaceTone = 'canvas' | 'subtle' | 'contrast' | 'accent';
export type PaddingScale = 'sm' | 'md' | 'lg';
export type RadiusScale = 'none' | 'sm' | 'md' | 'lg';
export type SpacingDensity = 'compact' | 'comfortable' | 'airy';
export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type ExportFramework = 'html' | 'react' | 'nextjs' | 'astro';
export type HostingPlatform = 'vercel' | 'netlify' | 'cloudflare' | 'github-pages';

export interface SectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  value?: string;
  meta?: string;
  href?: string;
  ctaLabel?: string;
  featured?: boolean;
  bullets?: string[];
}

export interface SectionContent {
  brandName?: string;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  image?: string;
  imageAlt?: string;
  copyright?: string;
  items: SectionItem[];
}

export interface SectionCustomCode {
  htmlId: string;
  className: string;
  customCss: string;
}

export interface SiteSection {
  id: string;
  type: SectionType;
  name: string;
  visible: boolean;
  variant: string;
  surface: SurfaceTone;
  padding: PaddingScale;
  align: 'left' | 'center';
  content: SectionContent;
  customCode: SectionCustomCode;
}

export interface SiteTheme {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  displayFont: string;
  bodyFont: string;
  radius: RadiusScale;
  spacing: SpacingDensity;
}

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  sections: SiteSection[];
}

export interface SiteAsset {
  id: string;
  name: string;
  src: string;
  kind: 'illustration' | 'uploaded';
  aspect: string;
}

export interface GlobalCustomCode {
  headHtml: string;
  customCss: string;
  bodyScript: string;
}

export interface SiteSourceInfo {
  type: 'template' | 'url' | 'files';
  origin?: string;
  rebuiltAt?: string;
}

export interface SiteProject {
  id: string;
  name: string;
  domain: string;
  description: string;
  theme: SiteTheme;
  pages: SitePage[];
  assets: SiteAsset[];
  globalCode: GlobalCustomCode;
  sourceInfo?: SiteSourceInfo;
}

export interface GeneratedFile {
  path: string;
  language: 'html' | 'css' | 'typescript' | 'javascript' | 'json' | 'yaml' | 'toml' | 'markdown' | 'astro' | 'text';
  content: string;
}

export interface HostingStatus {
  vercel: boolean;
  netlify: boolean;
  cloudflare: boolean;
}

export interface SavedComponent {
  id: string;
  name: string;
  category: SectionType;
  sourceProject: string;
  savedAt: string;
  section: SiteSection;
}

