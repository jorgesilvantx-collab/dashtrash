import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-cream">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="font-mono-eyebrow text-muted-foreground mb-4">Pricing</div>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
            Honest pricing. <span className="text-primary">No bin politics.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            One flat monthly rate for residential. Custom quotes for enterprise and insurance-covered elderly plans.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <Plan
            name="Residential"
            price="$63"
            cadence="/mo"
            blurb="Weekly bin valet for a single home."
            features={[
              "Out the night before, back the day after",
              "Photo proof every visit",
              "Cancel anytime",
              "Add extra bins for $8 each",
            ]}
            href="/signup?type=residential"
            cta="Start service"
          />
          <Plan
            featured
            name="Enterprise"
            price="Custom"
            cadence=""
            blurb="For property managers & HOAs with multiple doors."
            features={[
              "Volume discounts past 10 homes",
              "Single invoice, monthly",
              "Dedicated account lead",
              "Compliance & service reports",
            ]}
            href="/signup?type=enterprise"
            cta="Get a quote"
          />
          <Plan
            name="Elderly"
            price="Insurance"
            cadence="covered"
            blurb="Often $0 out-of-pocket via long-term care plans."
            features={[
              "We help submit insurance",
              "Same valet every week",
              "Family text notifications",
              "White-glove onboarding",
            ]}
            href="/signup?type=elderly"
            cta="Check coverage"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10 max-w-xl mx-auto">
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
    <div
      className={cn(
        "relative p-8 rounded-3xl bg-white border transition-all",
        featured
          ? "border-ink ring-cyan -translate-y-1"
          : "border-border hover:border-foreground/15"
      )}
    >
      {featured ? (
        <div className="absolute -top-3 left-8 text-[0.65rem] tracking-[0.18em] uppercase font-mono-eyebrow px-3 py-1 rounded-full bg-ink text-background">
          Most popular
        </div>
      ) : null}
      <div className="font-mono-eyebrow text-muted-foreground">{name}</div>
      <div className="mt-3 flex items-baseline gap-1">
        <div className="font-display font-extrabold text-5xl md:text-6xl tracking-tight text-ink">{price}</div>
        <div className="text-muted-foreground text-sm">{cadence}</div>
      </div>
      <p className="mt-4 text-[0.95rem] text-muted-foreground leading-relaxed">{blurb}</p>
      <ul className="mt-7 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[0.95rem]">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        size="lg"
        className={cn(
          "mt-8 w-full rounded-2xl h-12 font-semibold",
          featured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-white border border-foreground/15 text-ink hover:bg-secondary"
        )}
      >
        <Link to={href}>{cta}</Link>
      </Button>
    </div>
  );
}
