import type { CustomSection } from "@/types";

function getEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
}

export default function SectionVideo({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; video_url?: string; caption?: string };

  return (
    <section id={section.anchor} className="py-24 bg-cream">
      <div className="max-w-4xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        {c.video_url && (
          <div className="aspect-video rounded-2xl overflow-hidden shadow-elegant">
            <iframe
              src={getEmbedUrl(c.video_url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={c.headline || "Video"}
            />
          </div>
        )}
        {c.caption && <p className="text-center text-slate mt-6">{c.caption}</p>}
      </div>
    </section>
  );
}
