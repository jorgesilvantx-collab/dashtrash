import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Camera, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteCanvas } from "@/components/site/RouteCanvas";
import { BinTrio } from "@/components/site/RollingBins";
import { LogoMark } from "@/components/site/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0F1722]">
      <div className="absolute inset-0 bg-dots opacity-[0.07] pointer-events-none" />
      <div className="absolute -top-32 right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-8%] h-[400px] w-[400px] rounded-full bg-[#FF7F65]/10 blur-[140px] pointer-events-none" />

      <div className="container relative pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Headline */}
          <div className="lg:col-span-7 animate-fade-up">
            <div className="flex items-center gap-4 mb-6">
              <LogoMark size={88} className="-ml-2" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono-eyebrow text-[0.65rem]">Now serving Dallas–Fort Worth</span>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.0] tracking-[-0.03em] text-white">
              Your bins.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Handled.</span>
              </span>
              <br />
              <span className="text-white/50">Every week.</span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
              The curbside trash bin valet for Dallas–Fort Worth. Out the night before pickup, back the day after — rain, shine, or holiday. Zero effort. Every time.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-13 px-7 bg-primary text-[#0F1722] hover:bg-primary/90 rounded-2xl font-bold group shadow-[0_8px_32px_-4px_rgba(94,227,227,0.5)]">
                <Link to="/signup">
                  Start service — $63/mo
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" className="h-13 px-7 rounded-2xl border border-white/20 text-white bg-white/5 hover:bg-white/10 font-semibold">
                <a href="tel:+16823625847">
                  <Phone className="mr-2 h-4 w-4 text-primary" />
                  (682) 362-5847
                </a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/50">
              <Trust icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Insured + background-checked" />
              <Trust icon={<Clock className="h-4 w-4 text-primary" />} label="Always on schedule" />
              <Trust icon={<Camera className="h-4 w-4 text-primary" />} label="Photo proof every visit" />
            </div>

            <div className="mt-10 hidden md:block">
              <BinTrio />
            </div>
          </div>

          {/* Right: Animated route canvas (no photo) */}
          <div className="lg:col-span-5 relative animate-fade-up delay-150">
            <div className="relative aspect-[4/5] max-w-[480px] mx-auto">
              <RouteCanvas className="absolute inset-0 ring-soft shadow-[0_30px_60px_-20px_rgba(15,23,34,0.35)]" />

              {/* Floating stat card */}
              <div className="absolute -top-6 -right-2 md:-right-8 p-4 rounded-2xl bg-ink text-background shadow-[0_20px_40px_-15px_rgba(15,23,34,0.5)] rotate-[3deg] hidden sm:block border border-background/10">
                <div className="font-mono-eyebrow text-primary mb-1">This week</div>
                <div className="font-display font-extrabold text-3xl leading-none">2,400</div>
                <div className="text-xs text-background/85 mt-1">bins handled</div>
              </div>

              {/* Floating rating card */}
              <div className="absolute -bottom-4 -left-3 md:-left-6 p-3.5 rounded-2xl bg-background border border-border shadow-[0_20px_40px_-15px_rgba(15,23,34,0.25)] -rotate-[4deg] hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="h-7 w-7 rounded-full bg-primary/30 border-2 border-background flex items-center justify-center font-display font-bold text-ink text-xs">M</div>
                    <div className="h-7 w-7 rounded-full bg-[#FF7F65]/30 border-2 border-background flex items-center justify-center font-display font-bold text-ink text-xs">K</div>
                    <div className="h-7 w-7 rounded-full bg-ink/20 border-2 border-background flex items-center justify-center font-display font-bold text-ink text-xs">J</div>
                  </div>
                  <div>
                    <div className="font-display font-bold text-ink text-sm leading-none">4.9 ★</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">500+ homes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom social-proof bar */}
        <div className="mt-20 md:mt-28 animate-fade-up delay-225">
          <div className="font-mono-eyebrow text-white/30 text-center mb-6">Trusted by neighbors across</div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-display font-bold text-xl md:text-2xl text-white/40">
            <span>Dallas</span>
            <span className="text-white/20">·</span>
            <span>Plano</span>
            <span className="text-white/20">·</span>
            <span>Frisco</span>
            <span className="text-white/20">·</span>
            <span>Arlington</span>
            <span className="text-white/20">·</span>
            <span>McKinney</span>
            <span className="text-white/20">·</span>
            <span>Fort Worth</span>
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
