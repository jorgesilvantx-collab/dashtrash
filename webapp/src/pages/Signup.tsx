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
      <section className="relative">
        <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
        <div className="absolute top-10 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px] pointer-events-none" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-3">Start service</div>
              <h1 className="font-display text-4xl md:text-6xl tracking-tight text-balance">Let's get your bins handled.</h1>
              <p className="mt-4 text-muted-foreground">Pick the plan that fits. 60 seconds to sign up.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    active === t.id
                      ? "border-primary/60 bg-card glow-cyan"
                      : "border-border/60 bg-card/60 hover:border-border"
                  )}
                >
                  <t.icon className={cn("h-5 w-5 mb-2", active === t.id ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                  <div className="font-display text-lg">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/60">
              <CustomerSignupForm customerType={active} />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
