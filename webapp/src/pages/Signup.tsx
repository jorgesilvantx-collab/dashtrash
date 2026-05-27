import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Building2, HeartHandshake } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { CustomerSignupForm } from "@/components/forms/CustomerSignupForm";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type CustType = "residential" | "enterprise" | "elderly";

const tabs: Array<{ id: CustType; label: string; icon: typeof Home; subtitle: string }> = [
  { id: "residential", label: "Residential", icon: Home, subtitle: "Single home, $63/mo" },
  { id: "enterprise", label: "Enterprise", icon: Building2, subtitle: "HOAs & property mgrs" },
  { id: "elderly", label: "Elderly + Insurance", icon: HeartHandshake, subtitle: "Often $0 out-of-pocket" },
];

export default function Signup() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
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
      <section className="relative bg-[#0F1722] overflow-hidden">
        <div className="absolute -top-32 right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/15 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-8%] h-[400px] w-[400px] rounded-full bg-[#FF7F65]/10 blur-[140px] pointer-events-none" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <div className="font-mono-eyebrow text-primary mb-4">Start service · 60 seconds</div>
              <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight text-balance text-white leading-[1.05]">
                Let's get your bins <span className="text-primary">handled</span>.
              </h1>
              <p className="mt-5 text-lg text-white/60">
                Tell us your address — we'll show you instantly if you're in our route or if we need to add you to the waitlist.
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
                      ? "border-primary bg-white text-ink shadow-[0_8px_32px_-4px_rgba(94,227,227,0.4)] -translate-y-0.5"
                      : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-3",
                    active === t.id ? "bg-primary/20" : "bg-white/10"
                  )}>
                    <t.icon className={cn("h-5 w-5", active === t.id ? "text-ink" : "text-primary")} strokeWidth={1.75} />
                  </div>
                  <div className={cn("font-display font-bold text-lg leading-tight", active === t.id ? "text-ink" : "text-white")}>{t.label}</div>
                  <div className={cn("text-xs mt-1", active === t.id ? "text-muted-foreground" : "text-white/50")}>{t.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="p-7 md:p-10 rounded-3xl bg-white border border-border shadow-[0_30px_60px_-20px_rgba(15,23,34,0.5)]">
              <CustomerSignupForm
                customerType={active}
                defaultEmail={user?.email ?? undefined}
                userId={user?.id ?? undefined}
              />
            </div>

            <p className="text-center text-white/40 text-sm mt-6">
              {user ? "Signed in — your subscription will be linked to your account." : "No account needed yet — we'll send you a magic link after we confirm your area."}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
