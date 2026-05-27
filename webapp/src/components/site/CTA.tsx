import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BinPickup } from "@/components/site/RollingBins";

export function CTA() {
  return (
    <section className="relative py-20 md:py-28 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-[36px] bg-ink p-10 md:p-16">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#FF7F65]/20 blur-[140px]" />
          <div className="absolute inset-0 bg-dots opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

          {/* Diagonal cyan stripes — Uber-style decorative motion */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none [mask-image:linear-gradient(to_left,black_10%,transparent_70%)]">
            <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="rotate(-25 300 200)">
                <rect x="-100" y="40" width="900" height="14" fill="#5EE3E3" />
                <rect x="-100" y="100" width="900" height="14" fill="#5EE3E3" />
                <rect x="-100" y="160" width="900" height="14" fill="#5EE3E3" />
                <rect x="-100" y="220" width="900" height="14" fill="#5EE3E3" />
                <rect x="-100" y="280" width="900" height="14" fill="#5EE3E3" />
              </g>
            </svg>
          </div>

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <div className="font-mono-eyebrow text-primary mb-4">Stop touching trash</div>
              <h2 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-[-0.025em] text-background">
                Your last week
                <br />
                <span className="text-primary">rolling bins.</span>
              </h2>
              <p className="mt-6 text-lg text-background/90 max-w-xl">
                60-second signup. First service this week. Cancel anytime — but you won't.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 px-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold group">
                  <Link to="/signup">
                    Start service — $63/mo
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 rounded-2xl border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background font-semibold">
                  <a href="tel:+16823625847">
                    <Phone className="mr-2 h-4 w-4 text-primary" />
                    (682) 362-5847
                  </a>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-background/85">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Insured + background-checked
                </span>
                <span>·</span>
                <span>No contracts</span>
                <span>·</span>
                <span>No setup fees</span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl bg-background/15 backdrop-blur-md border border-background/25 p-6">
                <div className="font-mono-eyebrow text-primary">This week alone</div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Mini value="500+" label="Homes served" />
                  <Mini value="99.6%" label="On-time rate" />
                  <Mini value="2,400" label="Bins handled" />
                  <Mini value="4.9★" label="Avg rating" />
                </div>
                <div className="mt-5 pt-5 border-t border-background/20">
                  <div className="font-mono-eyebrow text-primary mb-2">Talk to a human</div>
                  <a href="tel:+16823625847" className="font-display font-bold text-background text-lg hover:text-primary transition-colors">
                    (682) 362-5847
                  </a>
                  <a href="mailto:support@dashtrashtx.com" className="block mt-1 text-sm text-background/90 hover:text-background transition-colors">
                    support@dashtrashtx.com
                  </a>
                </div>
                <div className="mt-5 pt-5 border-t border-background/20 flex items-center justify-center">
                  <BinPickup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-extrabold text-2xl md:text-3xl text-background leading-none">{value}</div>
      <div className="font-mono-eyebrow text-background/80 mt-1.5">{label}</div>
    </div>
  );
}
