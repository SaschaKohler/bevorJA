import type { CustomSection } from "@/types";
import SectionHero from "./SectionHero";
import SectionTextImage from "./SectionTextImage";
import SectionFeaturesGrid from "./SectionFeaturesGrid";
import SectionTestimonials from "./SectionTestimonials";
import SectionFAQ from "./SectionFAQ";
import SectionGallery from "./SectionGallery";
import SectionTimeline from "./SectionTimeline";
import SectionCountdown from "./SectionCountdown";
import SectionVideo from "./SectionVideo";
import SectionPricing from "./SectionPricing";
import SectionContact from "./SectionContact";

export function DynamicSection({ section }: { section: CustomSection }) {
  switch (section.template_type) {
    case "hero":
      return <SectionHero section={section} />;
    case "text_image_left":
    case "text_image_right":
      return <SectionTextImage section={section} />;
    case "features_grid":
      return <SectionFeaturesGrid section={section} />;
    case "testimonials":
      return <SectionTestimonials section={section} />;
    case "faq":
      return <SectionFAQ section={section} />;
    case "gallery":
      return <SectionGallery section={section} />;
    case "timeline":
      return <SectionTimeline section={section} />;
    case "countdown":
      return <SectionCountdown section={section} />;
    case "video":
      return <SectionVideo section={section} />;
    case "pricing":
      return <SectionPricing section={section} />;
    case "contact":
      return <SectionContact section={section} />;
    default:
      return null;
  }
}
