import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminWaitlist() {
  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ["admin-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("cluster_key, status, city, state")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const groups = new Map<string, { cluster_key: string; count: number; ready: boolean; city: string; state: string }>();
      for (const r of data || []) {
        const k = r.cluster_key;
        const existing = groups.get(k);
        if (existing) {
          existing.count++;
          if (r.status === "cluster_ready") existing.ready = true;
        } else {
          groups.set(k, {
            cluster_key: k,
            count: 1,
            ready: r.status === "cluster_ready",
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((c) => {
            const pct = Math.min(100, Math.round((c.count / 25) * 100));
            return (
              <div key={c.cluster_key} className="p-6 rounded-3xl bg-white border border-border">
                <div className="font-mono-eyebrow text-muted-foreground mb-2">{c.city}, {c.state}</div>
                <div className="font-display font-extrabold text-3xl text-ink leading-none">{c.count}<span className="text-base text-muted-foreground font-medium">/25 homes</span></div>
                <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono-eyebrow text-muted-foreground">{c.cluster_key}</span>
                  {c.ready ? <span className="px-2 py-0.5 rounded-full bg-primary/20 text-ink font-mono-eyebrow">Ready to open</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
