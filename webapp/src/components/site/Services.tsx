import { Link } from "react-router-dom";
import { Home, Building2, HeartHandshake, ArrowUpRight, Check } from "lucide-react";

const services = [
  {
    id: "residential",
    icon: Home,
    name: "Residential",
    blurb: "For homeowners and renters who'd rather think about anything else.",
    bullets: ["Weekly bin valet", "Photo proof every visit", "Pause anytime, no fees"],
    cta: "Start residential",
    href: "/signup?type=residential",
  },
  {
    id: "enterprise",
    icon: Building2,
    name: "Enterprise",
    blurb: "HOAs, property managers, multi-family — one invoice, hundreds of doors.",
    bullets: ["Volume pricing", "Dedicated account lead", "Compliance reporting"],
    cta: "Talk to enterprise",
    href: "/signup?type=enterprise",
  },
  {
    id: "elderly",
    icon: HeartHandshake,
    name: "Elderly",
    blurb: "Daily-living assistance for seniors — often covered by long-term care insurance.",
    bullets: ["Insurance billing help", "Same valet every week", "Family text updates"],
    cta: "Check insurance options",
    href: "/signup?type=elderly",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 md:mb-20">
          <div className="max-w-xl">
            <div className="font-mono-eyebrow text-muted-foreground mb-4">For every doorstep</div>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
              Three ways to never touch a bin again.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-lg">
            Pick the plan that fits — sign up online, no calls required. Switch anytime from your dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {services.map((s, i) => (
            <div
              key={s.id}
              className="group relative p-8 rounded-3xl bg-white border border-border hover:border-foreground/15 hover:-translate-y-0.5 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-7">
                <s.icon className="h-6 w-6 text-ink" strokeWidth={1.75} />
              </div>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-ink mb-3 tracking-tight">{s.name}</h3>
              <p className="text-muted-foreground mb-7 leading-relaxed">{s.blurb}</p>
              <ul className="space-y-2.5 mb-8">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[0.95rem] text-foreground/90">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to={s.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink group/link border-b border-ink/20 pb-0.5 hover:border-ink"
              >
                {s.cta}
                <ArrowUpRight className="h-4 w-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
