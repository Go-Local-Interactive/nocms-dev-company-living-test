import type { ReactNode } from "react";
import type { BlockProps } from "./types";

export type BlockRenderer = (props: BlockProps) => ReactNode | Promise<ReactNode>;

import {
  BannerBlock,
  ContentBlock,
  RowGroupBlock,
  CodeBlock,
  FaqBlock,
  MediaBlockBlock,
  SpacerBlock,
  DividerBlock,
} from "./Baseline";
import { GalleryBlock } from "./GalleryBlock";
import { ContentIntroBlock } from "./ContentIntroBlock";
import { ContentBlocksBlock } from "./ContentBlocksBlock";
import { IconCardGridBlock } from "./IconCardGridBlock";
import { CardCarouselBlock } from "./CardCarouselBlock";
import { HeroBlock } from "./HeroBlock";
import { CareLevelGridBlock } from "./CareLevelGridBlock";
import { CareLevelCardBlock } from "./CareLevelCardBlock";
import { FloorPlanGridBlock } from "./FloorPlanGridBlock";
import { FloorPlanCardBlock } from "./FloorPlanCardBlock";
import { TestimonialBlock } from "./TestimonialBlock";
import { TourFormBlock } from "./TourFormBlock";
import { CalloutBandBlock } from "./CalloutBandBlock";
import { TimelineBlock } from "./TimelineBlock";
import { AccordionBlock } from "./AccordionBlock";
import { StatsBarBlock } from "./StatsBarBlock";
import { TeamGridBlock } from "./TeamGridBlock";
import { AmenityGridBlock } from "./AmenityGridBlock";
import { EventsListBlock } from "./EventsListBlock";
import { AccreditationBarBlock } from "./AccreditationBarBlock";
import { UrgencyStripBlock } from "./UrgencyStripBlock";
import { CareLevelNavBlock } from "./CareLevelNavBlock";
import { PricingCardsBlock } from "./PricingCardsBlock";
import { FeatureSectionsBlock } from "./FeatureSectionsBlock";
import { LifestyleCardsBlock } from "./LifestyleCardsBlock";
import { ResourceCardsBlock } from "./ResourceCardsBlock";
import { FinalCtaBlock } from "./FinalCtaBlock";
import { AssessmentCalloutBlock } from "./AssessmentCalloutBlock";
import { RequestPricingFormBlock } from "./RequestPricingFormBlock";
import { SearchResultsBlock } from "./SearchResultsBlock";
import { CareAssessmentBlock } from "./CareAssessmentBlock";

/** Slug-keyed registry. Slug values MUST match Payload block slugs in
 *  nocms/src/payload/blocks/atomic.ts. Senior-living-specific renderers
 *  (hero, care-level-grid, testimonial, tour-form, etc.) are registered here
 *  as they're added in C2-C10. */
export const REGISTRY: Record<string, BlockRenderer> = {
  hero: HeroBlock,
  "care-level-grid": CareLevelGridBlock,
  "care-level-card": CareLevelCardBlock,
  "floor-plan-grid": FloorPlanGridBlock,
  "floor-plan-card": FloorPlanCardBlock,
  testimonial: TestimonialBlock,
  "tour-form": TourFormBlock,
  "request-pricing-form": RequestPricingFormBlock,
  "search-results": SearchResultsBlock,
  "care-assessment": CareAssessmentBlock,
  "crisis-callout": CalloutBandBlock,
  "callout-band": FinalCtaBlock,
  timeline: TimelineBlock,
  accordion: AccordionBlock,
  "stats-bar": StatsBarBlock,
  "team-grid": TeamGridBlock,
  "amenity-grid": AmenityGridBlock,
  "assessment-callout": AssessmentCalloutBlock,
  "events-list": EventsListBlock,
  "accreditation-bar": AccreditationBarBlock,
  "urgency-strip": UrgencyStripBlock,
  "care-level-nav": CareLevelNavBlock,
  "pricing-cards": PricingCardsBlock,
  "feature-sections": FeatureSectionsBlock,
  "lifestyle-cards": LifestyleCardsBlock,
  "resource-cards": ResourceCardsBlock,
  banner: BannerBlock,
  content: ContentBlock,
  "row-group": RowGroupBlock,
  code: CodeBlock,
  faq: FaqBlock,
  "media-block": MediaBlockBlock,
  gallery: GalleryBlock,
  "content-intro": ContentIntroBlock,
  "content-blocks": ContentBlocksBlock,
  "icon-card-grid": IconCardGridBlock,
  "card-carousel": CardCarouselBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
};
