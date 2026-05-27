import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Banknote, CheckCircle2, AlertCircle, Loader2, ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type StatusResp = {
  connected: boolean;
  account_id?: string;
  payouts_enabled: boolean;
  details_submitted: boolean;
  charges_enabled: boolean;
  requirements: { currently_due?: string[]; disabled_reason?: string | null } | null;
};

type Payout = {
  id: string;
  route_id: string;
  stops_count: number;
  miles: number;
  home_pay_cents: number;
  mileage_pay_cents: number;
  total_cents: number;
  status: "pending" | "paid" | "failed" | "manual";
  stripe_transfer_id: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string;
};

type Earnings = {
  driver_id: string;
  routes_paid: number;
  routes_pending: number;
  paid_cents: number;
  pending_cents: number;
  homes_serviced: number;
  miles_driven: number;
};

export default function DriverPayouts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const status = useQuery({
    queryKey: ["stripe-connect-status", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<StatusResp> => {
      const r = await fetch(`/api/stripe-connect-status?driver_id=${user!.id}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || "Status check failed");
      return j.data;
    },
    refetchInterval: (q) => (q.state.data?.payouts_enabled ? false : 4000),
  });

  const earnings = useQuery({
    queryKey: ["driver-earnings", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Earnings | null> => {
      const { data, error } = await supabase
        .from("v_driver_earnings")
        .select("*")
        .eq("driver_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Earnings | null;
    },
  });

  const payouts = useQuery({
    queryKey: ["driver-payouts", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Payout[]> => {
      const { data, error } = await supabase
        .from("driver_payouts")
        .select("*")
        .eq("driver_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as Payout[];
    },
  });

  const onboard = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/stripe-connect-onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_id: user!.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || "Onboarding failed");
      return j.data as { onboarding_url: string; account_id: string };
    },
    onSuccess: (data) => {
      window.location.href = data.onboarding_url;
    },
  });

  useEffect(() => {
    if (params.get("return") || params.get("refresh")) {
      qc.invalidateQueries({ queryKey: ["stripe-connect-status", user?.id] });
      params.delete("return");
      params.delete("refresh");
      setParams(params, { replace: true });
    }
  }, [params, qc, setParams, user?.id]);

  const s = status.data;
  const e = earnings.data;
  const connected = s?.connected ?? false;
  const enabled = s?.payouts_enabled ?? false;

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono-eyebrow text-muted-foreground mb-2">Get paid</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Payouts</h1>
        <p className="mt-2 text-muted-foreground">
          $1.00 per home serviced + $0.15 per mile. Paid via Stripe the moment your route is marked complete.
        </p>
      </div>

      {/* Earnings cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Paid out" value={e ? `$${(e.paid_cents / 100).toFixed(2)}` : "—"} accent />
        <Stat label="Pending" value={e ? `$${(e.pending_cents / 100).toFixed(2)}` : "—"} />
        <Stat label="Routes paid" value={e ? String(e.routes_paid) : "—"} />
        <Stat label="Homes serviced" value={e ? String(e.homes_serviced) : "—"} />
      </div>

      {/* Stripe Connect status */}
      <div className={cn(
        "p-6 rounded-3xl border bg-white",
        enabled ? "border-primary/40 bg-primary/5" : "border-border",
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
            enabled ? "bg-primary/20 text-ink" : "bg-secondary text-muted-foreground"
          )}>
            <Banknote className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-xl text-ink leading-tight">
              {enabled
                ? "Payouts active"
                : connected
                ? "Finish setting up payouts"
                : "Connect Stripe to get paid"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {enabled
                ? `Account ${s?.account_id?.slice(-8)} verified. Routes auto-pay on completion.`
                : connected
                ? "Stripe still needs a few details before they can release transfers."
                : "Stripe handles all bank/tax info securely — DashTrash never touches it."}
            </p>
            {s?.requirements?.currently_due?.length ? (
              <div className="mt-3 text-xs text-muted-foreground">
                Outstanding: {s.requirements.currently_due.join(", ")}
              </div>
            ) : null}
          </div>
          {enabled ? (
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
          ) : (
            <Button
              onClick={() => onboard.mutate()}
              disabled={onboard.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold"
            >
              {onboard.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Opening…</>
              ) : connected ? (
                <>Continue setup <ArrowUpRight className="h-4 w-4 ml-1.5" /></>
              ) : (
                <>Connect Stripe <ExternalLink className="h-4 w-4 ml-1.5" /></>
              )}
            </Button>
          )}
        </div>
        {onboard.error ? (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{(onboard.error as Error).message}</span>
          </div>
        ) : null}
      </div>

      {/* Payout history */}
      <div>
        <h2 className="font-display font-bold text-xl text-ink mb-3">Recent payouts</h2>
        {payouts.isLoading ? (
          <div className="py-6 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" /></div>
        ) : (payouts.data?.length ?? 0) === 0 ? (
          <div className="p-8 rounded-3xl bg-cream border border-border text-center text-sm text-muted-foreground">
            No payouts yet — complete your first route to earn.
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-white overflow-hidden">
            {payouts.data!.map((p, i) => (
              <div
                key={p.id}
                className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-border")}
              >
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                  p.status === "paid" ? "bg-primary/20 text-ink" :
                  p.status === "failed" ? "bg-destructive/15 text-destructive" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {p.status === "paid" ? <CheckCircle2 className="h-4 w-4" /> :
                   p.status === "failed" ? <AlertCircle className="h-4 w-4" /> :
                   <Loader2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-ink text-sm">
                    ${(p.total_cents / 100).toFixed(2)}
                    <span className="font-sans font-normal text-xs text-muted-foreground ml-2">
                      {p.stops_count} stops · {p.miles.toFixed(1)} mi
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()} ·
                    {p.status === "paid" ? " paid" : p.status === "failed" ? ` ${p.failure_reason}` : ` ${p.status}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border bg-white",
      accent ? "border-primary/40 bg-primary/5" : "border-border"
    )}>
      <div className="font-mono-eyebrow text-muted-foreground text-[10px]">{label}</div>
      <div className="font-display font-extrabold text-2xl text-ink mt-1 leading-none">{value}</div>
    </div>
  );
}
