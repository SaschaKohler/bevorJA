import type { CustomSection } from "@/types";

interface TimelineStep {
  title: string;
  description: string;
  date?: string;
}

export default function SectionTimeline({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; steps?: TimelineStep[] };
  const steps = c.steps || [];

  return (
    <section id={section.anchor} className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gold/30" />
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative pl-16">
                <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-gold border-4 border-white shadow" />
                {step.date && <span className="text-sm text-gold-dark font-medium">{step.date}</span>}
                <h3 className="font-serif text-xl text-charcoal mt-1 mb-2">{step.title}</h3>
                <p className="text-slate leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
