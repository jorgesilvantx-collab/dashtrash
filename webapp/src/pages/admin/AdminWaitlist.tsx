import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Megaphone, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Cluster = {
  cluster_key: string;
  count: number;
  ready: boolean;
  opened: boolean;
  city: string;
  state: string;
};

export default function AdminWaitlist() {
  const qc = useQueryClient();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const openCluster = useMutation({
    mutationFn: async (cluster_key: string) => {
      const r = await fetch("/api/waitlist-open-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cluster_key }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || "Failed to open cluster");
      return j.data as { cluster_key: string; sent: number; failed: number; total: number };
    },
    onSuccess: (d) => {
      setLastResult(`${d.cluster_key}: emailed ${d.sent}/${d.total} subscribers${d.failed ? ` (${d.failed} failed)` : ""}`);
      setErr(null);
      qc.invalidateQueries({ queryKey: ["admin-clusters"] });
    },
    onError: (e) => {
      setErr(e instanceof Error ? e.message : "Failed");
      setLastResult(null);
    },
  });

  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ["admin-clusters"],
    queryFn: async (): Promise<Cluster[]> => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("cluster_key, status, city, state")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const groups = new Map<string, Cluster>();
      for (const r of data || []) {
        const k = r.cluster_key;
        const existing = groups.get(k);
        if (existing) {
          existing.count++;
          if (r.status === "cluster_ready") existing.ready = true;
          if (r.status === "service_available") existing.opened = true;
        } else {
          groups.set(k, {
            cluster_key: k,
            count: 1,
            ready: r.status === "cluster_ready",
            opened: r.status === "service_available",
            city: r.city,
            state: r.state,
          });
        }
      }
      return Array.from(groups.values()).sort((a, b) => b.count - a.count);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Waitlist</h1>
        <p className="mt-2 text-muted-foreground">Sign-ups outside current service area, grouped by neighborhood cluster.</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : clusters.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <h3 className="font-display font-bold text-xl text-ink mb-1">No waitlist signups yet</h3>
        </div>
      ) : (
        <>
          {lastResult ? (
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 text-ink text-sm flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5" /> <span>{lastResult}</span>
            </div>
          ) : null}
          {err ? (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/40 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" /> <span>{err}</span>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((c) => {
              const pct = Math.min(100, Math.round((c.count / 25) * 100));
              return (
                <div
                  key={c.cluster_key}
                  className={cn(
                    "p-6 rounded-3xl bg-white border",
                    c.opened ? "border-primary/40 bg-primary/5" : c.ready ? "border-accent/40" : "border-border"
                  )}
                >
                  <div className="font-mono-eyebrow text-muted-foreground mb-2">{c.city}, {c.state}</div>
                  <div className="font-display font-extrabold text-3xl text-ink leading-none">
                    {c.count}<span className="text-base text-muted-foreground font-medium">/25 homes</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono-eyebrow text-muted-foreground truncate">{c.cluster_key}</span>
                    {c.opened ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-ink font-mono-eyebrow">Open</span>
                    ) : c.ready ? (
                      <span className="px-2 py-0.5 rounded-full bg-accent/30 text-ink font-mono-eyebrow">Ready</span>
                    ) : null}
                  </div>
                  {!c.opened && c.count > 0 ? (
                    <Button
                      onClick={() => openCluster.mutate(c.cluster_key)}
                      disabled={openCluster.isPending}
                      size="sm"
                      className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold"
                    >
                      {openCluster.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Notifying…</>
                      ) : (
                        <><Megaphone className="h-4 w-4 mr-2" /> Open cluster + notify</>
                      )}
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
