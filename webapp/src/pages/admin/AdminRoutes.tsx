import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminRoutes() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["admin-routes", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("id, name, status, total_stops, total_miles, driver_id, started_at, completed_at")
        .eq("route_date", date)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Routes</h1>
          <p className="mt-2 text-muted-foreground">Routes assigned to drivers — see status, stops, mileage.</p>
        </div>
        <div>
          <Label className="text-ink font-medium">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 h-11 rounded-xl w-44" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : routes.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <h3 className="font-display font-bold text-xl text-ink mb-1">No routes for {date}</h3>
          <p className="text-sm text-muted-foreground">Routes get auto-generated the day before pickup.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((r) => (
            <div key={r.id} className="p-6 rounded-3xl bg-white border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="font-display font-bold text-lg text-ink">{r.name || `Route ${r.id.slice(0, 6)}`}</div>
                <StatusPill status={r.status} />
              </div>
              <div className="space-y-1.5 text-sm">
                <KV k="Stops" v={String(r.total_stops ?? 0)} />
                <KV k="Mileage" v={r.total_miles ? `${r.total_miles.toFixed(1)} mi` : "—"} />
                <KV k="Driver" v={r.driver_id ? r.driver_id.slice(0, 6) : "unassigned"} />
                {r.started_at ? <KV k="Started" v={new Date(r.started_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} /> : null}
                {r.completed_at ? <KV k="Completed" v={new Date(r.completed_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} /> : null}
              </div>
            </div>
          ))}
        </div>
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
  return <span className={cn("px-2.5 py-1 rounded-full text-xs font-mono-eyebrow capitalize", map[status] || "bg-secondary text-muted-foreground")}>{status.replace("_", " ")}</span>;
}
