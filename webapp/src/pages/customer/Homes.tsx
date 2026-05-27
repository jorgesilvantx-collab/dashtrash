import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MapPin, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geo";

const schema = z.object({
  label: z.string().optional(),
  street_address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  zip: z.string().min(5),
  pickup_day: z.string().min(2),
  num_bins: z.coerce.number().int().min(1).max(20),
  gate_code: z.string().optional(),
  bin_location_notes: z.string().optional(),
});
type Values = z.infer<typeof schema>;

type Home = {
  id: string;
  label: string | null;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  pickup_day: string;
  num_bins: number;
  active: boolean;
  gate_code: string | null;
  bin_location_notes: string | null;
};

export default function Homes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "", street_address: "", city: "", state: "TX", zip: "",
      pickup_day: "tuesday", num_bins: 1, gate_code: "", bin_location_notes: "",
    },
  });

  const { data: homes = [], isLoading } = useQuery({
    queryKey: ["homes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homes")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Home[];
    },
  });

  const addHome = useMutation({
    mutationFn: async (v: Values) => {
      const geo = await geocodeAddress(`${v.street_address}, ${v.city}, ${v.state} ${v.zip}`);
      const { error } = await supabase.from("homes").insert({
        customer_id: user!.id,
        label: v.label || null,
        street_address: v.street_address,
        city: v.city,
        state: v.state.toUpperCase(),
        zip: v.zip,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        pickup_day: v.pickup_day,
        num_bins: v.num_bins,
        gate_code: v.gate_code || null,
        bin_location_notes: v.bin_location_notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homes", user?.id] });
      qc.invalidateQueries({ queryKey: ["customer-overview", user?.id] });
      setOpen(false);
      form.reset();
      setErr(null);
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "Could not add home."),
  });

  const removeHome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homes").delete().eq("id", id);
      if (error) throw error;

      const { count } = await supabase
        .from("homes")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user!.id)
        .eq("active", true);

      if ((count ?? 0) === 0) {
        await fetch("/api/subscription-cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_id: user!.id, reason: "Customer removed all homes" }),
        }).catch(() => {});
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homes", user?.id] });
      qc.invalidateQueries({ queryKey: ["customer-overview", user?.id] });
      qc.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">My homes</h1>
          <p className="mt-2 text-muted-foreground">Add every address you want serviced — we'll route them together.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold h-11">
              <Plus className="h-4 w-4 mr-2" /> Add home
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-lg">
            <DialogHeader><DialogTitle className="font-display font-bold text-2xl text-ink">Add a home</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit((v) => addHome.mutate(v))} className="space-y-4">
              <Field label="Nickname (optional)" {...form.register("label")} placeholder="Main house" />
              <Field label="Street address" {...form.register("street_address")} placeholder="123 Main St" />
              <div className="grid grid-cols-3 gap-3">
                <Field className="col-span-1" label="City" {...form.register("city")} />
                <Field label="State" {...form.register("state")} maxLength={2} />
                <Field label="ZIP" {...form.register("zip")} maxLength={10} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-ink font-medium">Pickup day</Label>
                  <Select value={form.watch("pickup_day")} onValueChange={(v) => form.setValue("pickup_day", v)}>
                    <SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["monday","tuesday","wednesday","thursday","friday"].map((d) => (
                        <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Number of bins" type="number" min={1} max={20} {...form.register("num_bins")} />
              </div>
              <Field label="Gate code (optional)" {...form.register("gate_code")} />
              <Field label="Where you keep the bins (optional)" {...form.register("bin_location_notes")} placeholder="Side of garage" />

              {err ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ) : null}

              <DialogFooter>
                <Button type="submit" disabled={addHome.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-11 font-semibold">
                  {addHome.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save home"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : homes.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-display font-bold text-xl text-ink mb-1">No homes yet</h3>
          <p className="text-sm text-muted-foreground">Click "Add home" to register your first address.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {homes.map((h) => (
            <div key={h.id} className="p-6 rounded-3xl bg-white border border-border">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-display font-bold text-lg text-ink leading-tight">{h.label || h.street_address}</div>
                  {h.label ? <div className="text-sm text-muted-foreground">{h.street_address}</div> : null}
                  <div className="text-sm text-muted-foreground">{h.city}, {h.state} {h.zip}</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove this home?</AlertDialogTitle>
                      <AlertDialogDescription>
                        We'll stop service at this address after the current billing cycle. You can re-add it anytime.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeHome.mutate(h.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                        Remove home
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-secondary font-medium capitalize">Pickup {h.pickup_day}</span>
                <span className="px-2.5 py-1 rounded-full bg-secondary font-medium">{h.num_bins} bin{h.num_bins > 1 ? "s" : ""}</span>
                {h.active ? <span className="px-2.5 py-1 rounded-full bg-primary/20 text-ink font-mono-eyebrow">Active</span> : <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-mono-eyebrow">Paused</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Field = ({ label, className = "", ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={className}>
    <Label className="text-ink font-medium">{label}</Label>
    <Input {...props} className="mt-2 h-11 rounded-xl" />
  </div>
);
