import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDrivers() {
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("profile_id, email, active, vehicle_make_model, has_truck_or_suv, pay_per_home_cents, pay_per_mile_cents, hire_date, profiles(full_name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Drivers</h1>
        <p className="mt-2 text-muted-foreground">Active fleet — pay rate, vehicle, route status.</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : drivers.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <h3 className="font-display font-bold text-xl text-ink mb-1">No drivers yet</h3>
          <p className="text-sm text-muted-foreground">Approve applicants from the Applications tab.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-border">
              <tr className="text-left">
                <Th>Name</Th>
                <Th>Vehicle</Th>
                <Th>Pay</Th>
                <Th>Hired</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const p = (d as { profiles?: { full_name?: string; phone?: string } }).profiles;
                return (
                  <tr key={d.profile_id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <Td>
                      <div className="font-medium text-ink">{p?.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{d.email}</div>
                    </Td>
                    <Td className="text-foreground/80">{d.vehicle_make_model || "—"}</Td>
                    <Td className="text-foreground/80">${(d.pay_per_home_cents / 100).toFixed(2)}/home · ${(d.pay_per_mile_cents / 100).toFixed(2)}/mi</Td>
                    <Td className="text-muted-foreground">{d.hire_date || "—"}</Td>
                    <Td>
                      {d.active
                        ? <span className="px-2 py-0.5 rounded-full bg-primary/20 text-ink font-mono-eyebrow text-[0.65rem]">Active</span>
                        : <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono-eyebrow text-[0.65rem]">Inactive</span>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-4 py-3 text-xs font-mono-eyebrow text-muted-foreground">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
