import { PageShell } from "@/components/site/PageShell";
import { CustomerSignupForm } from "@/components/forms/CustomerSignupForm";

export default function Waitlist() {
  return (
    <PageShell>
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <div className="font-mono-eyebrow text-muted-foreground mb-4">Service-area check</div>
              <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
                Are we in your <span className="text-primary">neighborhood?</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Drop your address — if you're in range, we'll start you this week. If not, you'll join the waitlist and we'll open your route once 25+ homes cluster nearby.
              </p>
            </div>
            <div className="p-7 md:p-10 rounded-3xl bg-white border border-border ring-soft">
              <CustomerSignupForm customerType="residential" />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
