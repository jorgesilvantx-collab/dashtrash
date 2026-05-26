import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function DriverHistory() {
  const { user } = useAuth();

  const { data: stops = [], isLoading } = useQuery({
    queryKey: ["driver-history", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_route_with_stops")
        .select("stop_id, route_date, photo_url, action, street_address, city, completed_at")
        .eq("driver_id", user!.id)
        .eq("stop_status", "completed")
        .order("completed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">History</h1>
        <p className="mt-2 text-muted-foreground">Last 50 completed stops with photo proof.</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : stops.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <h3 className="font-display font-bold text-xl text-ink mb-1">Nothing yet</h3>
          <p className="text-sm text-muted-foreground">Complete a stop and it'll show here.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stops.map((s) => (
            <figure key={s.stop_id} className="rounded-3xl overflow-hidden bg-white border border-border">
              <div className="aspect-[4/3] bg-secondary">
                {s.photo_url ? <img src={s.photo_url} alt={s.street_address} className="w-full h-full object-cover" /> : null}
              </div>
              <figcaption className="p-4">
                <div className="font-mono-eyebrow text-muted-foreground mb-1">
                  {s.action === "pull_out" ? "Pulled out" : "Returned in"}
                </div>
                <div className="font-medium text-ink text-sm">{s.street_address}</div>
                <div className="text-xs text-muted-foreground">
                  {s.completed_at ? new Date(s.completed_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
