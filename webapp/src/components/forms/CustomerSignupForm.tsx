import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, MapPinned, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { geocodeAddress, haversineMiles, clusterKeyFromLatLng } from "@/lib/geo";

const baseSchema = z.object({
  full_name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  street_address: z.string().min(3, "Street required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required").max(2),
  zip: z.string().min(5, "ZIP required"),
  pickup_day: z.string().optional(),
  num_bins: z.coerce.number().int().min(1).max(20).default(1),
  num_properties: z.coerce.number().int().min(1).max(500).default(1),
  insurance_provider: z.string().optional(),
  insurance_member_id: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

type Props = {
  customerType: "residential" | "enterprise" | "elderly";
};

type ResultState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "in_area"; leadId: string }
  | { kind: "waitlisted"; waitlistId: string; clusterCount: number; threshold: number; distanceMiles: number }
  | { kind: "error"; message: string };

export function CustomerSignupForm({ customerType }: Props) {
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultState>({ kind: "idle" });

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      street_address: "",
      city: "",
      state: "TX",
      zip: "",
      pickup_day: "",
      num_bins: 1,
      num_properties: customerType === "enterprise" ? 5 : 1,
      insurance_provider: "",
      insurance_member_id: "",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setResult({ kind: "submitting" });
    try {
      const fullAddress = `${values.street_address}, ${values.city}, ${values.state} ${values.zip}`;
      const geo = await geocodeAddress(fullAddress);

      const { data: areas, error: areaErr } = await supabase
        .from("service_areas")
        .select("center_lat, center_lng, radius_miles, cluster_threshold")
        .eq("active", true);

      if (areaErr) throw areaErr;

      let inArea = false;
      let minDistance = Infinity;
      let threshold = 25;
      if (geo && areas && areas.length) {
        for (const a of areas) {
          const dist = haversineMiles({ lat: geo.lat, lng: geo.lng }, { lat: a.center_lat, lng: a.center_lng });
          if (dist < minDistance) minDistance = dist;
          if (dist <= a.radius_miles) inArea = true;
          threshold = a.cluster_threshold ?? threshold;
        }
      }

      if (inArea || !geo) {
        const { data, error } = await supabase
          .from("customer_leads")
          .insert({
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            customer_type: customerType,
            street_address: values.street_address,
            city: values.city,
            state: values.state.toUpperCase(),
            zip: values.zip,
            lat: geo?.lat ?? null,
            lng: geo?.lng ?? null,
            pickup_day: values.pickup_day || null,
            num_bins: values.num_bins,
            num_properties: values.num_properties,
            insurance_provider: values.insurance_provider || null,
            insurance_member_id: values.insurance_member_id || null,
            notes: values.notes || null,
            in_service_area: !!inArea,
          })
          .select("id")
          .single();
        if (error) throw error;

        await supabase.from("notifications_outbox").insert({
          recipient: "support@dashtrashtx.com",
          subject: `New ${customerType} signup: ${values.full_name}`,
          body: `${values.full_name} (${values.email}, ${values.phone}) signed up for ${customerType} at ${fullAddress}. Pickup day: ${values.pickup_day || "n/a"}. Bins: ${values.num_bins}. Properties: ${values.num_properties}. Notes: ${values.notes || "none"}.`,
          template: "new_customer_signup",
          payload: { lead_id: data.id, customer_type: customerType, address: fullAddress },
        });

        setResult({ kind: "in_area", leadId: data.id });
        return;
      }

      const clusterKey = clusterKeyFromLatLng(geo.lat, geo.lng);
      const { count: existingCount } = await supabase
        .from("waitlist")
        .select("id", { count: "exact", head: true })
        .eq("cluster_key", clusterKey)
        .in("status", ["waiting", "cluster_ready"]);

      const newCount = (existingCount ?? 0) + 1;

      const { data, error } = await supabase
        .from("waitlist")
        .insert({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          customer_type: customerType,
          street_address: values.street_address,
          city: values.city,
          state: values.state.toUpperCase(),
          zip: values.zip,
          lat: geo.lat,
          lng: geo.lng,
          cluster_key: clusterKey,
          cluster_size_at_signup: newCount,
          status: newCount >= threshold ? "cluster_ready" : "waiting",
          notes: values.notes || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      await supabase.from("notifications_outbox").insert({
        recipient: "support@dashtrashtx.com",
        subject: newCount >= threshold ? `🚨 Cluster READY in ${clusterKey} (${newCount} signups)` : `New waitlist signup in ${clusterKey} (${newCount}/${threshold})`,
        body: `${values.full_name} (${values.email}, ${values.phone}) joined the waitlist at ${fullAddress}. Cluster ${clusterKey} now has ${newCount}/${threshold} homes. Distance from nearest service area: ${minDistance.toFixed(1)} mi.`,
        template: newCount >= threshold ? "cluster_ready" : "waitlist_signup",
        payload: { waitlist_id: data.id, cluster_key: clusterKey, cluster_size: newCount, threshold },
      });

      setResult({ kind: "waitlisted", waitlistId: data.id, clusterCount: newCount, threshold, distanceMiles: minDistance });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setResult({ kind: "error", message: msg });
    }
  }

  if (result.kind === "in_area") {
    return (
      <div className="text-center py-10 px-6 animate-fade-up">
        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-7 w-7 text-ink" strokeWidth={2} />
        </div>
        <h3 className="font-display font-extrabold text-3xl md:text-4xl text-ink mb-3">You're in. Welcome.</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Your address is inside our service area. We've sent a confirmation to your email and our team will reach out within 24 hours to schedule your first pickup and complete checkout.
        </p>
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-7 font-semibold"
        >
          Back to home
        </Button>
      </div>
    );
  }

  if (result.kind === "waitlisted") {
    const pct = Math.min(100, Math.round((result.clusterCount / result.threshold) * 100));
    return (
      <div className="text-center py-10 px-6 animate-fade-up">
        <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
          <MapPinned className="h-7 w-7 text-ink" strokeWidth={1.75} />
        </div>
        <h3 className="font-display font-extrabold text-3xl md:text-4xl text-ink mb-3">You're on the waitlist.</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Your address is about <span className="text-ink font-semibold">{result.distanceMiles.toFixed(1)} mi</span> outside our current route. We'll open service to your area when 25+ homes sign up nearby — and you'll be among the first notified.
        </p>
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2 font-mono-eyebrow">
            <span>Your area</span>
            <span>{result.clusterCount} / {result.threshold} homes</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="mt-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-7 font-semibold"
        >
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="(512) 555-0199" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="you@email.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street address</FormLabel>
                <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="Austin" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input placeholder="TX" maxLength={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl><Input placeholder="78701" maxLength={10} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pickup_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City pickup day {customerType === "enterprise" ? "(typical)" : ""}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Monday","Tuesday","Wednesday","Thursday","Friday"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                    <SelectItem value="not_sure">Not sure</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {customerType === "enterprise" ? (
            <FormField
              control={form.control}
              name="num_properties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many properties / doors?</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="num_bins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many bins?</FormLabel>
                  <FormControl><Input type="number" min={1} max={20} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {customerType === "elderly" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-cream border border-border">
            <FormField
              control={form.control}
              name="insurance_provider"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Insurance provider <span className="text-muted-foreground text-xs">(optional — we'll help check coverage)</span></FormLabel>
                  <FormControl><Input placeholder="e.g. Humana, Aetna Long Term Care" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurance_member_id"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Member ID <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Member / policy number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anything we should know? <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
              <FormControl><Textarea placeholder="Where you keep the bins, gate code, dog, etc." rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {result.kind === "error" ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{result.message}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={result.kind === "submitting"}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold"
        >
          {result.kind === "submitting" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking your area…</> : "Submit & check service area"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          We'll never share your info. By submitting you agree to be contacted at the phone & email above.
        </p>
      </form>
    </Form>
  );
}
