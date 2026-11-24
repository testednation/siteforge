import type { SectionType, SiteAsset, SiteProject, SiteSection } from '../types/site';

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const BUILTIN_ASSETS: SiteAsset[] = [
  {
    id: 'asset-arch-pavilion',
    name: 'Architectural Elevation',
    aspect: '16:9',
    kind: 'illustration',
    src: svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" fill="none">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E7E5E0"/>
      <stop offset="65%" stop-color="#F4F1EA"/>
      <stop offset="100%" stop-color="#DFD9CD"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C7C5BE"/>
      <stop offset="100%" stop-color="#A8A7A0"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2D333B"/>
      <stop offset="100%" stop-color="#1A1E24"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#sky)"/>
  <circle cx="960" cy="170" r="64" fill="#FBF8F1"/>
  <rect x="0" y="545" width="1200" height="205" fill="url(#water)"/>
  <line x1="0" y1="545" x2="1200" y2="545" stroke="#8F8C84" stroke-width="1.5"/>
  <!-- Architectural Pavilion -->
  <rect x="130" y="230" width="900" height="28" fill="#1F2429"/>
  <rect x="160" y="258" width="840" height="287" fill="#EAE6DC" stroke="#CFC8BA" stroke-width="1"/>
  <!-- Warm Cedar Louvers -->
  <rect x="180" y="258" width="210" height="287" fill="#9C7A56"/>
  <g stroke="#7A5D3F" stroke-width="2">
    <line x1="205" y1="258" x2="205" y2="545"/>
    <line x1="230" y1="258" x2="230" y2="545"/>
    <line x1="255" y1="258" x2="255" y2="545"/>
    <line x1="280" y1="258" x2="280" y2="545"/>
    <line x1="305" y1="258" x2="305" y2="545"/>
    <line x1="330" y1="258" x2="330" y2="545"/>
    <line x1="355" y1="258" x2="355" y2="545"/>
  </g>
  <!-- Glazed Living Bay -->
  <rect x="415" y="274" width="465" height="271" fill="url(#glass)"/>
  <rect x="445" y="340" width="160" height="205" fill="#E8D8B9" opacity="0.22"/>
  <rect x="640" y="310" width="210" height="235" fill="#F2E4C8" opacity="0.16"/>
  <line x1="570" y1="274" x2="570" y2="545" stroke="#39414A" stroke-width="3"/>
  <line x1="725" y1="274" x2="725" y2="545" stroke="#39414A" stroke-width="3"/>
  <!-- Concrete Cantilever Pier -->
  <rect x="880" y="258" width="120" height="287" fill="#D5D0C5"/>
  <rect x="880" y="258" width="12" height="287" fill="#B9B3A6"/>
  <!-- Subtle Water Reflection -->
  <rect x="180" y="555" width="210" height="120" fill="#8C755C" opacity="0.25"/>
  <rect x="415" y="555" width="465" height="140" fill="#232830" opacity="0.24"/>
  <g stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="1.5">
    <line x1="120" y1="590" x2="460" y2="590"/>
    <line x1="540" y1="620" x2="980" y2="620"/>
    <line x1="280" y1="665" x2="760" y2="665"/>
  </g>
  <!-- Technical Dimension Guides -->
  <g stroke="#6C6A64" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="4 6">
    <line x1="130" y1="160" x2="130" y2="230"/>
    <line x1="1030" y1="160" x2="1030" y2="230"/>
    <line x1="130" y1="180" x2="1030" y2="180"/>
  </g>
</svg>
    `),
  },
  {
    id: 'asset-studio-blueprint',
    name: 'Spatial Studio Plan',
    aspect: '4:3',
    kind: 'illustration',
    src: svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720" fill="none">
  <rect width="960" height="720" fill="#F5F4F0"/>
  <g stroke="#E2DFD7" stroke-width="1">
    <path d="M0 90H960M0 180H960M0 270H960M0 360H960M0 450H960M0 540H960M0 630H960"/>
    <path d="M120 0V720M240 0V720M360 0V720M480 0V720M600 0V720M720 0V720M840 0V720"/>
  </g>
  <rect x="120" y="120" width="720" height="480" fill="#FFFFFF" stroke="#1F2429" stroke-width="2.5"/>
  <line x1="420" y1="120" x2="420" y2="410" stroke="#1F2429" stroke-width="2"/>
  <line x1="420" y1="480" x2="420" y2="600" stroke="#1F2429" stroke-width="2"/>
  <path d="M420 410 A70 70 0 0 1 490 480" stroke="#6B7280" stroke-width="1.5" stroke-dasharray="4 4"/>
  <line x1="420" y1="340" x2="840" y2="340" stroke="#1F2429" stroke-width="2"/>
  <rect x="170" y="185" width="190" height="115" fill="#ECEAE3" stroke="#9CA3AF" stroke-width="1.5"/>
  <rect x="480" y="170" width="300" height="120" fill="#1F2429" opacity="0.06" stroke="#1F2429" stroke-width="1.5"/>
  <circle cx="265" cy="465" r="78" fill="#D9CFC1" opacity="0.45" stroke="#1F2429" stroke-width="1.5"/>
  <rect x="520" y="400" width="240" height="145" fill="#F0ECE4" stroke="#78716C" stroke-width="1.5"/>
  <text x="148" y="156" fill="#4B5563" font-family="monospace" font-size="13" letter-spacing="1">GALLERY NORTH  18.4M</text>
  <text x="456" y="156" fill="#4B5563" font-family="monospace" font-size="13" letter-spacing="1">ATELIER COURTYARD</text>
  <text x="456" y="376" fill="#4B5563" font-family="monospace" font-size="13" letter-spacing="1">ARCHIVE &amp; LIBRARY</text>
</svg>
    `),
  },
  {
    id: 'asset-telemetry-console',
    name: 'Cloud Telemetry System',
    aspect: '16:9',
    kind: 'illustration',
    src: svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" fill="none">
  <rect width="1200" height="720" fill="#0F172A"/>
  <g stroke="#1E293B" stroke-width="1">
    <path d="M0 120H1200M0 240H1200M0 360H1200M0 480H1200M0 600H1200"/>
    <path d="M150 0V720M300 0V720M450 0V720M600 0V720M750 0V720M900 0V720M1050 0V720"/>
  </g>
  <rect x="96" y="88" width="1008" height="544" rx="12" fill="#111827" stroke="#334155" stroke-width="1.5"/>
  <line x1="96" y1="146" x2="1104" y2="146" stroke="#1F2937" stroke-width="1.5"/>
  <circle cx="132" cy="117" r="6" fill="#334155"/>
  <circle cx="154" cy="117" r="6" fill="#334155"/>
  <circle cx="176" cy="117" r="6" fill="#334155"/>
  <!-- Metric Cards -->
  <rect x="132" y="182" width="290" height="122" rx="8" fill="#172033" stroke="#26334D"/>
  <rect x="454" y="182" width="290" height="122" rx="8" fill="#172033" stroke="#26334D"/>
  <rect x="776" y="182" width="292" height="122" rx="8" fill="#172033" stroke="#26334D"/>
  <text x="158" y="218" fill="#94A3B8" font-family="sans-serif" font-size="14">Global P95 Latency</text>
  <text x="158" y="274" fill="#F8FAFC" font-family="monospace" font-size="36" font-weight="600">18.4 ms</text>
  <text x="480" y="218" fill="#94A3B8" font-family="sans-serif" font-size="14">Edge Cache Hit Ratio</text>
  <text x="480" y="274" fill="#F8FAFC" font-family="monospace" font-size="36" font-weight="600">99.42%</text>
  <text x="802" y="218" fill="#94A3B8" font-family="sans-serif" font-size="14">Active Regions</text>
  <text x="802" y="274" fill="#F8FAFC" font-family="monospace" font-size="36" font-weight="600">34 PoPs</text>
  <!-- Chart Surface -->
  <rect x="132" y="336" width="936" height="256" rx="8" fill="#172033" stroke="#26334D"/>
  <path d="M168 525 C255 510, 315 440, 410 452 C505 464, 575 390, 675 408 C775 426, 855 372, 1030 385" stroke="#3B82F6" stroke-width="3.5" fill="none"/>
  <path d="M168 552 C265 538, 345 495, 445 505 C545 515, 625 468, 745 478 C865 488, 935 452, 1030 460" stroke="#64748B" stroke-width="2" stroke-dasharray="6 6" fill="none"/>
  <circle cx="675" cy="408" r="6" fill="#3B82F6"/>
  <circle cx="1030" cy="385" r="6" fill="#3B82F6"/>
</svg>
    `),
  },
  {
    id: 'asset-artisan-vessels',
    name: 'Ceramic & Roast Composition',
    aspect: '16:9',
    kind: 'illustration',
    src: svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" fill="none">
  <rect width="1200" height="720" fill="#F2ECE4"/>
  <rect x="0" y="510" width="1200" height="210" fill="#E3D9CC"/>
  <line x1="0" y1="510" x2="1200" y2="510" stroke="#C9BCA9" stroke-width="1.5"/>
  <!-- Architectural Sunlight Beam -->
  <polygon points="0,0 560,0 320,720 0,720" fill="#FAF6F0" opacity="0.65"/>
  <!-- Carafe Silhouette -->
  <path d="M430 510 L465 315 H615 L650 510 Z" fill="#2B241E"/>
  <path d="M475 265 H605 L585 315 H495 Z" fill="#8C5E3C"/>
  <path d="M615 355 C685 355, 690 455, 635 465" stroke="#2B241E" stroke-width="14" stroke-linecap="round" fill="none"/>
  <!-- Ceramic Cup -->
  <rect x="745" y="405" width="140" height="105" rx="14" fill="#FAF7F2" stroke="#D1C6B7" stroke-width="2"/>
  <path d="M885 432 C922 432, 922 482, 885 482" stroke="#D1C6B7" stroke-width="10" fill="none"/>
  <!-- Roast Bag -->
  <rect x="210" y="255" width="175" height="255" rx="6" fill="#3B312B"/>
  <rect x="236" y="305" width="123" height="110" fill="#EFE8DE"/>
  <line x1="256" y1="342" x2="338" y2="342" stroke="#3B312B" stroke-width="3"/>
  <line x1="256" y1="364" x2="318" y2="364" stroke="#8C5E3C" stroke-width="2"/>
  <line x1="256" y1="384" x2="302" y2="384" stroke="#8C5E3C" stroke-width="2"/>
</svg>
    `),
  },
];

export const STARTER_PROJECTS: SiteProject[] = [
  {
    id: 'starter-meridian',
    name: 'Meridian Atelier',
    domain: 'meridian-atelier.com',
    description: 'Contemporary architectural studio specializing in timber, stone, and passive residential spaces.',
    theme: {
      primaryColor: '#1F2937',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F5F4F0',
      textColor: '#14171A',
      mutedColor: '#5B626D',
      displayFont: 'Playfair Display',
      bodyFont: 'DM Sans',
      radius: 'sm',
      spacing: 'comfortable',
    },
    assets: [...BUILTIN_ASSETS],
    globalCode: {
      headHtml: '',
      customCss: '',
      bodyScript: '',
    },
    sourceInfo: {
      type: 'template',
      origin: 'Meridian Atelier Blueprint',
    },
    pages: [
      {
        id: 'page-home',
        name: 'Home',
        slug: 'index',
        title: 'Meridian Atelier — Architecture & Spatial Design',
        description: 'Passive coastal residences, cultural pavilions, and calm interiors crafted in Zurich and Portland.',
        sections: [
          {
            id: 'sec-nav-1',
            type: 'navbar',
            name: 'Header Navigation',
            visible: true,
            variant: 'minimal',
            surface: 'canvas',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'top', className: '', customCss: '' },
            content: {
              brandName: 'Meridian Atelier',
              primaryCtaLabel: 'Book Consultation',
              primaryCtaHref: '#contact',
              items: [
                { id: 'nav-1', title: 'Selected Work', href: '#work' },
                { id: 'nav-2', title: 'Practice', href: '#practice' },
                { id: 'nav-3', title: 'Process', href: '#process' },
                { id: 'nav-4', title: 'Journal', href: '#testimonials' },
              ],
            },
          },
          {
            id: 'sec-hero-1',
            type: 'hero',
            name: 'Hero Showcase',
            visible: true,
            variant: 'split',
            surface: 'canvas',
            padding: 'lg',
            align: 'left',
            customCode: { htmlId: 'hero', className: '', customCss: '' },
            content: {
              eyebrow: 'Zurich · Portland · Est. 2016',
              headline: 'Quiet architecture shaped by daylight and honest material',
              subheadline:
                'We design low-carbon timber homes, public galleries, and restorative studio spaces engineered to age gracefully across generations.',
              primaryCtaLabel: 'View Commission Inquiry',
              primaryCtaHref: '#contact',
              secondaryCtaLabel: 'Explore Selected Work',
              secondaryCtaHref: '#work',
              image: BUILTIN_ASSETS[0].src,
              imageAlt: 'Meridian coastal concrete and cedar pavilion overlooking calm water',
              items: [],
            },
          },
          {
            id: 'sec-metrics-1',
            type: 'metrics',
            name: 'Studio Record',
            visible: true,
            variant: 'strip',
            surface: 'subtle',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'record', className: '', customCss: '' },
            content: {
              items: [
                { id: 'm-1', value: '42', title: 'Completed Structures', meta: 'Residential & cultural' },
                { id: 'm-2', value: '68%', title: 'Embodied Carbon Reduction', meta: 'Mass timber & stone' },
                { id: 'm-3', value: '14', title: 'Design Citations', meta: 'AIA & Swiss Architecture' },
                { id: 'm-4', value: '100%', title: 'Passive House Ready', meta: 'Net-zero envelope standard' },
              ],
            },
          },
          {
            id: 'sec-features-1',
            type: 'features',
            name: 'Core Disciplines',
            visible: true,
            variant: 'grid-3',
            surface: 'canvas',
            padding: 'lg',
            align: 'left',
            customCode: { htmlId: 'practice', className: '', customCss: '' },
            content: {
              eyebrow: 'Practice',
              headline: 'Three integrated disciplines under one roof',
              subheadline:
                'From early site microclimate modeling to bespoke joinery fabrication, every detail is resolved by a unified architectural team.',
              items: [
                {
                  id: 'f-1',
                  meta: '01',
                  title: 'Architectural Design',
                  description:
                    'Site-responsive massing, structural timber engineering, and passive solar envelopes calibrated to local seasonal light.',
                },
                {
                  id: 'f-2',
                  meta: '02',
                  title: 'Interior Architecture',
                  description:
                    'Acoustic plaster walls, millwork in regionally harvested oak, and quiet material transitions designed around daily rituals.',
                },
                {
                  id: 'f-3',
                  meta: '03',
                  title: 'Landscape & Thresholds',
                  description:
                    'Native meadow restoration, stone courtyards, and rainwater basins that dissolve the boundary between room and terrain.',
                },
              ],
            },
          },
          {
            id: 'sec-split-1',
            type: 'split',
            name: 'Featured Commission',
            visible: true,
            variant: 'media-right',
            surface: 'subtle',
            padding: 'lg',
            align: 'left',
            customCode: { htmlId: 'work', className: '', customCss: '' },
            content: {
              eyebrow: 'Featured Monograph · 2025',
              headline: 'The Lake Oswego Pavilion & Archive',
              subheadline:
                'A single-story cross-laminated cedar residence framed around an interior courtyard library and passive thermal stone slab.',
              primaryCtaLabel: 'Read Project Brief',
              primaryCtaHref: '#contact',
              image: BUILTIN_ASSETS[1].src,
              imageAlt: 'Architectural floor plan showing gallery north and courtyard archive',
              items: [
                { id: 'sp-1', title: '3,400 sq ft conditioned footprint' },
                { id: 'sp-2', title: 'Zero fossil-fuel hydronic floor conditioning' },
                { id: 'sp-3', title: 'Completed on schedule in 14 months' },
              ],
            },
          },
          {
            id: 'sec-test-1',
            type: 'testimonials',
            name: 'Client Perspectives',
            visible: true,
            variant: 'grid-2',
            surface: 'canvas',
            padding: 'md',
            align: 'left',
            customCode: { htmlId: 'testimonials', className: '', customCss: '' },
            content: {
              eyebrow: 'Client Reflections',
              headline: 'Measured by how spaces feel years after move-in',
              items: [
                {
                  id: 't-1',
                  description:
                    'Meridian transformed a steep, shaded lot into the brightest room we have ever lived in. Our winter heating bills dropped by 72% compared to our previous home.',
                  title: 'Hannah & David Lindholm',
                  subtitle: 'Homeowners, Hood River Residence',
                },
                {
                  id: 't-2',
                  description:
                    'Their drawings left zero ambiguity for contractors. Every cedar beam and travertine joint arrived prefabricated and fit within two millimeters.',
                  title: 'Martin Keller',
                  subtitle: 'Director, Kunsthalle Basel Annex',
                },
              ],
            },
          },
          {
            id: 'sec-cta-1',
            type: 'cta',
            name: 'Commission Inquiry',
            visible: true,
            variant: 'centered',
            surface: 'contrast',
            padding: 'lg',
            align: 'center',
            customCode: { htmlId: 'contact', className: '', customCss: '' },
            content: {
              eyebrow: 'New Commissions · 2026–2027',
              headline: 'Begin a conversation about your site',
              subheadline:
                'We accept six residential and cultural commissions each year. Share your location, timeline, and program to schedule an initial feasibility call.',
              primaryCtaLabel: 'Schedule Feasibility Review',
              primaryCtaHref: 'mailto:studio@meridian-atelier.com',
              secondaryCtaLabel: 'Download Practice Monograph',
              secondaryCtaHref: '#work',
              items: [],
            },
          },
          {
            id: 'sec-footer-1',
            type: 'footer',
            name: 'Footer',
            visible: true,
            variant: 'columns',
            surface: 'canvas',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'footer', className: '', customCss: '' },
            content: {
              brandName: 'Meridian Atelier',
              subheadline: 'Architecture, interiors, and low-carbon building systems.',
              copyright: '© 2026 Meridian Atelier LLP. All rights reserved.',
              items: [
                { id: 'ft-1', title: 'Selected Work', href: '#work' },
                { id: 'ft-2', title: 'Practice', href: '#practice' },
                { id: 'ft-3', title: 'Sustainability', href: '#record' },
                { id: 'ft-4', title: 'Contact', href: '#contact' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'starter-kestrel',
    name: 'Kestrel Cloud',
    domain: 'kestrelcloud.io',
    description: 'Low-latency observability and edge telemetry platform for distributed engineering teams.',
    theme: {
      primaryColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F3F5F8',
      textColor: '#0F172A',
      mutedColor: '#475569',
      displayFont: 'Plus Jakarta Sans',
      bodyFont: 'DM Sans',
      radius: 'md',
      spacing: 'comfortable',
    },
    assets: [...BUILTIN_ASSETS],
    globalCode: { headHtml: '', customCss: '', bodyScript: '' },
    sourceInfo: { type: 'template', origin: 'Kestrel Cloud SaaS Blueprint' },
    pages: [
      {
        id: 'page-home',
        name: 'Home',
        slug: 'index',
        title: 'Kestrel Cloud — Edge Observability Without Sampling Blind Spots',
        description: 'Capture 100% of production traces across 34 edge regions with sub-20ms query latency.',
        sections: [
          {
            id: 'k-nav',
            type: 'navbar',
            name: 'Top Navigation',
            visible: true,
            variant: 'minimal',
            surface: 'canvas',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'top', className: '', customCss: '' },
            content: {
              brandName: 'Kestrel Cloud',
              primaryCtaLabel: 'Start Free Trial',
              primaryCtaHref: '#pricing',
              items: [
                { id: 'kn-1', title: 'Platform', href: '#features' },
                { id: 'kn-2', title: 'Architecture', href: '#architecture' },
                { id: 'kn-3', title: 'Pricing', href: '#pricing' },
                { id: 'kn-4', title: 'FAQ', href: '#faq' },
              ],
            },
          },
          {
            id: 'k-hero',
            type: 'hero',
            name: 'Hero Section',
            visible: true,
            variant: 'centered',
            surface: 'canvas',
            padding: 'lg',
            align: 'center',
            customCode: { htmlId: 'hero', className: '', customCss: '' },
            content: {
              eyebrow: 'Distributed Tracing & Edge Metrics',
              headline: 'Inspect every production request in under 20 milliseconds',
              subheadline:
                'Kestrel ingests high-cardinality OpenTelemetry spans directly at the network edge so your engineers pinpoint regressions without paying per-seat observability taxes.',
              primaryCtaLabel: 'Deploy Collector',
              primaryCtaHref: '#pricing',
              secondaryCtaLabel: 'View Architecture',
              secondaryCtaHref: '#architecture',
              image: BUILTIN_ASSETS[2].src,
              imageAlt: 'Kestrel Cloud live telemetry dashboard displaying global P95 latency and cache hit ratio',
              items: [],
            },
          },
          {
            id: 'k-features',
            type: 'features',
            name: 'Platform Capabilities',
            visible: true,
            variant: 'grid-3',
            surface: 'subtle',
            padding: 'lg',
            align: 'left',
            customCode: { htmlId: 'features', className: '', customCss: '' },
            content: {
              eyebrow: 'Capabilities',
              headline: 'Engineered for high-throughput teams',
              items: [
                {
                  id: 'kf-1',
                  meta: '01',
                  title: 'Zero-Sampling Trace Retention',
                  description: 'Columnar compression stores 100% of tail-latency traces for 30 days at one-quarter the cost of legacy APM vendors.',
                },
                {
                  id: 'kf-2',
                  meta: '02',
                  title: 'Instant Deploy Correlation',
                  description: 'Automatically links Git commit SHAs and container digests to latency shifts within seconds of rollout.',
                },
                {
                  id: 'kf-3',
                  meta: '03',
                  title: 'OpenTelemetry Native',
                  description: 'Drop-in OTLP gRPC and HTTP endpoints with zero proprietary agents or vendor lock-in.',
                },
              ],
            },
          },
          {
            id: 'k-pricing',
            type: 'pricing',
            name: 'Pricing Tiers',
            visible: true,
            variant: 'grid-3',
            surface: 'canvas',
            padding: 'lg',
            align: 'center',
            customCode: { htmlId: 'pricing', className: '', customCss: '' },
            content: {
              eyebrow: 'Transparent Pricing',
              headline: 'Pay for ingested volume, never per engineer',
              subheadline: 'Unlimited seats, SSO, and alert integrations included on every tier.',
              items: [
                {
                  id: 'kp-1',
                  title: 'Starter',
                  subtitle: 'For early-stage engineering teams',
                  value: '$0 / mo',
                  ctaLabel: 'Start Free',
                  href: '#contact',
                  bullets: ['50 GB monthly trace ingest', '14-day retention', 'Unlimited team members'],
                },
                {
                  id: 'kp-2',
                  title: 'Growth',
                  subtitle: 'For scaling production workloads',
                  value: '$290 / mo',
                  featured: true,
                  ctaLabel: 'Start 14-Day Trial',
                  href: '#contact',
                  bullets: ['1 TB monthly trace ingest', '30-day full retention', 'PagerDuty & Slack anomaly routing'],
                },
                {
                  id: 'kp-3',
                  title: 'Enterprise',
                  subtitle: 'For regulated multi-region clusters',
                  value: 'Custom',
                  ctaLabel: 'Talk to Engineering',
                  href: '#contact',
                  bullets: ['Dedicated EU/US data residency', 'SOC 2 Type II & HIPAA BAA', '99.99% contractual uptime SLA'],
                },
              ],
            },
          },
          {
            id: 'k-faq',
            type: 'faq',
            name: 'Technical FAQ',
            visible: true,
            variant: 'list',
            surface: 'subtle',
            padding: 'md',
            align: 'left',
            customCode: { htmlId: 'faq', className: '', customCss: '' },
            content: {
              eyebrow: 'Questions',
              headline: 'Common deployment questions',
              items: [
                {
                  id: 'kfq-1',
                  title: 'How long does it take to switch from Datadog or Honeycomb?',
                  description: 'Point your existing OpenTelemetry Collector exporter to your Kestrel ingestion endpoint. Most teams see live traces in under five minutes.',
                },
                {
                  id: 'kfq-2',
                  title: 'Can we self-host Kestrel inside our own VPC?',
                  description: 'Yes. Enterprise plans include a Bring-Your-Own-Cloud deployment chart for AWS, GCP, and bare-metal Kubernetes.',
                },
              ],
            },
          },
          {
            id: 'k-footer',
            type: 'footer',
            name: 'Footer',
            visible: true,
            variant: 'columns',
            surface: 'contrast',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'footer', className: '', customCss: '' },
            content: {
              brandName: 'Kestrel Cloud',
              subheadline: 'Edge-native telemetry for modern software teams.',
              copyright: '© 2026 Kestrel Systems Inc.',
              items: [
                { id: 'kft-1', title: 'Platform', href: '#features' },
                { id: 'kft-2', title: 'Pricing', href: '#pricing' },
                { id: 'kft-3', title: 'FAQ', href: '#faq' },
                { id: 'kft-4', title: 'Status', href: '#top' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'starter-solstice',
    name: 'Solstice Roasters',
    domain: 'solsticeroasters.co',
    description: 'Small-batch seasonal single-origin coffee roasted daily in Kyoto and Seattle.',
    theme: {
      primaryColor: '#7C4D2B',
      backgroundColor: '#FAF8F5',
      surfaceColor: '#F1EBE2',
      textColor: '#231C17',
      mutedColor: '#695C52',
      displayFont: 'Bricolage Grotesque',
      bodyFont: 'DM Sans',
      radius: 'sm',
      spacing: 'comfortable',
    },
    assets: [...BUILTIN_ASSETS],
    globalCode: { headHtml: '', customCss: '', bodyScript: '' },
    sourceInfo: { type: 'template', origin: 'Solstice Roasters Blueprint' },
    pages: [
      {
        id: 'page-home',
        name: 'Home',
        slug: 'index',
        title: 'Solstice Roasters — Seasonal Single-Origin Coffee',
        description: 'Direct-trade washed and honey-process coffees roasted to highlight clarity and terroir.',
        sections: [
          {
            id: 's-nav',
            type: 'navbar',
            name: 'Header',
            visible: true,
            variant: 'minimal',
            surface: 'canvas',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'top', className: '', customCss: '' },
            content: {
              brandName: 'Solstice Roasters',
              primaryCtaLabel: 'Subscribe',
              primaryCtaHref: '#plans',
              items: [
                { id: 'sn-1', title: 'Roast Calendar', href: '#story' },
                { id: 'sn-2', title: 'Subscriptions', href: '#plans' },
                { id: 'sn-3', title: 'Wholesale', href: '#cta' },
              ],
            },
          },
          {
            id: 's-hero',
            type: 'hero',
            name: 'Hero',
            visible: true,
            variant: 'split',
            surface: 'canvas',
            padding: 'lg',
            align: 'left',
            customCode: { htmlId: 'hero', className: '', customCss: '' },
            content: {
              eyebrow: 'Autumn Harvest · Roasted Daily',
              headline: 'Clarity in every pour, sourced directly from family farms',
              subheadline:
                'Light-to-medium seasonal micro-lots roasted on cast-iron drums and shipped within 24 hours of peak rest.',
              primaryCtaLabel: 'Explore Subscriptions',
              primaryCtaHref: '#plans',
              secondaryCtaLabel: 'Our Sourcing Ledger',
              secondaryCtaHref: '#story',
              image: BUILTIN_ASSETS[3].src,
              imageAlt: 'Pour-over coffee carafe, ceramic cup, and single-origin roast bag on stone counter',
              items: [],
            },
          },
          {
            id: 's-plans',
            type: 'pricing',
            name: 'Roast Subscriptions',
            visible: true,
            variant: 'grid-3',
            surface: 'subtle',
            padding: 'lg',
            align: 'center',
            customCode: { htmlId: 'plans', className: '', customCss: '' },
            content: {
              eyebrow: 'Roaster Dispatch',
              headline: 'Fresh seasonal lots on your cadence',
              items: [
                {
                  id: 'sp-1',
                  title: 'Filter Explorer',
                  subtitle: 'Washed floral & citrus micro-lots',
                  value: '$22 / bag',
                  ctaLabel: 'Select Filter',
                  href: '#cta',
                  bullets: ['250g whole bean', 'Bi-weekly or monthly delivery', 'Tasting card & brew recipe'],
                },
                {
                  id: 'sp-2',
                  title: 'Roaster Reserve',
                  subtitle: 'Rare high-elevation Gesha & SL28',
                  value: '$34 / bag',
                  featured: true,
                  ctaLabel: 'Select Reserve',
                  href: '#cta',
                  bullets: ['Limited 120-bag releases', 'Free expedited shipping', 'Direct farm transparency sheet'],
                },
                {
                  id: 'sp-3',
                  title: 'House Espresso',
                  subtitle: 'Balanced sweetness for milk or black',
                  value: '$20 / bag',
                  ctaLabel: 'Select Espresso',
                  href: '#cta',
                  bullets: ['Roasted for modern 1:2 extraction', 'Notes of cacao & stone fruit', 'Pause or skip anytime'],
                },
              ],
            },
          },
          {
            id: 's-cta',
            type: 'cta',
            name: 'Wholesale Banner',
            visible: true,
            variant: 'centered',
            surface: 'contrast',
            padding: 'md',
            align: 'center',
            customCode: { htmlId: 'cta', className: '', customCss: '' },
            content: {
              eyebrow: 'Cafe & Studio Partners',
              headline: 'Serve Solstice in your tasting room',
              subheadline: 'We supply equipment calibration, dial-in training, and weekly wholesale roast deliveries.',
              primaryCtaLabel: 'Request Sample Box',
              primaryCtaHref: 'mailto:hello@solsticeroasters.co',
              items: [],
            },
          },
          {
            id: 's-footer',
            type: 'footer',
            name: 'Footer',
            visible: true,
            variant: 'columns',
            surface: 'canvas',
            padding: 'sm',
            align: 'left',
            customCode: { htmlId: 'footer', className: '', customCss: '' },
            content: {
              brandName: 'Solstice Roasters',
              subheadline: 'Seasonal coffee roasted in small batches.',
              copyright: '© 2026 Solstice Roasters.',
              items: [
                { id: 'sft-1', title: 'Subscriptions', href: '#plans' },
                { id: 'sft-2', title: 'Wholesale', href: '#cta' },
                { id: 'sft-3', title: 'Back to Top', href: '#top' },
              ],
            },
          },
        ],
      },
    ],
  },
];

export const SECTION_LIBRARY: Array<{
  type: SectionType;
  label: string;
  description: string;
}> = [
  { type: 'navbar', label: 'Navigation Bar', description: 'Brand wordmark, links, and primary CTA' },
  { type: 'hero', label: 'Hero Banner', description: 'Headline, value prop, CTAs, and media' },
  { type: 'features', label: 'Feature Grid', description: 'Structured 3-column or list capabilities' },
  { type: 'split', label: 'Split Showcase', description: 'Editorial two-column copy and visual' },
  { type: 'metrics', label: 'Metrics Strip', description: 'Four-column quantitative proof row' },
  { type: 'testimonials', label: 'Testimonials', description: 'Attributable client outcomes' },
  { type: 'pricing', label: 'Pricing Table', description: 'Transparent tiers with clear limits' },
  { type: 'faq', label: 'FAQ Accordion', description: 'Clear answers to common questions' },
  { type: 'cta', label: 'Call to Action', description: 'High-contrast conversion section' },
  { type: 'footer', label: 'Footer', description: 'Quiet links and copyright line' },
];

export function createDefaultSection(type: SectionType): SiteSection {
  const id = `sec-${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const base = {
    id,
    type,
    visible: true,
    surface: 'canvas' as const,
    padding: 'md' as const,
    align: 'left' as const,
    customCode: { htmlId: type, className: '', customCss: '' },
  };

  switch (type) {
    case 'navbar':
      return {
        ...base,
        name: 'Navigation Bar',
        variant: 'minimal',
        padding: 'sm',
        content: {
          brandName: 'Studio Name',
          primaryCtaLabel: 'Get Started',
          primaryCtaHref: '#contact',
          items: [
            { id: `${id}-1`, title: 'Work', href: '#work' },
            { id: `${id}-2`, title: 'Capabilities', href: '#features' },
            { id: `${id}-3`, title: 'Pricing', href: '#pricing' },
            { id: `${id}-4`, title: 'Contact', href: '#contact' },
          ],
        },
      };
    case 'hero':
      return {
        ...base,
        name: 'Hero Section',
        variant: 'split',
        padding: 'lg',
        content: {
          eyebrow: 'New Release',
          headline: 'Build and ship modern web experiences with clarity',
          subheadline: 'Replace outdated layouts with responsive sections, disciplined typography, and exportable production code.',
          primaryCtaLabel: 'Start Project',
          primaryCtaHref: '#contact',
          secondaryCtaLabel: 'Learn More',
          secondaryCtaHref: '#features',
          image: BUILTIN_ASSETS[0].src,
          imageAlt: 'Hero showcase illustration',
          items: [],
        },
      };
    case 'features':
      return {
        ...base,
        name: 'Feature Grid',
        variant: 'grid-3',
        surface: 'subtle',
        padding: 'lg',
        content: {
          eyebrow: 'Capabilities',
          headline: 'Designed around real workflow speed',
          subheadline: 'Every section adapts smoothly from desktop to mobile with clean semantic code.',
          items: [
            { id: `${id}-1`, meta: '01', title: 'Modular Architecture', description: 'Compose reusable sections with consistent spacing and visual hierarchy.' },
            { id: `${id}-2`, meta: '02', title: 'Responsive Precision', description: 'Grid proportions and typography scale cleanly across desktop, tablet, and phone.' },
            { id: `${id}-3`, meta: '03', title: 'Clean Code Output', description: 'Export idiomatic HTML, React, Next.js, or Astro without runtime lock-in.' },
          ],
        },
      };
    case 'split':
      return {
        ...base,
        name: 'Split Showcase',
        variant: 'media-right',
        padding: 'lg',
        content: {
          eyebrow: 'Spotlight',
          headline: 'Pair editorial storytelling with structured proof',
          subheadline: 'Highlight your flagship product, studio case study, or workflow walkthrough beside visual media.',
          primaryCtaLabel: 'Explore Details',
          primaryCtaHref: '#contact',
          image: BUILTIN_ASSETS[1].src,
          imageAlt: 'Studio blueprint composition',
          items: [
            { id: `${id}-1`, title: 'Direct inline editing on canvas' },
            { id: `${id}-2`, title: 'Custom per-section CSS overrides' },
            { id: `${id}-3`, title: 'Instant static & framework exports' },
          ],
        },
      };
    case 'metrics':
      return {
        ...base,
        name: 'Metrics Strip',
        variant: 'strip',
        surface: 'subtle',
        padding: 'sm',
        content: {
          items: [
            { id: `${id}-1`, value: '99.98%', title: 'Uptime SLA', meta: 'Measured over 12 months' },
            { id: `${id}-2`, value: '140ms', title: 'Median Load Time', meta: 'Global edge network' },
            { id: `${id}-3`, value: '2,400+', title: 'Active Teams', meta: 'Across 38 countries' },
            { id: `${id}-4`, value: '4.9/5', title: 'Client Rating', meta: 'Verified reviews' },
          ],
        },
      };
    case 'testimonials':
      return {
        ...base,
        name: 'Testimonials',
        variant: 'grid-2',
        padding: 'md',
        content: {
          eyebrow: 'Customer Outcomes',
          headline: 'Trusted by teams modernizing their web presence',
          items: [
            {
              id: `${id}-1`,
              description: 'Rebuilding our legacy marketing site took an afternoon instead of six weeks, and organic conversions rose 38% in the first quarter.',
              title: 'Elena Vance',
              subtitle: 'VP of Brand, Northstar Logistics',
            },
            {
              id: `${id}-2`,
              description: 'Exporting directly to our Next.js repo with clean Tailwind markup meant our engineering team merged the redesign in a single pull request.',
              title: 'Marcus Chen',
              subtitle: 'Staff Frontend Engineer, Verve Labs',
            },
          ],
        },
      };
    case 'pricing':
      return {
        ...base,
        name: 'Pricing Table',
        variant: 'grid-3',
        align: 'center',
        padding: 'lg',
        content: {
          eyebrow: 'Pricing',
          headline: 'Simple, predictable plans',
          subheadline: 'Start free and upgrade when your team needs multi-site deployment.',
          items: [
            { id: `${id}-1`, title: 'Starter', subtitle: 'For solo creators', value: '$0 / mo', ctaLabel: 'Get Started', href: '#contact', bullets: ['1 live site', 'HTML & ZIP export', 'Community support'] },
            { id: `${id}-2`, title: 'Studio', subtitle: 'For agencies & product teams', value: '$49 / mo', featured: true, ctaLabel: 'Start Trial', href: '#contact', bullets: ['Unlimited sites', 'React, Next.js & Astro export', 'Direct hosting configs'] },
            { id: `${id}-3`, title: 'Enterprise', subtitle: 'For large organizations', value: 'Custom', ctaLabel: 'Contact Sales', href: '#contact', bullets: ['Custom design systems', 'SSO & audit logs', 'Dedicated onboarding'] },
          ],
        },
      };
    case 'faq':
      return {
        ...base,
        name: 'FAQ Section',
        variant: 'list',
        surface: 'subtle',
        padding: 'md',
        content: {
          eyebrow: 'FAQ',
          headline: 'Frequently asked questions',
          items: [
            { id: `${id}-1`, title: 'Can I host exported code anywhere?', description: 'Yes. Every export produces standard, dependency-clean code ready for Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static web host.' },
            { id: `${id}-2`, title: 'Will my custom CSS and scripts be preserved?', description: 'Both per-section CSS rules and global head/script injections are compiled cleanly into every export target.' },
          ],
        },
      };
    case 'cta':
      return {
        ...base,
        name: 'Call to Action',
        variant: 'centered',
        surface: 'contrast',
        align: 'center',
        padding: 'lg',
        content: {
          eyebrow: 'Ready to Launch',
          headline: 'Publish your rebuilt site in minutes',
          subheadline: 'Export clean source code or ship straight to your preferred hosting platform.',
          primaryCtaLabel: 'Get Started',
          primaryCtaHref: '#top',
          items: [],
        },
      };
    case 'footer':
      return {
        ...base,
        name: 'Footer',
        variant: 'columns',
        padding: 'sm',
        content: {
          brandName: 'Studio Name',
          subheadline: 'Built with clean semantic architecture.',
          copyright: `© ${new Date().getFullYear()} Studio Name. All rights reserved.`,
          items: [
            { id: `${id}-1`, title: 'Work', href: '#work' },
            { id: `${id}-2`, title: 'Capabilities', href: '#features' },
            { id: `${id}-3`, title: 'Contact', href: '#contact' },
          ],
        },
      };
  }
}

export const THEME_PRESETS: Array<{ name: string; theme: SiteProject['theme'] }> = [
  {
    name: 'Editorial Limestone',
    theme: {
      primaryColor: '#1F2937',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F5F4F0',
      textColor: '#14171A',
      mutedColor: '#5B626D',
      displayFont: 'Playfair Display',
      bodyFont: 'DM Sans',
      radius: 'sm',
      spacing: 'comfortable',
    },
  },
  {
    name: 'Cobalt SaaS',
    theme: {
      primaryColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F3F5F8',
      textColor: '#0F172A',
      mutedColor: '#475569',
      displayFont: 'Plus Jakarta Sans',
      bodyFont: 'DM Sans',
      radius: 'md',
      spacing: 'comfortable',
    },
  },
  {
    name: 'Obsidian Studio',
    theme: {
      primaryColor: '#E2E8F0',
      backgroundColor: '#0B0E14',
      surfaceColor: '#141923',
      textColor: '#F8FAFC',
      mutedColor: '#94A3B8',
      displayFont: 'Outfit',
      bodyFont: 'Manrope',
      radius: 'md',
      spacing: 'airy',
    },
  },
  {
    name: 'Warm Roastery',
    theme: {
      primaryColor: '#7C4D2B',
      backgroundColor: '#FAF8F5',
      surfaceColor: '#F1EBE2',
      textColor: '#231C17',
      mutedColor: '#695C52',
      displayFont: 'Bricolage Grotesque',
      bodyFont: 'DM Sans',
      radius: 'sm',
      spacing: 'comfortable',
    },
  },
];

export const DISPLAY_FONTS = [
  'Plus Jakarta Sans',
  'Playfair Display',
  'Bricolage Grotesque',
  'Outfit',
  'Manrope',
  'Lora',
];

export const BODY_FONTS = ['DM Sans', 'Plus Jakarta Sans', 'Manrope', 'Lora'];
