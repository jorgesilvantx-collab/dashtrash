import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 -left-32 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="container relative pt-16 pb-20 md:pt-28 md:pb-32">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now serving Dallas–Fort Worth & surrounding areas
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance">
            Your bins,<br />
            <span className="italic text-primary">handled.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl text-balance">
            White-glove trash bin valet for the Dallas–Fort Worth metroplex. We roll your cans out the night before pickup and bring them back the next day — so you never miss collection, and never look at your driveway the same way again.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 group">
              <Link to="/signup">
                Start service — $63/mo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-border/80 bg-background/40 backdrop-blur">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Insured & background-checked</div>
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Weekly route, on schedule</div>
            <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Photo proof on every visit</div>
          </div>
        </div>

        <div className="mt-16 md:mt-24 relative animate-fade-up delay-200">
          <div className="relative rounded-2xl overflow-hidden border border-border/60 ring-glow">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80"
              alt="Quiet Texas suburban street at dusk"
              className="w-full h-[280px] md:h-[520px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              <Stat label="Homes served" value="500+" />
              <Stat label="On-time rate" value="99.6%" />
              <Stat label="Avg. response" value="< 4 hrs" />
              <Stat label="Cities" value="DFW Metroplex" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl md:text-4xl text-foreground">{value}</div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
