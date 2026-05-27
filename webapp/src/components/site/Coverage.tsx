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
            <div className="relative aspect-square rounded-[28px] overflow-hidden bg-ink ring-soft border border-border">
              {/* Grid + glow background */}
              <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />
              <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#FF7F65]/15 blur-[110px]" />

              <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <pattern id="cov-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5EE3E3" strokeOpacity="0.07" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="500" height="500" fill="url(#cov-grid)" />

                {/* DFW-ish street grid */}
                <line x1="0" y1="160" x2="500" y2="160" stroke="#5EE3E3" strokeOpacity="0.1" strokeWidth="1.5" />
                <line x1="0" y1="320" x2="500" y2="320" stroke="#5EE3E3" strokeOpacity="0.1" strokeWidth="1.5" />
                <line x1="180" y1="0" x2="180" y2="500" stroke="#5EE3E3" strokeOpacity="0.1" strokeWidth="1.5" />
                <line x1="340" y1="0" x2="340" y2="500" stroke="#5EE3E3" strokeOpacity="0.1" strokeWidth="1.5" />

                {/* Existing routes (cyan) */}
                <circle cx="180" cy="160" r="110" fill="#5EE3E3" fillOpacity="0.08" stroke="#5EE3E3" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="340" cy="320" r="90"  fill="#5EE3E3" fillOpacity="0.08" stroke="#5EE3E3" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3" />

                {/* Waitlist cluster (coral, pulsing) */}
                <circle cx="100" cy="380" r="56" fill="#FF7F65" fillOpacity="0.1" stroke="#FF7F65" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="4 3" />

                {/* Stop pins */}
                <g>
                  {[[140,140],[210,180],[200,130],[170,210],[150,170],[300,310],[360,340],[330,360],[380,300]].map(([x,y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#5EE3E3" fillOpacity="0.25" />
                      <circle cx={x} cy={y} r="2.5" fill="#5EE3E3" />
                    </g>
                  ))}
                  {[[90,380],[120,400],[80,400],[110,360]].map(([x,y], i) => (
                    <g key={`w${i}`}>
                      <circle cx={x} cy={y} r="5" fill="#FF7F65" fillOpacity="0.25" />
                      <circle cx={x} cy={y} r="2.5" fill="#FF7F65" />
                    </g>
                  ))}
                </g>
              </svg>

              {/* Cluster status overlay */}
              <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-background/15 backdrop-blur-xl border border-background/25">
                <div className="font-mono-eyebrow text-primary">Cluster status — your zip</div>
                <div className="font-display font-extrabold text-3xl text-background mt-1.5">17 / 25 homes</div>
                <div className="mt-3 h-2 rounded-full bg-background/20 overflow-hidden">
                  <div className="h-full w-[68%] bg-primary rounded-full" />
                </div>
                <div className="text-xs text-background/90 mt-2.5">8 more sign-ups and your route opens</div>
              </div>

              {/* Top legend */}
              <div className="absolute top-5 left-5 flex gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/10 backdrop-blur-md border border-background/15 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono-eyebrow text-background">Live routes</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/10 backdrop-blur-md border border-background/15 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF7F65]" />
                  <span className="font-mono-eyebrow text-background">Waitlist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
