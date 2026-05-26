import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-background p-10 md:p-16 ring-glow">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-6xl tracking-tight text-balance">
              Never touch a bin again.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              60-second signup. First service this week. Cancel anytime — but you won't.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 group">
                <Link to="/signup">
                  Start service
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/waitlist">Check service area</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
