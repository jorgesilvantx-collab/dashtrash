import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cities = [
  "Dallas", "Fort Worth", "Plano", "Frisco", "Arlington", "Irving",
  "McKinney", "Garland", "Mesquite", "Carrollton", "Richardson",
  "Lewisville", "Allen", "Denton", "Mansfield", "Grand Prairie",
];

export function Coverage() {
  return (
    <section id="coverage" className="relative py-24 md:py-32 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <div className="font-mono-eyebrow text-muted-foreground mb-4">Coverage</div>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
              Serving DFW & <span className="text-primary">15 surrounding cities</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-md leading-relaxed">
              Outside our current routes? When 25+ homes in your area sign up, we open a clustered route — you'll be notified the moment it goes live.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {cities.map((c) => (
                <span
                  key={c}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-border text-sm text-foreground/80 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 px-6 font-semibold">
                <Link to="/waitlist">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Check your address
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl h-12 px-6 border-foreground/15 bg-white text-ink hover:bg-secondary font-semibold">
                <Link to="/signup">
                  I'm in the area
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square rounded-[28px] overflow-hidden bg-white ring-soft border border-border">
              <img
                src="https://images.unsplash.com/photo-1564281312-9cef0b1b8c3a?auto=format&fit=crop&w=1400&q=80"
                alt="Texas HOA neighborhood streetscape — DashTrashTX coverage area"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-white/95 backdrop-blur-xl hairline">
                <div className="font-mono-eyebrow text-muted-foreground">Cluster status — your zip</div>
                <div className="font-display font-extrabold text-3xl text-ink mt-1.5">17 / 25 homes</div>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-[68%] bg-primary rounded-full" />
                </div>
                <div className="text-xs text-muted-foreground mt-2.5">8 more sign-ups and your route opens</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
