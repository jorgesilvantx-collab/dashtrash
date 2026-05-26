import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 border-t border-border/60 bg-gradient-to-b from-background to-card/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">Pricing</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Honest pricing. No bin politics.</h2>
          <p className="mt-5 text-muted-foreground">One flat monthly rate for residential. Custom quotes for enterprise and insurance-covered elderly plans.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <Plan
            name="Residential"
            price="$63"
            cadence="/mo"
            blurb="Weekly bin valet for a single home."
            features={["Out the night before, back the day after", "Photo proof every visit", "Cancel anytime", "Add multiple bins for $8/each"]}
            href="/signup?type=residential"
            cta="Start service"
          />
          <Plan
            featured
            name="Enterprise"
            price="Custom"
            cadence=""
            blurb="For property managers & HOAs with multiple doors."
            features={["Volume discounts after 10 homes", "Single invoice, monthly", "Dedicated account lead", "Compliance & service reports"]}
            href="/signup?type=enterprise"
            cta="Get a quote"
          />
          <Plan
            name="Elderly"
            price="Insurance"
            cadence="covered"
            blurb="Often $0 out-of-pocket via long-term care plans."
            features={["We help submit insurance", "Same valet every week", "Family text notifications", "White-glove onboarding"]}
            href="/signup?type=elderly"
            cta="Check coverage"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
          Outside our current service area? Join the waitlist — once 25+ homes cluster nearby, we open the route and you'll be first to know.
        </p>
      </div>
    </section>
  );
}

function Plan({
  name, price, cadence, blurb, features, href, cta, featured,
}: {
  name: string; price: string; cadence: string; blurb: string;
  features: string[]; href: string; cta: string; featured?: boolean;
}) {
  return (
    <div className={`relative p-8 rounded-2xl border ${featured ? "border-primary/60 bg-card glow-cyan" : "border-border/60 bg-card"}`}>
      {featured ? (
        <div className="absolute -top-3 left-8 text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-medium">
          Most flexible
        </div>
      ) : null}
      <div className="text-sm text-muted-foreground">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <div className="font-display text-5xl tracking-tight">{price}</div>
        <div className="text-muted-foreground">{cadence}</div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{blurb}</p>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className={`mt-7 w-full ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`} variant={featured ? "default" : "outline"}>
        <Link to={href}>{cta}</Link>
      </Button>
    </div>
  );
}
