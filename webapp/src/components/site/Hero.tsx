import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Camera, Clock, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteCanvas } from "@/components/site/RouteCanvas";
import { LogoMark } from "@/components/site/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B121C]">
      {/* Ambient lighting */}
      <div className="absolute inset-0 bg-dots opacity-[0.06] pointer-events-none" />
      <div className="absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full bg-primary/25 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-8%] h-[500px] w-[500px] rounded-full bg-[#FF7F65]/15 blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B121C]/80 pointer-events-none" />

      <div className="container relative pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Headline */}
          <div className="lg:col-span-7 animate-fade-up">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md mb-7">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-mono-eyebrow text-[0.7rem] text-white/80">
                Now serving Dallas–Fort Worth
              </span>
              <span className="font-mono-eyebrow text-[0.7rem] text-primary">
                · 500+ homes
              </span>
            </div>

            <h1 className="font-display font-black text-[3rem] sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.95] tracking-[-0.04em] text-white">
              Never touch
              <br />
              your trash bin
              <br />
              <span className="text-primary">again.</span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/55 max-w-xl leading-relaxed">
              The premium curbside trash valet for DFW. We pull your bins to the curb the night before pickup and return them after — rain or shine, every week.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-14 px-8 bg-primary text-[#0B121C] hover:bg-primary/90 rounded-2xl font-black text-base group shadow-[0_12px_40px_-6px_rgba(94,227,227,0.55)]">
                <Link to="/signup">
                  Start service — $63/mo
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-14 px-7 rounded-2xl border border-white/15 text-white bg-white/[0.04] hover:bg-white/10 hover:text-white font-semibold text-base">
                <a href="tel:+16823625847">
                  <Phone className="mr-2 h-4 w-4 text-primary" />
                  (682) 362-5847
                </a>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/45">
              <Trust icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Insured + background-checked" />
              <Trust icon={<Clock className="h-4 w-4 text-primary" />} label="Always on schedule" />
              <Trust icon={<Camera className="h-4 w-4 text-primary" />} label="Photo proof every visit" />
            </div>
          </div>

          {/* Right: Brand mark + route canvas */}
          <div className="lg:col-span-5 relative animate-fade-up delay-150">
            <div className="relative aspect-[4/5] max-w-[480px] mx-auto">
              {/* Big logo mark floating behind */}
              <div className="absolute -top-10 -left-6 z-0 hidden sm:block opacity-90">
                <LogoMark size={140} />
              </div>

              <RouteCanvas className="absolute inset-0 rounded-3xl ring-1 ring-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]" />

              {/* Floating stat card */}
              <div className="absolute -top-6 -right-2 md:-right-8 p-4 rounded-2xl bg-white text-ink shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] rotate-[3deg] hidden sm:block border border-black/5">
                <div className="font-mono-eyebrow text-[#FF7F65] mb-1">This week</div>
                <div className="font-display font-black text-3xl leading-none">2,400</div>
                <div className="text-xs text-muted-foreground mt-1">bins handled</div>
              </div>

              {/* Floating rating card */}
              <div className="absolute -bottom-4 -left-3 md:-left-6 p-3.5 rounded-2xl bg-white border border-black/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)] -rotate-[4deg] hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="h-7 w-7 rounded-full bg-primary/30 border-2 border-white flex items-center justify-center font-display font-bold text-ink text-xs">M</div>
                    <div className="h-7 w-7 rounded-full bg-[#FF7F65]/30 border-2 border-white flex items-center justify-center font-display font-bold text-ink text-xs">K</div>
                    <div className="h-7 w-7 rounded-full bg-ink/20 border-2 border-white flex items-center justify-center font-display font-bold text-ink text-xs">J</div>
                  </div>
                  <div>
                    <div className="font-display font-black text-ink text-sm leading-none">4.9 ★</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">500+ homes</div>
                  </div>
                </div>
              </div>

              {/* New: premium badge */}
              <div className="absolute top-1/2 -right-3 md:-right-5 -translate-y-1/2 p-3 rounded-2xl bg-[#0B121C] border border-primary/30 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] hidden md:flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-mono-eyebrow text-primary text-[0.65rem]">Premium</div>
                  <div className="text-white font-display font-bold text-sm leading-tight">White-glove</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cities band */}
        <div className="mt-20 md:mt-28 animate-fade-up delay-225 border-t border-white/[0.06] pt-10">
          <div className="font-mono-eyebrow text-white/30 text-center mb-7 text-xs">Trusted by neighbors across</div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-4 font-display font-black text-xl md:text-2xl text-white/35">
            <span>Dallas</span>
            <span className="text-primary/30">●</span>
            <span>Plano</span>
            <span className="text-primary/30">●</span>
            <span>Frisco</span>
            <span className="text-primary/30">●</span>
            <span>Arlington</span>
            <span className="text-primary/30">●</span>
            <span>McKinney</span>
            <span className="text-primary/30">●</span>
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
