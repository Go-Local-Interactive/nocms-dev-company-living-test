/**
 * Skin config — the per-project brand defaults for this template.
 *
 * Golden Oaks is the DEFAULT skin, not a hardcode: the NoCMS scaffold's
 * design-brief overlay rewrites these fields per project at scaffold time.
 * Field mapping from the upstream `brand-clone-config.json`:
 *
 *   brand-clone-config.json   →  SkinConfig
 *   ────────────────────────     ───────────────────
 *   brand_name                →  brandName
 *   brand_suffix              →  brandSuffix
 *   brand_tagline             →  tagline
 *   phone_display             →  contactPhone
 *   brand_email               →  contactEmail
 *   address_line1             →  primaryAddress.line1
 *   address_line2 (split)     →  primaryAddress.{city,state,zip}
 *   logo_path                 →  logoPath
 *   colors.* / font_*         →  globals.css @theme tokens (not here)
 *
 * Colors and fonts live as `--color-*` / `--font-*` tokens in
 * `src/app/globals.css` (@theme), NOT in this file — see CONVENTIONS-golden-oaks.md.
 */
export interface SkinConfig {
  brandName: string;
  /** Descriptor after the brand name, e.g. "Senior Living". */
  brandSuffix?: string;
  tagline: string;
  /**
   * Default hero layout variant. The five Golden Oaks patterns are the
   * canonical values; a per-block `settings.variant` (read in `HeroBlock`)
   * overrides this default.
   *
   * Back-compat aliases (mapped internally by `HeroBlock` / `PageHero`, so
   * existing data + route callers keep working):
   *   - `image`  → `fullbleed`              (full-bleed photo + overlay header)
   *   - `simple` → fullbleed, no media       (text-only on the primary surface)
   *   - `search` → `fullbleed` + search form (search-form sub-render)
   */
  heroVariant:
    | "video"
    | "fullbleed"
    | "split-stats"
    | "toprow"
    | "stats"
    // back-compat aliases (see comment above):
    | "image"
    | "search"
    | "simple";
  /** Default community slug — used to deep-link tour / pricing CTAs. */
  primaryCommunitySlug?: string;
  contactPhone?: string;
  contactEmail?: string;
  /**
   * Path under public/ to the brand logo (see media path convention).
   * @deprecated Prefer {@link logo}; kept for back-compat with existing callers.
   */
  logoPath?: string;
  /**
   * Brand logo for the chrome (Header, Footer). `src` follows the media path
   * convention (`/golden-oaks/<file>`); `alt` doubles as the inline-editable
   * brand label (maps to `brandName` in the editor contract).
   */
  logo?: {
    src: string;
    alt: string;
  };
  primaryAddress?: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  /** Office / visiting hours, shown in the footer (mockup "Mon–Fri… Sat–Sun…"). */
  hours?: {
    weekdays: string;
    weekends: string;
  };
  /** Social profile URLs — drive the footer social-icon row. Omit to hide one. */
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

const skinConfig: SkinConfig = {
  brandName: "Golden Oaks",
  brandSuffix: "Senior Living",
  tagline: "Where Every Day Feels Like Home",
  heroVariant: "video",
  primaryCommunitySlug: "main-community",
  contactPhone: "(555) 867-5309",
  contactEmail: "info@goldenoaks.com",
  logoPath: "/golden-oaks/golden-oaks-logo.png",
  logo: {
    src: "/golden-oaks/golden-oaks-logo.png",
    alt: "Golden Oaks Senior Living logo",
  },
  primaryAddress: {
    line1: "123 Willowbrook Lane",
    city: "Maplewood",
    state: "TN",
    zip: "37064",
  },
  hours: {
    weekdays: "Mon–Fri: 8:00 AM – 6:00 PM",
    weekends: "Sat–Sun: 9:00 AM – 4:00 PM",
  },
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
};

export default skinConfig;
