import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Coverage() {
  return (
    <section id="coverage" className="relative py-24 md:py-32 border-t border-border/60 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">Coverage</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Serving DFW & surrounding cities.</h2>
            <p className="mt-5 text-muted-foreground max-w-md leading-relaxed">
              Dallas, Fort Worth, Plano, Frisco, Arlington, Irving, McKinney, Garland and more. Outside our current route? When 25+ homes in your area sign up, we open a clustered route — you'll be notified the moment it goes live.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <Step n="1" label="Drop your address" />
              <Step n="2" label="We cluster your area" />
              <Step n="3" label="Route opens — you ride first" />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/waitlist">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Check your address
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/signup">I'm already in service area</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-card border border-border/60 overflow-hidden ring-glow">
              <img
                src="https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=1200&q=80"
                alt="Texas neighborhood map"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-background/80 backdrop-blur border border-border/60">
                <div className="text-xs text-muted-foreground">Cluster status — your zip</div>
                <div className="font-display text-2xl mt-1">17 / 25 homes</div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-[68%] bg-primary" />
                </div>
                <div className="text-xs text-muted-foreground mt-2">8 more sign-ups and your route opens</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/60">
      <div className="font-display text-lg text-primary">{n}</div>
      <div className="text-sm mt-1 leading-snug">{label}</div>
    </div>
  );
}
