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
    body: "Our valet rolls your bins to the curb the evening before pickup. You sleep. We handle it.",
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
    <section id="how" className="relative py-24 md:py-32 bg-cream">
      <div className="container">
        <div className="max-w-2xl">
          <div className="font-mono-eyebrow text-muted-foreground mb-4">The process</div>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
            Trash day, fully <span className="text-primary">handled</span>.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Four steps. Zero phone calls. You'll forget it's even Tuesday.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="group relative p-7 rounded-3xl bg-white border border-border hover:border-foreground/15 hover:-translate-y-0.5 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono-eyebrow text-muted-foreground">{s.n}</span>
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="font-display font-bold text-xl md:text-[1.35rem] text-ink mb-2 leading-tight">{s.title}</h3>
              <p className="text-[0.95rem] text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
