import { useQuery } from "@tanstack/react-query";
import { CreditCard, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const STRIPE_PORTAL_URL = (import.meta.env.VITE_STRIPE_PORTAL_URL as string) || "";
const STRIPE_CHECKOUT_URL = (import.meta.env.VITE_STRIPE_CHECKOUT_URL as string) || "";

export default function Billing() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("id, status, stripe_subscription_id, current_period_start, current_period_end, cancel_at, canceled_at, created_at")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>;
  }

  const hasActive = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Billing</h1>
        <p className="mt-2 text-muted-foreground">Manage your subscription, payment method, and invoices.</p>
      </div>

      {!subscription ? (
        <div className="p-7 md:p-10 rounded-3xl bg-cream border border-border">
          <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
            <CreditCard className="h-6 w-6 text-ink" strokeWidth={1.75} />
          </div>
          <h2 className="font-display font-bold text-2xl text-ink mb-2">Start your subscription</h2>
          <p className="text-muted-foreground mb-5 max-w-md">
            Weekly bin valet service is $63/month. First service starts the week after sign-up.
          </p>
          {STRIPE_CHECKOUT_URL ? (
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold">
              <a href={`${STRIPE_CHECKOUT_URL}?client_reference_id=${user?.id}&prefilled_email=${encodeURIComponent(user?.email || "")}`} target="_blank" rel="noreferrer">
                Start subscription — $63/mo
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <div className="flex items-start gap-2 p-4 rounded-2xl bg-background border border-border text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
              <div>
                <div className="font-semibold text-ink">Checkout link not configured yet.</div>
                <div className="text-muted-foreground mt-1">Email <a className="underline" href="mailto:support@dashtrashtx.com">support@dashtrashtx.com</a> and we'll send you a payment link.</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-7 md:p-10 rounded-3xl bg-white border border-border ring-soft">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="font-mono-eyebrow text-muted-foreground mb-2">Current plan</div>
              <div className="font-display font-extrabold text-3xl text-ink">$63<span className="text-base text-muted-foreground font-medium">/month</span></div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm">
                <StatusPill status={subscription.status} />
              </div>
            </div>
            {hasActive && STRIPE_PORTAL_URL ? (
              <Button asChild variant="outline" className="rounded-2xl border-foreground/15 bg-white text-ink hover:bg-secondary font-semibold">
                <a href={STRIPE_PORTAL_URL} target="_blank" rel="noreferrer">
                  Manage in Stripe
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-border pt-5">
            <Row label="Current period start" value={fmt(subscription.current_period_start)} />
            <Row label="Renews / ends" value={fmt(subscription.current_period_end)} />
            {subscription.cancel_at ? <Row label="Cancels on" value={fmt(subscription.cancel_at)} /> : null}
            {subscription.canceled_at ? <Row label="Canceled at" value={fmt(subscription.canceled_at)} /> : null}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-primary/20 text-ink" },
    trialing: { label: "Trial", cls: "bg-primary/20 text-ink" },
    past_due: { label: "Past due", cls: "bg-accent/20 text-ink" },
    canceled: { label: "Canceled", cls: "bg-secondary text-muted-foreground" },
    paused: { label: "Paused", cls: "bg-secondary text-muted-foreground" },
    incomplete: { label: "Incomplete", cls: "bg-accent/20 text-ink" },
  };
  const s = (status && map[status]) || { label: "—", cls: "bg-secondary text-muted-foreground" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-mono-eyebrow ${s.cls}`}>{s.label}</span>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-eyebrow text-muted-foreground mb-1">{label}</div>
      <div className="text-ink font-medium">{value}</div>
    </div>
  );
}

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
