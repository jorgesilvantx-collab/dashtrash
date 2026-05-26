import { useQuery } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type StopRow = {
  stop_id: string;
  completed_at: string | null;
  photo_url: string | null;
  action: "pull_out" | "return_in";
  street_address: string;
  city: string;
  notes: string | null;
};

export default function Photos() {
  const { user } = useAuth();

  const { data: stops = [], isLoading } = useQuery({
    queryKey: ["photos", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_route_with_stops")
        .select("stop_id, completed_at, photo_url, action, street_address, city, notes")
        .not("photo_url", "is", null)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return (data || []) as StopRow[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Photo proof</h1>
        <p className="mt-2 text-muted-foreground">Every completed service ends with a timestamped photo.</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : stops.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-display font-bold text-xl text-ink mb-1">No photos yet</h3>
          <p className="text-sm text-muted-foreground">After your first service, photos appear here.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stops.map((s) => (
            <figure key={s.stop_id} className="rounded-3xl overflow-hidden bg-white border border-border">
              <div className="aspect-[4/3] bg-secondary">
                {s.photo_url ? (
                  <img src={s.photo_url} alt={`Service at ${s.street_address}`} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <figcaption className="p-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono-eyebrow text-muted-foreground">
                    {s.action === "pull_out" ? "Pulled out" : "Returned in"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.completed_at ? new Date(s.completed_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                  </span>
                </div>
                <div className="font-medium text-ink text-sm">{s.street_address}</div>
                <div className="text-xs text-muted-foreground">{s.city}</div>
                {s.notes ? <div className="text-xs text-muted-foreground mt-2">{s.notes}</div> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
