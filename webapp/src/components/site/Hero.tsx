import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Camera, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-[680px] bg-dots opacity-[0.35] pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
      <div className="container relative pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white hairline text-foreground/80 text-xs font-medium mb-7">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-mono-eyebrow text-[0.65rem]">Now serving Dallas–Fort Worth</span>
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-tight text-balance text-ink">
            Never roll your bins out again.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-balance">
            DashTrashTX is the curbside trash bin valet for the Dallas–Fort Worth metroplex.
            We take your bins out the night before pickup and bring them back the day after collection.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold group">
              <Link to="/signup">
                Start service — $63/mo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 rounded-2xl border-foreground/15 text-foreground bg-white hover:bg-secondary font-semibold">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-muted-foreground">
            <Trust icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Insured + background-checked" />
            <Trust icon={<Clock className="h-4 w-4 text-primary" />} label="Always on schedule" />
            <Trust icon={<Camera className="h-4 w-4 text-primary" />} label="Photo proof every visit" />
          </div>
        </div>

        <div className="mt-16 md:mt-24 max-w-5xl mx-auto animate-fade-up delay-150">
          <div className="relative rounded-[28px] overflow-hidden bg-white ring-soft border border-border">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2200&q=80"
              alt="Quiet Texas suburban street at dusk — DashTrashTX service area"
              className="w-full h-[280px] md:h-[520px] object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Stat label="Homes served" value="500+" />
              <Stat label="On-time rate" value="99.6%" />
              <Stat label="Response" value="< 4 hrs" />
              <Stat label="Metroplex" value="DFW + 14 cities" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/95 backdrop-blur-md px-4 py-3 hairline">
      <div className="font-display font-extrabold text-xl md:text-3xl text-ink leading-none">{value}</div>
      <div className="font-mono-eyebrow text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}
