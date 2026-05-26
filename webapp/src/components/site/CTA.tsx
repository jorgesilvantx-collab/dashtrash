import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-20 md:py-28 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-[36px] bg-ink p-10 md:p-16">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-[140px]" />
          <div className="absolute inset-0 bg-dots opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <div className="font-mono-eyebrow text-primary/80 mb-4">Stop touching trash</div>
              <h2 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-balance text-background">
                Never roll your bins out <span className="text-primary">again.</span>
              </h2>
              <p className="mt-6 text-lg text-background/70 max-w-xl">
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
                  <Link to="/waitlist">Check service area</Link>
                </Button>
              </div>
              <div className="mt-7 flex items-center gap-2 text-sm text-background/60">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Insured + background-checked drivers. No contracts. No setup fees.
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl bg-background/10 backdrop-blur-md border border-background/15 p-6">
                <div className="font-mono-eyebrow text-primary/80">This week alone</div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Mini value="500+" label="Homes served" />
                  <Mini value="99.6%" label="On-time rate" />
                  <Mini value="2,400" label="Bins handled" />
                  <Mini value="4.9★" label="Avg rating" />
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
      <div className="font-mono-eyebrow text-background/50 mt-1.5">{label}</div>
    </div>
  );
}
