import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Home as HomeIcon, CreditCard, Camera, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function DashboardOverview() {
  const { user, profile } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["customer-overview", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [homes, sub, stops] = await Promise.all([
        supabase.from("homes").select("id, label, street_address, city, pickup_day, active").eq("customer_id", user!.id),
        supabase.from("subscriptions").select("id, status, current_period_end").eq("customer_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("v_route_with_stops").select("stop_id, completed_at, photo_url, action, street_address").not("photo_url", "is", null).order("completed_at", { ascending: false }).limit(3),
      ]);
      return {
        homes: homes.data || [],
        subscription: sub.data,
        recentPhotos: stops.data || [],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const homesCount = data?.homes.length ?? 0;
  const status = data?.subscription?.status ?? "no_subscription";

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono-eyebrow text-muted-foreground mb-2">Welcome back</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">
          Hi {profile?.full_name?.split(" ")[0] || "there"}.
        </h1>
        <p className="mt-2 text-muted-foreground">Here's your trash-handling situation at a glance.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={HomeIcon} label="Active homes" value={String(homesCount)} sub={homesCount === 0 ? "Add your first home" : `${homesCount} on weekly route`} />
        <StatCard icon={CreditCard} label="Subscription" value={statusLabel(status)} sub={data?.subscription?.current_period_end ? `Renews ${new Date(data.subscription.current_period_end).toLocaleDateString()}` : "Set up billing to start"} />
        <StatCard icon={Camera} label="Photos this month" value={String(data?.recentPhotos.length ?? 0)} sub="Latest service proof" />
      </div>

      {homesCount === 0 ? (
        <div className="p-7 rounded-3xl bg-cream border border-border">
          <h2 className="font-display font-bold text-xl text-ink mb-2">Add your first home</h2>
          <p className="text-muted-foreground text-[0.95rem] mb-5">
            We need your address and city pickup day to lock in your weekly route.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold">
            <Link to="/dashboard/homes">
              Add a home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-7 rounded-3xl bg-white border border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-ink">Your homes</h2>
            <Link to="/dashboard/homes" className="text-sm font-medium text-ink underline underline-offset-2">Manage</Link>
          </div>
          {data?.homes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No homes yet.</p>
          ) : (
            <ul className="space-y-3">
              {data!.homes.slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-ink">{h.label || h.street_address}</div>
                    <div className="text-xs text-muted-foreground">{h.city} · pickup {h.pickup_day}</div>
                  </div>
                  <span className={h.active ? "text-xs font-mono-eyebrow text-primary" : "text-xs font-mono-eyebrow text-muted-foreground"}>
                    {h.active ? "Active" : "Paused"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-7 rounded-3xl bg-white border border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-ink">Recent photo proof</h2>
            <Link to="/dashboard/photos" className="text-sm font-medium text-ink underline underline-offset-2">All photos</Link>
          </div>
          {data?.recentPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service photos yet — they'll appear here after your first pickup.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {data!.recentPhotos.map((p) => (
                <div key={p.stop_id} className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="Service proof" className="w-full h-full object-cover" />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof HomeIcon; label: string; value: string; sub: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono-eyebrow text-muted-foreground">{label}</div>
        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
        </div>
      </div>
      <div className="font-display font-extrabold text-3xl text-ink leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-2">{sub}</div>
    </div>
  );
}

function statusLabel(s: string) {
  switch (s) {
    case "active": return "Active";
    case "trialing": return "Trial";
    case "past_due": return "Past due";
    case "canceled": return "Canceled";
    case "paused": return "Paused";
    case "incomplete": return "Incomplete";
    default: return "—";
  }
}
