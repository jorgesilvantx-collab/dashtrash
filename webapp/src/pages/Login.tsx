import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const labels: Record<string, { title: string; sub: string; redirect: string }> = {
  customer: {
    title: "Customer sign-in",
    sub: "Manage your subscription, homes, and view photo proof.",
    redirect: "/dashboard",
  },
  driver: {
    title: "Driver sign-in",
    sub: "View routes, mark stops complete, upload photos.",
    redirect: "/driver",
  },
  admin: {
    title: "Owner / dispatch sign-in",
    sub: "See every route, jump in if you have to run one, and manage drivers, subscriptions, and the waitlist.",
    redirect: "/admin",
  },
};

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  const role = params.get("role") ?? "customer";
  const label = labels[role] ?? labels.customer;
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === "admin") navigate(next || "/admin", { replace: true });
      else if (profile.role === "driver") navigate(next || "/driver", { replace: true });
      else navigate(next || "/dashboard", { replace: true });
    }
  }, [loading, session, profile, next, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErr(null);
    try {
      const res = await fetch("/api/auth-magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, next: next || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || "Could not send sign-in link.");
      }
      setState("sent");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send sign-in link.");
      setState("error");
    }
  }

  return (
    <PageShell>
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8 animate-fade-up">
              <div className="font-mono-eyebrow text-muted-foreground mb-4">Sign in</div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-ink tracking-tight">
                {label.title}
              </h1>
              <p className="mt-3 text-muted-foreground">{label.sub}</p>
            </div>

            <div className="p-7 md:p-8 rounded-3xl bg-white border border-border ring-soft">
              {state === "sent" ? (
                <div className="text-center py-6 animate-fade-up">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-7 w-7 text-ink" strokeWidth={2} />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-ink mb-2">Check your email.</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We sent a magic sign-in link to <span className="text-ink font-medium">{email}</span>. Click it to log in — no password needed.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-ink font-medium">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>

                  {state === "error" && err ? (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={state === "sending"}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold"
                  >
                    {state === "sending" ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending magic link…</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" /> Email me a sign-in link</>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    New here? <a href="/signup" className="text-ink font-semibold underline underline-offset-2 hover:text-primary">Start service</a> or <a href="/careers" className="text-ink font-semibold underline underline-offset-2 hover:text-primary">apply to drive</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
