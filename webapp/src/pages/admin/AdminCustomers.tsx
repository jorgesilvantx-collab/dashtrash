import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function AdminCustomers() {
  const [q, setQ] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_leads")
        .select("id, full_name, email, phone, customer_type, city, state, in_service_area, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = q
    ? leads.filter((l) => `${l.full_name} ${l.email} ${l.city}`.toLowerCase().includes(q.toLowerCase()))
    : leads;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Customers</h1>
        <p className="mt-2 text-muted-foreground">All sign-up leads and active customers.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, city…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 h-11 rounded-xl"
        />
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-3xl bg-white border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-border">
              <tr className="text-left">
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Location</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th>Signed up</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No matching leads.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <Td><span className="font-medium text-ink">{l.full_name}</span></Td>
                  <Td><span className="capitalize text-foreground/80">{l.customer_type}</span></Td>
                  <Td>{l.city}, {l.state}</Td>
                  <Td>
                    <div className="text-xs text-foreground/80">{l.email}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                  </Td>
                  <Td>
                    {l.in_service_area
                      ? <span className="px-2 py-0.5 rounded-full bg-primary/20 text-ink font-mono-eyebrow text-[0.65rem]">In area</span>
                      : <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono-eyebrow text-[0.65rem]">Outside</span>}
                  </Td>
                  <Td className="text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-4 py-3 text-xs font-mono-eyebrow text-muted-foreground">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
