import { CalendarCheck2, ArrowDownToLine, ArrowUpFromLine, Camera } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: CalendarCheck2,
    title: "Tell us your pickup day",
    body: "Sign up in 60 seconds. We learn your city's collection schedule and lock in your weekly route.",
  },
  {
    n: "02",
    icon: ArrowUpFromLine,
    title: "Night before — out it goes",
    body: "Our valet rolls your bins to the curb the evening before pickup. You sleep, we work.",
  },
  {
    n: "03",
    icon: ArrowDownToLine,
    title: "Day after — back it comes",
    body: "Once the city collects, we return the bins to where you keep them. Clean driveway, every week.",
  },
  {
    n: "04",
    icon: Camera,
    title: "Photo proof, every visit",
    body: "Every service ends with a timestamped photo so you know exactly what got done — Uber-style.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">The process</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight text-balance">
            Trash day,<br /> <span className="italic text-muted-foreground">elegantly outsourced.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group relative p-6 md:p-7 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors"
            >
              <div className="absolute -top-3 left-6 font-display text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{s.n}</div>
              <s.icon className="h-7 w-7 text-primary mb-5" strokeWidth={1.5} />
              <h3 className="font-display text-xl md:text-2xl mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
