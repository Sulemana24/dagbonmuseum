/**
 * Default site content. Every value marked PLACEHOLDER is unverified and must be
 * replaced from the admin Settings page (Phase 4) once the museum confirms it.
 */
export const PLACEHOLDER = "To be confirmed";

export const siteConfig = {
  name: "Dagbon and Ghana Civilization Museum",
  shortName: "Dagbon Museum",
  description:
    "Discover the history, traditions, people, and cultural treasures that tell the story of Dagbon and Ghana's rich civilization.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: { email: PLACEHOLDER, phone: PLACEHOLDER },
  location: { address: PLACEHOLDER },
  openingHours: PLACEHOLDER,
  social: [] as { label: string; href: string }[],
};

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "History and Heritage", href: "/history" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Collections", href: "/collections" },
  { label: "Learn", href: "/learn" },
  { label: "Visit Us", href: "/visit" },
  { label: "Contact", href: "/contact" },
] as const;

/** Heritage categories from the brief. Articles store `categorySlug` matching these. */
export const heritageCategories = [
  {
    slug: "dagbon-history",
    label: "Dagbon History",
    blurb: "Origins, narratives and the historical overview of Dagbon.",
  },
  {
    slug: "traditional-leadership",
    label: "Traditional Leadership and Institutions",
    blurb: "Chieftaincy and the institutions that guide Dagbon.",
  },
  {
    slug: "festivals",
    label: "Festivals and Celebrations",
    blurb: "Festivals, ceremonies and the cultural calendar.",
  },
  {
    slug: "art-crafts-artifacts",
    label: "Art, Crafts, and Artifacts",
    blurb: "Traditional crafts and the objects that carry memory.",
  },
  {
    slug: "music-dance",
    label: "Music and Dance",
    blurb: "Traditional music, drumming and dance.",
  },
  {
    slug: "language-oral-traditions",
    label: "Language and Oral Traditions",
    blurb: "Dagbani, literature and oral histories.",
  },
  {
    slug: "historical-places",
    label: "Historical Places",
    blurb: "Architecture and sites of historical importance.",
  },
  {
    slug: "ghanaian-civilization",
    label: "Ghanaian Civilization",
    blurb: "Dagbon within Ghana's wider cultural history.",
  },
] as const;

/** Prefix for generated artifact collection IDs, e.g. DGM-2026-0001. Change to the museum's own convention. */
export const COLLECTION_ID_PREFIX = "DGM";
