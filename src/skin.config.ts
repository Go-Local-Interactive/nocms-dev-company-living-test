interface SkinConfig {
  brandName: string;
  logoUrl?: string;
  tagline: string;
  heroVariant: "video" | "search" | "image" | "simple";
  primaryFacilitySlug?: string;
  contactPhone?: string;
  contactEmail?: string;
  primaryAddress?: { line1: string; city: string; state: string; zip: string };
}

const skinConfig: SkinConfig = {
  brandName: "Living Test",
  tagline: "Secure self-storage from Living Test.",
  heroVariant: "search",
};

export default skinConfig;
