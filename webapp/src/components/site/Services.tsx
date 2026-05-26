import { Link } from "react-router-dom";
import { Home, Building2, HeartHandshake, ArrowUpRight } from "lucide-react";

const services = [
  {
    id: "residential",
    icon: Home,
    name: "Residential",
    blurb: "For homeowners and renters who'd rather think about anything else.",
    bullets: ["Weekly bin valet", "Photo proof", "Pause anytime"],
    cta: "Start residential",
  },
  {
    id: "enterprise",
    icon: Building2,
    name: "Enterprise",
    blurb: "HOAs, property managers, multi-family — one invoice, hundreds of doors.",
    bullets: ["Volume pricing", "Dedicated account lead", "Compliance reporting"],
    cta: "Talk to enterprise",
  },
  {
    id: "elderly",
    icon: HeartHandshake,
    name: "Elderly",
    blurb: "Daily-living assistance for seniors — often covered by long-term care insurance.",
    bullets: ["Insurance billing help", "Same valet every week", "Family text updates"],
    cta: "Check insurance options",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32 border-t border-border/60">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-xl">
            <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">For every doorstep</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Three ways to never touch a bin again.</h2>
          </div>
          <p className="text-muted-foreground max-w-md">Pick the plan that fits — sign up online, no calls required. Switch plans anytime from your dashboard.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {services.map((s) => (
            <div
              key={s.id}
              className="group relative p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all hover:-translate-y-0.5"
            >
              <s.icon className="h-8 w-8 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-display text-2xl md:text-3xl mb-3">{s.name}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{s.blurb}</p>
              <ul className="space-y-2 mb-8">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to={`/signup?type=${s.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary group/link"
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
