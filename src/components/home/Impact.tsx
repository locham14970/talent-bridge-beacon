import { SectionHeading } from "./SectionHeading";

const GOALS = [
  {
    number: 4,
    name: "Quality Education",
    swatch: "bg-sdg-4",
    body: "Recognizes prior learning and links people to upskilling and certification pathways that support lifelong learning.",
  },
  {
    number: 8,
    name: "Decent Work and Economic Growth",
    swatch: "bg-sdg-8",
    body: "Helps skilled refugees move toward productive, fairly matched employment that uses their full abilities.",
  },
  {
    number: 10,
    name: "Reduced Inequalities",
    swatch: "bg-sdg-10",
    body: "Works to reduce disadvantages linked to displacement, so opportunity depends on skills rather than origin.",
  },
  {
    number: 16,
    name: "Peace, Justice and Strong Institutions",
    swatch: "bg-sdg-16",
    body: "Supports clearer access to information on rights, documentation and lawful employment pathways.",
  },
  {
    number: 17,
    name: "Partnerships for the Goals",
    swatch: "bg-sdg-17",
    body: "Designed to bring refugees, employers, educators and support organizations together around shared outcomes.",
  },
];

export function Impact() {
  return (
    <section id="about" aria-labelledby="impact-title" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="impact-title"
          eyebrow="Mission & impact"
          title="Built to advance the UN Sustainable Development Goals."
          intro="TalentBridge AI exists so that displacement does not erase expertise. Our approach is designed to contribute to five of the United Nations Sustainable Development Goals."
        />

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {GOALS.map((g) => (
            <li
              key={g.number}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className={`${g.swatch} flex items-end justify-between px-6 pb-5 pt-6 text-navy-foreground`}>
                <span className="font-display text-5xl font-bold leading-none">{g.number}</span>
                <span className="eyebrow text-[0.65rem] opacity-90">SDG</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-base font-semibold leading-snug text-navy">{g.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
