import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Banknote, AlertCircle, Wand2, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type PayoutResp = {
  route_id: string;
  payout: {
    id: string;
    status: "pending" | "paid" | "failed" | "manual";
    total_dollars: number;
    stops: number;
    miles: number;
    stripe_transfer_id: string | null;
    failure_reason: string | null;
  };
};

type Route = {
  id: string;
  name: string | null;
  status: string;
  total_stops: number | null;
  total_miles: number | null;
  driver_id: string | null;
  started_at: string | null;
  completed_at: string | null;
};

type Driver = {
  profile_id: string;
  profiles: Array<{ full_name: string | null }> | null;
};

export default function AdminRoutes() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [lastPayout, setLastPayout] = useState<PayoutResp | null>(null);
  const [completeErr, setCompleteErr] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<string | null>(null);
  const [buildErr, setBuildErr] = useState<string | null>(null);
  const [assigningRoute, setAssigningRoute] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["admin-driver-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("profile_id, profiles(full_name)")
        .eq("active", true);
      if (error) throw error;
      return (data || []) as Driver[];
    },
  });

  const { data: routes = [], isLoading } = useQuery<Route[]>({
    queryKey: ["admin-routes", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("id, name, status, total_stops, total_miles, driver_id, started_at, completed_at")
        .eq("route_date", date)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Route[];
    },
  });

  const buildRoutes = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/route-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route_date: date }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || "Could not build routes");
      return j.data as { routes_created: number; homes_scheduled: number; day: string; note?: string };
    },
    onSuccess: (data) => {
      if (data.note) setBuildResult(data.note);
      else setBuildResult(
        `Built ${data.routes_created} route${data.routes_created !== 1 ? "s" : ""} scheduling ${data.homes_scheduled} homes (${data.day}).`
      );
      setBuildErr(null);
      qc.invalidateQueries({ queryKey: ["admin-routes"] });
    },
    onError: (e) => {
      setBuildErr(e instanceof Error ? e.message : "Failed to build routes");
      setBuildResult(null);
    },
  });

  const assignDriver = useMutation({
    mutationFn: async ({ route_id, driver_id }: { route_id: string; driver_id: string }) => {
      const { error } = await supabase
        .from("routes")
        .update({ driver_id, status: "assigned" })
        .eq("id", route_id);
      if (error) throw error;
    },
    onSuccess: () => {
      setAssigningRoute(null);
      qc.invalidateQueries({ queryKey: ["admin-routes"] });
    },
  });

  const completeRoute = useMutation({
    mutationFn: async ({ route_id, miles }: { route_id: string; miles?: number }) => {
      const r = await fetch("/api/route-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route_id, miles }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || "Could not complete route");
      return j.data as PayoutResp;
    },
    onSuccess: (data) => {
      setLastPayout(data);
      setCompleteErr(null);
      qc.invalidateQueries({ queryKey: ["admin-routes"] });
    },
    onError: (e) => {
      setCompleteErr(e instanceof Error ? e.message : "Failed");
      setLastPayout(null);
    },
  });

  const driverLabel = (id: string | null) => {
    if (!id) return "Unassigned";
    const d = drivers.find((dr) => dr.profile_id === id);
    return d?.profiles?.[0]?.full_name ?? id.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Routes</h1>
          <p className="mt-2 text-muted-foreground">Auto-build daily routes, assign drivers, mark complete + pay.</p>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <Label className="text-ink font-medium text-sm">Route date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setBuildResult(null); setBuildErr(null); }}
              className="mt-1.5 h-11 rounded-xl w-44"
            />
          </div>
          <Button
            onClick={() => { setBuildResult(null); setBuildErr(null); buildRoutes.mutate(); }}
            disabled={buildRoutes.isPending}
            className="h-11 bg-ink text-background hover:bg-ink/90 rounded-xl font-semibold px-5"
          >
            {buildRoutes.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Building…</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-2" />Build routes</>
            )}
          </Button>
        </div>
      </div>

      {/* Build feedback */}
      {buildResult ? (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-ink text-sm flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <span>{buildResult}</span>
        </div>
      ) : null}
      {buildErr ? (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/40 text-destructive text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{buildErr}</span>
        </div>
      ) : null}

      {/* Route list */}
      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : routes.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center space-y-2">
          <h3 className="font-display font-bold text-xl text-ink">No routes for {date}</h3>
          <p className="text-sm text-muted-foreground">
            Click <strong>Build routes</strong> above to auto-generate them from all active subscriptions for that day.
          </p>
          <p className="text-xs text-muted-foreground">
            Homes are geo-clustered by neighbourhood, stops ordered by shortest drive, then you assign each cluster to a driver.
          </p>
        </div>
      ) : (
        <>
          {lastPayout ? (
            <div className={cn(
              "p-4 rounded-2xl border flex items-start gap-3",
              lastPayout.payout.status === "paid"
                ? "bg-primary/10 border-primary/30 text-ink"
                : lastPayout.payout.status === "failed"
                ? "bg-destructive/10 border-destructive/40 text-destructive"
                : "bg-accent/10 border-accent/30 text-ink"
            )}>
              {lastPayout.payout.status === "paid" ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> :
               lastPayout.payout.status === "failed" ? <AlertCircle className="h-5 w-5 mt-0.5" /> :
               <Banknote className="h-5 w-5 mt-0.5" />}
              <div className="text-sm">
                <div className="font-display font-bold">
                  Payout {lastPayout.payout.status}: ${lastPayout.payout.total_dollars.toFixed(2)}
                </div>
                <div className="text-muted-foreground">
                  {lastPayout.payout.stops} stops · {lastPayout.payout.miles.toFixed(1)} mi
                  {lastPayout.payout.stripe_transfer_id ? ` · ${lastPayout.payout.stripe_transfer_id}` : ""}
                  {lastPayout.payout.failure_reason ? ` · ${lastPayout.payout.failure_reason}` : ""}
                </div>
              </div>
            </div>
          ) : null}
          {completeErr ? (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/40 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{completeErr}</span>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((r) => (
              <div key={r.id} className="p-6 rounded-3xl bg-white border border-border flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display font-bold text-base text-ink leading-tight">
                    {r.name || `Route ${r.id.slice(0, 6)}`}
                  </div>
                  <StatusPill status={r.status} />
                </div>

                <div className="space-y-1.5">
                  <KV k="Stops" v={String(r.total_stops ?? 0)} />
                  <KV k="Mileage" v={r.total_miles ? `${r.total_miles.toFixed(1)} mi` : "—"} />
                  <KV k="Driver" v={driverLabel(r.driver_id)} />
                  {r.started_at ? (
                    <KV k="Started" v={new Date(r.started_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} />
                  ) : null}
                  {r.completed_at ? (
                    <KV k="Completed" v={new Date(r.completed_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} />
                  ) : null}
                </div>

                {/* Assign driver */}
                {r.status !== "completed" && drivers.length > 0 ? (
                  assigningRoute === r.id ? (
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(val) => assignDriver.mutate({ route_id: r.id, driver_id: val })}
                      >
                        <SelectTrigger className="h-9 rounded-xl flex-1 text-sm">
                          <SelectValue placeholder="Pick driver…" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((d) => (
                            <SelectItem key={d.profile_id} value={d.profile_id}>
                              {d.profiles?.[0]?.full_name ?? d.profile_id.slice(0, 8)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAssigningRoute(null)}
                        className="h-9 rounded-xl px-3 text-muted-foreground"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssigningRoute(r.id)}
                      className="w-full h-9 rounded-xl font-medium text-sm"
                    >
                      <UserCog className="h-3.5 w-3.5 mr-2" />
                      {r.driver_id ? "Reassign driver" : "Assign driver"}
                    </Button>
                  )
                ) : null}

                {/* Complete + pay */}
                {r.status !== "completed" && r.driver_id ? (
                  <Button
                    size="sm"
                    onClick={() => completeRoute.mutate({ route_id: r.id, miles: r.total_miles ?? undefined })}
                    disabled={completeRoute.isPending}
                    className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold"
                  >
                    {completeRoute.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Completing…</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 mr-2" />Complete + pay driver</>
                    )}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-mono-eyebrow text-muted-foreground">{k}</span>
      <span className="text-ink font-medium">{v}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-secondary text-muted-foreground",
    assigned: "bg-accent/20 text-ink",
    in_progress: "bg-primary/20 text-ink",
    completed: "bg-primary/30 text-ink",
    canceled: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-mono-eyebrow capitalize shrink-0",
      map[status] ?? "bg-secondary text-muted-foreground"
    )}>
      {status.replace("_", " ")}
    </span>
  );
}
