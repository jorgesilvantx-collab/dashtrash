import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, MapPinned, AlertCircle, Recycle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete, type AddressPick } from "@/components/forms/AddressAutocomplete";
import { DayPicker } from "@/components/forms/DayPicker";

const baseSchema = z.object({
  full_name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  street_address: z.string().min(3, "Street required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required").max(2),
  zip: z.string().min(5, "ZIP required"),
  num_bins: z.coerce.number().int().min(1).max(20).default(1),
  num_properties: z.coerce.number().int().min(1).max(500).default(1),
  insurance_provider: z.string().optional(),
  insurance_member_id: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

type Props = {
  customerType: "residential" | "enterprise" | "elderly";
  defaultEmail?: string;
  userId?: string;
};

type ResultState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "in_area"; leadId: string }
  | { kind: "waitlisted"; waitlistId: string; clusterCount: number; threshold: number; distanceMiles: number }
  | { kind: "error"; message: string };

export function CustomerSignupForm({ customerType, defaultEmail, userId }: Props) {
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultState>({ kind: "idle" });
  const [trashDays, setTrashDays] = useState<string[]>([]);
  const [recyclingDays, setRecyclingDays] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      full_name: "",
      email: defaultEmail ?? "",
      phone: "",
      street_address: "",
      city: "",
      state: "TX",
      zip: "",
      num_bins: 1,
      num_properties: customerType === "enterprise" ? 5 : 1,
      insurance_provider: "",
      insurance_member_id: "",
      notes: "",
    },
  });

  function onAddressPick(pick: AddressPick) {
    form.setValue("street_address", pick.street, { shouldValidate: true });
    if (pick.city) form.setValue("city", pick.city, { shouldValidate: true });
    if (pick.state) form.setValue("state", pick.state, { shouldValidate: true });
    if (pick.zip) form.setValue("zip", pick.zip, { shouldValidate: true });
    setCoords({ lat: pick.lat, lng: pick.lng });
  }

  async function onSubmit(values: FormValues) {
    setResult({ kind: "submitting" });
    try {
      const res = await fetch("/api/signup-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          customer_type: customerType,
          street_address: values.street_address,
          city: values.city,
          state: values.state.toUpperCase(),
          zip: values.zip,
          pickup_days: trashDays,
          recycling_days: recyclingDays,
          num_bins: values.num_bins,
          num_properties: values.num_properties,
          insurance_provider: values.insurance_provider,
          insurance_member_id: values.insurance_member_id,
          notes: values.notes,
          lat: coords?.lat,
          lng: coords?.lng,
          user_id: userId,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message || `Submit failed (${res.status})`);
      }
      const data = body.data;
      if (data.kind === "in_area") setResult({ kind: "in_area", leadId: data.leadId });
      else if (data.kind === "waitlisted") {
        setResult({
          kind: "waitlisted",
          waitlistId: data.waitlistId,
          clusterCount: data.clusterCount,
          threshold: data.threshold,
          distanceMiles: data.distanceMiles,
        });
      } else {
        throw new Error("Unexpected response");
      }
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
                <FormControl>
                  <AddressAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    onPick={onAddressPick}
                    placeholder="Start typing — we'll find it"
                  />
                </FormControl>
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
                  <FormControl><Input placeholder="Dallas" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="75201" maxLength={10} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-5 p-5 rounded-2xl bg-cream border border-border">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-ink" strokeWidth={2} />
              </div>
              <div>
                <div className="font-semibold text-ink leading-tight">Trash pickup day{customerType === "enterprise" ? " (typical)" : ""}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Pick one or more — city pickup days for your address</div>
              </div>
            </div>
            <DayPicker value={trashDays} onChange={setTrashDays} accent="primary" />
          </div>
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-[#FF7F65]/15 flex items-center justify-center">
                <Recycle className="h-3.5 w-3.5 text-ink" strokeWidth={2} />
              </div>
              <div>
                <div className="font-semibold text-ink leading-tight">Recycling pickup day <span className="text-muted-foreground text-xs font-normal">(if different)</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">Some cities pick up recycling on a different day</div>
              </div>
            </div>
            <DayPicker value={recyclingDays} onChange={setRecyclingDays} accent="coral" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customerType === "enterprise" ? (
            <FormField
              control={form.control}
              name="num_properties"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
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
                <FormItem className="sm:col-span-2">
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
