import type { SectionType, SiteSection } from '../types/site';
import { BUILTIN_ASSETS } from './starters';

export interface SectionTemplate {
  id: string;
  name: string;
  category: SectionType;
  summary: string;
  section: Omit<SiteSection, 'id'>;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  // --- HEROES ---
  {
    id: 'tpl-hero-editorial-split',
    name: 'Editorial Split Hero',
    category: 'hero',
    summary: 'Asymmetric copy and showcase media for studios and agencies.',
    section: {
      type: 'hero',
      name: 'Editorial Split Hero',
      visible: true,
      variant: 'split',
      surface: 'canvas',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'hero', className: '', customCss: '' },
      content: {
        eyebrow: 'Architecture & Brand Systems · Est. 2018',
        headline: 'Digital flagships engineered for clarity and lasting authority',
        subheadline:
          'We partner with founders and design leaders to modernize legacy web properties into fast, maintainable design systems.',
        primaryCtaLabel: 'Start a Project',
        primaryCtaHref: '#contact',
        secondaryCtaLabel: 'View Case Studies',
        secondaryCtaHref: '#work',
        image: BUILTIN_ASSETS[0].src,
        imageAlt: 'Architectural pavilion elevation overlooking calm water',
        items: [],
      },
    },
  },
  {
    id: 'tpl-hero-saas-centered',
    name: 'Centered Product Launch',
    category: 'hero',
    summary: 'Balanced centered headline stacked above a full-width product showcase.',
    section: {
      type: 'hero',
      name: 'Product Launch Hero',
      visible: true,
      variant: 'centered',
      surface: 'subtle',
      padding: 'lg',
      align: 'center',
      customCode: { htmlId: 'hero', className: '', customCss: '' },
      content: {
        eyebrow: 'Release 2026 · Global Edge Infrastructure',
        headline: 'Ship production telemetry across 34 regions in five minutes',
        subheadline:
          'Capture full-fidelity traces, real user latency, and deployment regressions without per-seat pricing surprises.',
        primaryCtaLabel: 'Start Free Trial',
        primaryCtaHref: '#pricing',
        secondaryCtaLabel: 'Explore Documentation',
        secondaryCtaHref: '#features',
        image: BUILTIN_ASSETS[2].src,
        imageAlt: 'Cloud telemetry dashboard displaying global P95 latency and cache hit ratio',
        items: [],
      },
    },
  },
  {
    id: 'tpl-hero-contrast-studio',
    name: 'High-Contrast Studio Hero',
    category: 'hero',
    summary: 'Deep contrast statement header for product unveils and portfolios.',
    section: {
      type: 'hero',
      name: 'Contrast Statement Hero',
      visible: true,
      variant: 'split',
      surface: 'contrast',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'hero', className: '', customCss: '' },
      content: {
        eyebrow: 'Industrial & Digital Craft',
        headline: 'Precision tools designed for teams that measure every millisecond',
        subheadline:
          'Clean hardware-grade typography, resilient static output, and direct deployment pipelines built for modern product launches.',
        primaryCtaLabel: 'Request Access',
        primaryCtaHref: '#contact',
        secondaryCtaLabel: 'See Pricing',
        secondaryCtaHref: '#pricing',
        image: BUILTIN_ASSETS[1].src,
        imageAlt: 'Architectural floor plan technical drawing',
        items: [],
      },
    },
  },

  // --- PRICING TABLES ---
  {
    id: 'tpl-pricing-saas-3col',
    name: 'Transparent SaaS Pricing',
    category: 'pricing',
    summary: 'Three-tier software pricing with concrete usage limits and featured Growth plan.',
    section: {
      type: 'pricing',
      name: 'SaaS Pricing Table',
      visible: true,
      variant: 'grid-3',
      surface: 'canvas',
      padding: 'lg',
      align: 'center',
      customCode: { htmlId: 'pricing', className: '', customCss: '' },
      content: {
        eyebrow: 'Pricing',
        headline: 'Predictable tiers built for growing teams',
        subheadline:
          'Every plan includes unlimited collaborators, SSL certificates, and clean code exports with no hidden seat fees.',
        items: [
          {
            id: 'tp-s-1',
            title: 'Starter',
            subtitle: 'For independent creators and prototypes',
            value: '$0 / mo',
            ctaLabel: 'Start Free',
            href: '#contact',
            bullets: [
              'Up to 3 active projects',
              '100 GB monthly bandwidth',
              'Static HTML & ZIP code export',
              'Community support forum',
            ],
          },
          {
            id: 'tp-s-2',
            title: 'Growth',
            subtitle: 'For scaling product and marketing teams',
            value: '$79 / mo',
            featured: true,
            ctaLabel: 'Start 14-Day Trial',
            href: '#contact',
            bullets: [
              'Unlimited projects & custom domains',
              '2 TB global edge bandwidth',
              'React, Next.js & Astro code export',
              'Priority engineering support (4h SLA)',
            ],
          },
          {
            id: 'tp-s-3',
            title: 'Enterprise',
            subtitle: 'For regulated multi-brand organizations',
            value: 'Custom',
            ctaLabel: 'Contact Sales',
            href: '#contact',
            bullets: [
              'Dedicated EU & US data residency',
              'SAML SSO & role-based permissions',
              'Custom design-system governance',
              '99.99% contractual uptime SLA',
            ],
          },
        ],
      },
    },
  },
  {
    id: 'tpl-pricing-agency-retainer',
    name: 'Studio & Agency Retainers',
    category: 'pricing',
    summary: 'Service engagement tiers structured around clear scope and deliverables.',
    section: {
      type: 'pricing',
      name: 'Engagement Retainers',
      visible: true,
      variant: 'grid-3',
      surface: 'subtle',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'retainers', className: '', customCss: '' },
      content: {
        eyebrow: 'Engagements',
        headline: 'Structured partnerships with fixed monthly cadence',
        subheadline:
          'Senior principals work directly inside your repository and design files with weekly milestone deliveries.',
        items: [
          {
            id: 'tp-a-1',
            title: 'Site Modernization Sprint',
            subtitle: 'For teams refreshing a legacy web presence',
            value: '$6,500',
            ctaLabel: 'Book 2-Week Sprint',
            href: '#contact',
            bullets: [
              'Full audit of existing site architecture',
              'Up to 6 responsive page templates',
              'Production React or static deployment',
            ],
          },
          {
            id: 'tp-a-2',
            title: 'Embedded Product Partner',
            subtitle: 'For ongoing design & frontend velocity',
            value: '$9,800 / mo',
            featured: true,
            ctaLabel: 'Reserve Quarterly Slot',
            href: '#contact',
            bullets: [
              'Dedicated staff designer & engineer',
              'Shared component library maintenance',
              'Weekly async reviews & live staging builds',
            ],
          },
          {
            id: 'tp-a-3',
            title: 'Advisory Retainer',
            subtitle: 'For leadership teams needing technical oversight',
            value: '$3,200 / mo',
            ctaLabel: 'Schedule Intro Call',
            href: '#contact',
            bullets: [
              'Bi-weekly architecture & UX critiques',
              'Performance & accessibility audits',
              'Direct Slack access to studio partners',
            ],
          },
        ],
      },
    },
  },
  {
    id: 'tpl-pricing-contrast-membership',
    name: 'Dark Contrast Membership',
    category: 'pricing',
    summary: 'High-contrast subscription table for clubs, products, or curated goods.',
    section: {
      type: 'pricing',
      name: 'Membership Tiers',
      visible: true,
      variant: 'grid-3',
      surface: 'contrast',
      padding: 'lg',
      align: 'center',
      customCode: { htmlId: 'membership', className: '', customCss: '' },
      content: {
        eyebrow: 'Membership',
        headline: 'Choose your seasonal allocation',
        subheadline: 'Pause, adjust cadence, or cancel from your member ledger at any time.',
        items: [
          {
            id: 'tp-m-1',
            title: 'Quarterly Edition',
            subtitle: 'Curated seasonal release four times a year',
            value: '$48 / quarter',
            ctaLabel: 'Join Quarterly',
            href: '#contact',
            bullets: ['2 seasonal small-batch selections', 'Printed provenance dossier', 'Standard tracked delivery'],
          },
          {
            id: 'tp-m-2',
            title: 'Collector Dispatch',
            subtitle: 'Monthly priority access to limited micro-lots',
            value: '$34 / mo',
            featured: true,
            ctaLabel: 'Join Collector',
            href: '#contact',
            bullets: ['First access to numbered releases', 'Complimentary express shipping', 'Invitations to private tastings'],
          },
          {
            id: 'tp-m-3',
            title: 'Studio Partner',
            subtitle: 'Recurring standing order for offices & cafes',
            value: '$185 / mo',
            ctaLabel: 'Inquire Wholesale',
            href: '#contact',
            bullets: ['10 lbs freshly roasted monthly', 'Equipment calibration consultation', 'Dedicated account coordinator'],
          },
        ],
      },
    },
  },

  // --- TESTIMONIALS ---
  {
    id: 'tpl-testimonials-b2b-outcomes',
    name: 'Executive Outcomes Grid',
    category: 'testimonials',
    summary: 'Attributable client testimonials anchored by concrete before-and-after outcomes.',
    section: {
      type: 'testimonials',
      name: 'Client Outcomes',
      visible: true,
      variant: 'grid-2',
      surface: 'canvas',
      padding: 'md',
      align: 'left',
      customCode: { htmlId: 'testimonials', className: '', customCss: '' },
      content: {
        eyebrow: 'Customer Stories',
        headline: 'Verified outcomes from teams that made the switch',
        items: [
          {
            id: 'tt-1',
            description:
              'We imported our eight-year-old corporate site, rebuilt the layout in one afternoon, and pushed clean Next.js code straight to Vercel. Qualified demo requests rose 44% within 60 days.',
            title: 'Claire Beaumont',
            subtitle: 'VP of Marketing, Halcyon Freight',
          },
          {
            id: 'tt-2',
            description:
              'Previously our marketing pages carried 4 MB of plugin scripts and failed mobile Core Web Vitals. Moving to exported static sections brought median load time down to 190 milliseconds.',
            title: 'Devon Takahashi',
            subtitle: 'Principal Frontend Engineer, Stratos Bio',
          },
        ],
      },
    },
  },
  {
    id: 'tpl-testimonials-contrast-editorial',
    name: 'Contrast Editorial Quotes',
    category: 'testimonials',
    summary: 'Dark surface testimonial showcase tailored for consultancies and studios.',
    section: {
      type: 'testimonials',
      name: 'Partner Perspectives',
      visible: true,
      variant: 'grid-2',
      surface: 'contrast',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'perspectives', className: '', customCss: '' },
      content: {
        eyebrow: 'Partner Reflections',
        headline: 'Built on clarity, craft, and repeatable delivery',
        items: [
          {
            id: 'ttc-1',
            description:
              'Every design review was grounded in real working pages rather than static mockups. We cut our launch timeline from fourteen weeks to three.',
            title: 'Nadia Okafor',
            subtitle: 'Founder & CEO, Luma Financial',
          },
          {
            id: 'ttc-2',
            description:
              'Having clean semantic exports meant our internal engineers owned the codebase from day one with zero proprietary runtime overhead.',
            title: 'Soren Lindqvist',
            subtitle: 'Head of Engineering, Nordisk Grid',
          },
        ],
      },
    },
  },

  // --- FAQS ---
  {
    id: 'tpl-faq-technical-security',
    name: 'Technical & Security FAQ',
    category: 'faq',
    summary: 'Concise engineering and compliance answers for SaaS evaluation pages.',
    section: {
      type: 'faq',
      name: 'Technical FAQ',
      visible: true,
      variant: 'list',
      surface: 'subtle',
      padding: 'md',
      align: 'left',
      customCode: { htmlId: 'faq', className: '', customCss: '' },
      content: {
        eyebrow: 'Frequently Asked Questions',
        headline: 'Architecture, hosting, and code ownership',
        items: [
          {
            id: 'tfq-1',
            title: 'Do we own the exported source code without vendor lock-in?',
            description:
              'Yes. Every export produces clean, standard HTML/CSS, React, Next.js, or Astro source files with zero proprietary scripts or runtime dependencies.',
          },
          {
            id: 'tfq-2',
            title: 'Which hosting providers are supported out of the box?',
            description:
              'Bundles include pre-configured deployment manifests for Vercel, Netlify, Cloudflare Pages, and GitHub Pages, or can be hosted on any static CDN or container.',
          },
          {
            id: 'tfq-3',
            title: 'How does migration from an existing website work?',
            description:
              'Provide your live URL or upload your existing HTML, CSS, and asset files. Content, structure, and links are parsed and mapped into responsive sections you can customize visually.',
          },
          {
            id: 'tfq-4',
            title: 'Can our engineering team add custom CSS and analytics scripts?',
            description:
              'Both per-section CSS overrides and global head/script injections are supported directly in the inspector and preserved cleanly across every export format.',
          },
        ],
      },
    },
  },
  {
    id: 'tpl-faq-client-onboarding',
    name: 'Studio & Client FAQ',
    category: 'faq',
    summary: 'Project timelines, pricing cadence, and revision clarity for service businesses.',
    section: {
      type: 'faq',
      name: 'Client FAQ',
      visible: true,
      variant: 'list',
      surface: 'canvas',
      padding: 'md',
      align: 'left',
      customCode: { htmlId: 'client-faq', className: '', customCss: '' },
      content: {
        eyebrow: 'Working Together',
        headline: 'Questions before starting a commission',
        items: [
          {
            id: 'cfq-1',
            title: 'What is the typical timeline from kickoff to launch?',
            description:
              'Focused site modernizations take 2 to 3 weeks from discovery to production deployment. Larger multi-page brand systems typically span 5 to 7 weeks.',
          },
          {
            id: 'cfq-2',
            title: 'Will our team be able to edit copy and add pages afterward?',
            description:
              'Yes. We deliver modular section templates alongside clear documentation so your team can update headlines, pricing, and pages without filing engineering tickets.',
          },
          {
            id: 'cfq-3',
            title: 'How are payments and milestones structured?',
            description:
              'Fixed-scope sprints are billed 50% at kickoff and 50% upon approved production handoff. Monthly retainers are invoiced on the first of each month.',
          },
        ],
      },
    },
  },

  // --- FEATURES ---
  {
    id: 'tpl-features-numbered-grid',
    name: 'Numbered Capabilities Grid',
    category: 'features',
    summary: 'Three-column editorial capability cards with clean numerical indexing.',
    section: {
      type: 'features',
      name: 'Core Capabilities',
      visible: true,
      variant: 'grid-3',
      surface: 'canvas',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'capabilities', className: '', customCss: '' },
      content: {
        eyebrow: 'Capabilities',
        headline: 'Three pillars built for durable web performance',
        subheadline:
          'Disciplined typography, responsive grid math, and lightweight markup engineered to load fast on every device.',
        items: [
          {
            id: 'tf-1',
            meta: '01',
            title: 'Semantic Layout Architecture',
            description:
              'Clean landmark tags, balanced headline wrapping, and accessible contrast ratios configured automatically across breakpoints.',
          },
          {
            id: 'tf-2',
            meta: '02',
            title: 'Reusable Section Libraries',
            description:
              'Standardize approved pricing tables, hero headers, and testimonial rows so new campaign pages stay visually consistent.',
          },
          {
            id: 'tf-3',
            meta: '03',
            title: 'Zero-Friction Deployment',
            description:
              'Generate ready-to-ship repositories complete with edge caching headers, redirects, and CI/CD workflows.',
          },
        ],
      },
    },
  },
  {
    id: 'tpl-features-process-list',
    name: 'Stacked Delivery Process',
    category: 'features',
    summary: 'Clean vertical process breakdown ideal for methodology and onboarding sections.',
    section: {
      type: 'features',
      name: 'Delivery Process',
      visible: true,
      variant: 'list',
      surface: 'subtle',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'process', className: '', customCss: '' },
      content: {
        eyebrow: 'Methodology',
        headline: 'From existing site audit to global launch in three stages',
        items: [
          {
            id: 'tfl-1',
            meta: 'Stage 01',
            title: 'Audit & Structural Extraction',
            description:
              'Inventory existing URLs, preserve high-performing copy and SEO metadata, and strip away legacy layout debt.',
          },
          {
            id: 'tfl-2',
            meta: 'Stage 02',
            title: 'Visual System Composition',
            description:
              'Establish typography pairings, neutral surface hierarchy, and responsive component patterns across key user journeys.',
          },
          {
            id: 'tfl-3',
            meta: 'Stage 03',
            title: 'Production Export & Edge Publishing',
            description:
              'Verify Core Web Vitals, bundle framework source code, and ship directly to Vercel, Netlify, or Cloudflare Pages.',
          },
        ],
      },
    },
  },

  // --- SPLIT SHOWCASE ---
  {
    id: 'tpl-split-case-study',
    name: 'Case Study Spotlight',
    category: 'split',
    summary: 'Two-column feature breakdown pairing copy and checklist with right-side media.',
    section: {
      type: 'split',
      name: 'Case Study Spotlight',
      visible: true,
      variant: 'media-right',
      surface: 'canvas',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'spotlight', className: '', customCss: '' },
      content: {
        eyebrow: 'Featured Migration · 2026',
        headline: 'Rebuilding a 40-page catalog for sub-second navigation',
        subheadline:
          'We consolidated fragmented landing pages into six reusable templates while preserving every organic search route.',
        primaryCtaLabel: 'Read Full Case Study',
        primaryCtaHref: '#contact',
        image: BUILTIN_ASSETS[1].src,
        imageAlt: 'Structured architectural blueprint grid',
        items: [
          { id: 'tsc-1', title: '64% smaller JavaScript bundle after migration' },
          { id: 'tsc-2', title: '100% WCAG AA color contrast compliance' },
          { id: 'tsc-3', title: 'Shipped globally via Cloudflare Pages in 9 days' },
        ],
      },
    },
  },
  {
    id: 'tpl-split-media-left',
    name: 'Product Story (Media Left)',
    category: 'split',
    summary: 'Left-aligned visual paired with editorial storytelling and action link.',
    section: {
      type: 'split',
      name: 'Product Craft Story',
      visible: true,
      variant: 'media-left',
      surface: 'subtle',
      padding: 'lg',
      align: 'left',
      customCode: { htmlId: 'craft', className: '', customCss: '' },
      content: {
        eyebrow: 'Material & Craft',
        headline: 'Sourced directly from partner farms, roasted to order',
        subheadline:
          'Every lot is cupped weekly for clarity and sweetness, then sealed within minutes of cooling to protect volatile aromatics.',
        primaryCtaLabel: 'Explore Harvest Ledger',
        primaryCtaHref: '#plans',
        image: BUILTIN_ASSETS[3].src,
        imageAlt: 'Pour-over coffee carafe and ceramic vessel on stone counter',
        items: [
          { id: 'tsm-1', title: '100% traceable farm-gate pricing published quarterly' },
          { id: 'tsm-2', title: 'Small-batch cast-iron drum roasting every Tuesday' },
          { id: 'tsm-3', title: 'Compostable valve packaging shipped carbon-neutral' },
        ],
      },
    },
  },

  // --- METRICS ---
  {
    id: 'tpl-metrics-proof-strip',
    name: 'Quantitative Proof Strip',
    category: 'metrics',
    summary: 'Four-column tabular metric strip with explicit units and measurement timeframes.',
    section: {
      type: 'metrics',
      name: 'Proof Metrics',
      visible: true,
      variant: 'strip',
      surface: 'subtle',
      padding: 'sm',
      align: 'left',
      customCode: { htmlId: 'metrics', className: '', customCss: '' },
      content: {
        items: [
          { id: 'tm-1', value: '99.98%', title: 'Measured Uptime', meta: 'Trailing 12 months' },
          { id: 'tm-2', value: '18.4ms', title: 'Global P95 Latency', meta: 'Across 34 edge PoPs' },
          { id: 'tm-3', value: '+44%', title: 'Conversion Lift', meta: 'Median 90-day post-launch' },
          { id: 'tm-4', value: '0 KB', title: 'Lock-in Runtime', meta: 'Pure exported code' },
        ],
      },
    },
  },

  // --- CTAs ---
  {
    id: 'tpl-cta-contrast-banner',
    name: 'Dark Conversion Banner',
    category: 'cta',
    summary: 'High-contrast centered closing call-to-action with primary and secondary actions.',
    section: {
      type: 'cta',
      name: 'Closing Call to Action',
      visible: true,
      variant: 'centered',
      surface: 'contrast',
      padding: 'lg',
      align: 'center',
      customCode: { htmlId: 'contact', className: '', customCss: '' },
      content: {
        eyebrow: 'Ready When You Are',
        headline: 'Launch your modernized site this week',
        subheadline:
          'Export clean production files or deploy directly to your preferred hosting workflow with zero rewrite overhead.',
        primaryCtaLabel: 'Start Building Free',
        primaryCtaHref: '#top',
        secondaryCtaLabel: 'Book Architecture Call',
        secondaryCtaHref: 'mailto:hello@example.com',
        items: [],
      },
    },
  },
  {
    id: 'tpl-cta-accent-strip',
    name: 'Accent Brand Banner',
    category: 'cta',
    summary: 'Primary brand color callout band for high-intent newsletter or demo conversion.',
    section: {
      type: 'cta',
      name: 'Brand Accent CTA',
      visible: true,
      variant: 'centered',
      surface: 'accent',
      padding: 'md',
      align: 'center',
      customCode: { htmlId: 'get-started', className: '', customCss: '' },
      content: {
        eyebrow: 'Direct Deployment',
        headline: 'Turn legacy web pages into fast modern sites',
        subheadline: 'Bring a live URL or HTML archive and ship clean code in minutes.',
        primaryCtaLabel: 'Request Demo',
        primaryCtaHref: '#contact',
        items: [],
      },
    },
  },

  // --- NAVIGATION & FOOTER ---
  {
    id: 'tpl-navbar-clean',
    name: 'Three-Zone Header',
    category: 'navbar',
    summary: 'Single-row navigation bar with brand wordmark, four links, and primary CTA.',
    section: {
      type: 'navbar',
      name: 'Primary Header',
      visible: true,
      variant: 'minimal',
      surface: 'canvas',
      padding: 'sm',
      align: 'left',
      customCode: { htmlId: 'top', className: '', customCss: '' },
      content: {
        brandName: 'Studio Mark',
        primaryCtaLabel: 'Get Started',
        primaryCtaHref: '#contact',
        items: [
          { id: 'tnv-1', title: 'Capabilities', href: '#capabilities' },
          { id: 'tnv-2', title: 'Case Studies', href: '#spotlight' },
          { id: 'tnv-3', title: 'Pricing', href: '#pricing' },
          { id: 'tnv-4', title: 'FAQ', href: '#faq' },
        ],
      },
    },
  },
  {
    id: 'tpl-footer-contrast',
    name: 'Minimal Contrast Footer',
    category: 'footer',
    summary: 'Quiet dark-surface footer with brand summary, key links, and copyright line.',
    section: {
      type: 'footer',
      name: 'Site Footer',
      visible: true,
      variant: 'columns',
      surface: 'contrast',
      padding: 'sm',
      align: 'left',
      customCode: { htmlId: 'footer', className: '', customCss: '' },
      content: {
        brandName: 'Studio Mark',
        subheadline: 'Designed for performance, accessibility, and clean code ownership.',
        copyright: `© ${new Date().getFullYear()} Studio Mark Inc. All rights reserved.`,
        items: [
          { id: 'tft-1', title: 'Capabilities', href: '#capabilities' },
          { id: 'tft-2', title: 'Pricing', href: '#pricing' },
          { id: 'tft-3', title: 'FAQ', href: '#faq' },
          { id: 'tft-4', title: 'Contact', href: '#contact' },
        ],
      },
    },
  },
];

export function instantiateSectionFromBlueprint(
  blueprint: Omit<SiteSection, 'id'>,
  overrideName?: string
): SiteSection {
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const cloned = structuredClone(blueprint);
  const id = `sec-${cloned.type}-${stamp}`;
  return {
    ...cloned,
    id,
    name: overrideName || cloned.name,
    visible: true,
    content: {
      ...cloned.content,
      items: cloned.content.items.map((item, idx) => ({
        ...item,
        id: `${id}-item-${idx}`,
      })),
    },
  };
}
