import { PageShell } from "@/components/site/PageShell";
import { CustomerSignupForm } from "@/components/forms/CustomerSignupForm";

export default function Waitlist() {
  return (
    <PageShell>
      <section className="relative">
        <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
        <div className="absolute -top-10 -right-32 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[110px] pointer-events-none" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-3">Service-area check</div>
              <h1 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Are we in your neighborhood?</h1>
              <p className="mt-4 text-muted-foreground">
                Drop your address — if you're in range, we'll get you started. If not, you'll join the waitlist and we'll open your route once 25+ homes cluster nearby.
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/60">
              <CustomerSignupForm customerType="residential" />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
