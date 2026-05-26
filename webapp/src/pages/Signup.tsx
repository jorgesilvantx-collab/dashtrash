import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Building2, HeartHandshake } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { CustomerSignupForm } from "@/components/forms/CustomerSignupForm";
import { cn } from "@/lib/utils";

type CustType = "residential" | "enterprise" | "elderly";

const tabs: Array<{ id: CustType; label: string; icon: typeof Home; subtitle: string }> = [
  { id: "residential", label: "Residential", icon: Home, subtitle: "Single home, $63/mo" },
  { id: "enterprise", label: "Enterprise", icon: Building2, subtitle: "HOAs & property mgrs" },
  { id: "elderly", label: "Elderly + Insurance", icon: HeartHandshake, subtitle: "Often $0 out-of-pocket" },
];

export default function Signup() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("type") as CustType) || "residential";
  const [active, setActive] = useState<CustType>(initial);

  useEffect(() => {
    const t = params.get("type") as CustType | null;
    if (t && t !== active) setActive(t);
  }, [params]);

  function selectTab(id: CustType) {
    setActive(id);
    setParams({ type: id });
  }

  return (
    <PageShell>
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <div className="font-mono-eyebrow text-muted-foreground mb-4">Start service</div>
              <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-balance text-ink">
                Let's get your bins <span className="text-primary">handled</span>.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Pick the plan that fits. 60 seconds to sign up.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={cn(
                    "p-5 rounded-2xl border text-left transition-all",
                    active === t.id
                      ? "border-ink bg-white ring-cyan -translate-y-0.5"
                      : "border-border bg-white hover:border-foreground/15"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-3",
                    active === t.id ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <t.icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                  </div>
                  <div className="font-display font-bold text-lg text-ink leading-tight">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="p-7 md:p-10 rounded-3xl bg-white border border-border ring-soft">
              <CustomerSignupForm customerType={active} />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
