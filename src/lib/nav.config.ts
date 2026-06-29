/**
 * Nav config — the single source of truth for the chrome's navigation.
 *
 * CMS-driven chrome (Header, mobile drawer, Footer) reads its links from here
 * instead of inlining arrays in each component, per the editor contract in
 * `docs/CONVENTIONS-golden-oaks.md`. Re-skinned per project: the structure is
 * Golden Oaks' default information architecture; a different brand swaps the
 * groups/links without touching the components.
 *
 * Icons are referenced by a string `key` (not a component) so this stays a
 * plain data module — both server and client islands import it. The keys map to
 * `lucide-react` icons via `navIcons` below. The mockup uses inline
 * `.dropdown-icon` SVGs; we mirror each with the closest lucide glyph.
 *
 * Routes are the template's clean paths (`/living-options`, `/care-assessment`,
 * …), NOT the mockup `*.html` files.
 */
import {
  Home,
  Users,
  MessageSquare,
  BadgeCheck,
  Compass,
  Heart,
  Brain,
  Calendar,
  FileText,
  HelpCircle,
  DollarSign,
  Shield,
  CheckSquare,
  BookOpen,
  Video,
  Image,
  UtensilsCrossed,
  Star,
  Mail,
  Briefcase,
  ClipboardCheck,
  CheckCircle2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/** Keys into {@link navIcons}. Keep in sync with the map below. */
export type NavIconKey =
  | "home"
  | "users"
  | "message"
  | "badge"
  | "compass"
  | "heart"
  | "brain"
  | "calendar"
  | "file"
  | "help"
  | "dollar"
  | "shield"
  | "checklist"
  | "book"
  | "video"
  | "image"
  | "dining"
  | "star"
  | "mail"
  | "briefcase"
  | "clipboard"
  | "check"
  | "trending";

/** Maps a {@link NavIconKey} to its lucide component (chrome renders these). */
export const navIcons: Record<NavIconKey, LucideIcon> = {
  home: Home,
  users: Users,
  message: MessageSquare,
  badge: BadgeCheck,
  compass: Compass,
  heart: Heart,
  brain: Brain,
  calendar: Calendar,
  file: FileText,
  help: HelpCircle,
  dollar: DollarSign,
  shield: Shield,
  checklist: CheckSquare,
  book: BookOpen,
  video: Video,
  image: Image,
  dining: UtensilsCrossed,
  star: Star,
  mail: Mail,
  briefcase: Briefcase,
  clipboard: ClipboardCheck,
  check: CheckCircle2,
  trending: TrendingUp,
};

/** A single link inside a mega-menu dropdown / mobile-drawer accordion. */
export interface NavItem {
  label: string;
  href: string;
  /** Supporting line under the label (mockup `.dropdown-text small`). */
  blurb?: string;
  /** Icon key into {@link navIcons}. */
  icon: NavIconKey;
  /** Self-serve "start here" item — gets the filled-icon treatment. */
  highlight?: boolean;
}

/** A top-level nav group that opens a mega-menu dropdown. */
export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Primary navigation — five mega-menu groups, mirroring the mockup `#nav-list`
 * (About Us · Living Options · Life Here · Resources · Contact). Consumed by
 * both the desktop Header dropdowns and the mobile drawer accordions.
 */
export const mainNav: NavGroup[] = [
  {
    label: "About Us",
    items: [
      {
        label: "Mission & History",
        href: "/about-us",
        blurb: "Our story and the values that guide us",
        icon: "home",
      },
      {
        label: "Our Team",
        href: "/our-team",
        blurb: "Meet the people who make it all happen",
        icon: "users",
      },
      {
        label: "Testimonials & Reviews",
        href: "/testimonials-reviews",
        blurb: "Hear from our residents and families",
        icon: "message",
      },
      {
        label: "Licensing & Accreditations",
        href: "/licensing",
        blurb: "Our credentials and quality standards",
        icon: "badge",
      },
    ],
  },
  {
    label: "Living Options",
    items: [
      {
        label: "Not sure where to start?",
        href: "/care-assessment",
        blurb: "Take our 5-min Care Assessment",
        icon: "compass",
        highlight: true,
      },
      {
        label: "Independent Living",
        href: "/independent-living",
        blurb: "Active lifestyle with freedom and community",
        icon: "help",
      },
      {
        label: "Assisted Living",
        href: "/assisted-living",
        blurb: "Compassionate daily support and care",
        icon: "heart",
      },
      {
        label: "Memory Care",
        href: "/memory-care",
        blurb: "Expert dementia care in a secure setting",
        icon: "brain",
      },
      {
        label: "Respite / Short-Term Care",
        href: "/respite-care",
        blurb: "Temporary stays for recovery or relief",
        icon: "calendar",
      },
      {
        label: "Floor Plans & Pricing",
        href: "/floor-plans",
        blurb: "Explore layouts and transparent pricing",
        icon: "image",
      },
      {
        label: "Virtual Tour",
        href: "/virtual-tour",
        blurb: "See our community from anywhere",
        icon: "video",
      },
    ],
  },
  {
    label: "Life Here",
    items: [
      {
        label: "Amenities & Services",
        href: "/amenities",
        blurb: "Everything we offer under one roof",
        icon: "star",
      },
      {
        label: "Dining & Nutrition",
        href: "/dining-nutrition",
        blurb: "Chef-prepared meals and dietary care",
        icon: "dining",
      },
      {
        label: "Activities & Events",
        href: "/activities-events",
        blurb: "Our calendar of programs and socials",
        icon: "calendar",
      },
      {
        label: "Photo & Video Gallery",
        href: "/photo-video-gallery",
        blurb: "A look inside daily life at our community",
        icon: "image",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Blog / Resource Center",
        href: "/blog",
        blurb: "Articles, guides, and expert advice",
        icon: "book",
      },
      {
        label: "Care Assessment",
        href: "/care-assessment",
        blurb: "Find the right level of care in 5 minutes",
        icon: "clipboard",
      },
      {
        label: "Senior Living Guide",
        href: "/senior-living-guide",
        blurb: "Free downloadable family planning guide",
        icon: "file",
      },
      {
        label: "FAQs",
        href: "/faq",
        blurb: "Answers to common questions",
        icon: "help",
      },
      {
        label: "Understanding Costs",
        href: "/understanding-costs",
        blurb: "Transparent breakdown of pricing",
        icon: "dollar",
      },
      {
        label: "Financial Assistance",
        href: "/financial-assistance",
        blurb: "VA, Medicaid, and insurance options",
        icon: "shield",
      },
      {
        label: "Move-In Process",
        href: "/move-in-process",
        blurb: "Step-by-step guide to getting started",
        icon: "check",
      },
    ],
  },
  {
    label: "Contact",
    items: [
      {
        label: "Contact Us",
        href: "/contact-us",
        blurb: "Reach out anytime — we're here to help",
        icon: "mail",
      },
      {
        label: "Request Pricing",
        href: "/request-pricing",
        blurb: "Get a personalized cost estimate",
        icon: "dollar",
      },
      {
        label: "Careers",
        href: "/careers",
        blurb: "Join our compassionate team",
        icon: "briefcase",
      },
    ],
  },
];

/** A simple labelled link (footer columns, legal row). */
export interface NavLink {
  label: string;
  href: string;
}

/** A footer link column (mockup `.footer-column`). */
export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

/**
 * Footer link columns — the mockup's four groups
 * (Living Options · Life & Community · Resources · Get In Touch). Consumed by
 * `Footer.tsx` (Task 5).
 */
export const footerColumns: FooterColumn[] = [
  {
    heading: "Living Options",
    links: [
      { label: "Independent Living", href: "/independent-living" },
      { label: "Assisted Living", href: "/assisted-living" },
      { label: "Memory Care", href: "/memory-care" },
      { label: "Respite / Short-Term Care", href: "/respite-care" },
      { label: "Floor Plans & Pricing", href: "/floor-plans" },
    ],
  },
  {
    heading: "Life & Community",
    links: [
      { label: "Amenities & Services", href: "/amenities" },
      { label: "Dining & Nutrition", href: "/dining-nutrition" },
      { label: "Activities & Events", href: "/activities-events" },
      { label: "Photo & Video Gallery", href: "/photo-video-gallery" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog / Resource Center", href: "/blog" },
      { label: "Care Assessment", href: "/care-assessment" },
      { label: "Senior Living Guide", href: "/senior-living-guide" },
      { label: "FAQs", href: "/faq" },
      { label: "Understanding Costs", href: "/understanding-costs" },
    ],
  },
  {
    heading: "Get In Touch",
    links: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "Schedule a Tour", href: "/schedule-tour" },
      { label: "Request Pricing", href: "/request-pricing" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

/** Legal / policy links (mockup `.footer-legal`). */
export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

/** Social platform key — maps to a `skinConfig.social` URL + a lucide icon. */
export type SocialPlatform = "facebook" | "instagram" | "youtube";

/**
 * Header search "Popular searches" quicklinks (mockup
 * `.header-search-quicklinks`). Consumed by the Header search panel (Task 2).
 */
export const popularSearches: NavItem[] = [
  {
    label: "Floor Plans & Pricing",
    href: "/floor-plans",
    icon: "image",
  },
  {
    label: "Care Assessment",
    href: "/care-assessment",
    icon: "clipboard",
  },
  {
    label: "Independent Living",
    href: "/independent-living",
    icon: "help",
  },
  {
    label: "Understanding Costs",
    href: "/understanding-costs",
    icon: "dollar",
  },
  {
    label: "Move-In Process",
    href: "/move-in-process",
    icon: "check",
  },
];

/**
 * Routes that render the minimal chrome (slim Header + single-line Footer) and
 * suppress the floating Help Badge / Tour Widget / Exit Intent: focused form /
 * assessment flows where the full nav would be a distraction. Read by
 * `SiteChrome.client` (Header/Footer/GlobalWidgets slots) via
 * {@link getChromeVariant}.
 *
 * SOURCE OF TRUTH = the Plan 08 senior-living SEED: it sets
 * `meta.chrome = "minimal"` on exactly `schedule-tour` + `care-assessment`
 * (Plan 08 G7 table + Task 7), so this list mirrors those two.
 *
 * NOTE (Plan 08 mockup-vs-seed divergence, flagged for the plan owner): the GO
 * mockup additionally renders `header-minimal`/`footer-minimal` on
 * `request-pricing`, `contact-us`, and `need-help-now`. The Plan 08 seed does
 * NOT mark those minimal, so they stay on full chrome here to honor the seed
 * contract. If the seed is later widened to those slugs, add them below.
 */
export const minimalChromeRoutes: string[] = [
  "/care-assessment",
  "/schedule-tour",
];

/** Chrome layout variant shared by Header + Footer. */
export type ChromeVariant = "full" | "minimal";

/**
 * Resolves the chrome variant for a given pathname. Returns `"minimal"` for the
 * focused-flow routes in {@link minimalChromeRoutes} (exact match or a nested
 * segment of one), otherwise `"full"`.
 */
export function getChromeVariant(pathname: string | null | undefined): ChromeVariant {
  if (!pathname) return "full";
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const isMinimal = minimalChromeRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  return isMinimal ? "minimal" : "full";
}
