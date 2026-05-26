import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(7),
});
type Values = z.infer<typeof schema>;

export default function Profile() {
  const { user, profile, refresh } = useAuth();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name || "", phone: profile?.phone || "" },
  });

  async function onSubmit(v: Values) {
    setState("saving");
    setErr(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: v.full_name, phone: v.phone, updated_at: new Date().toISOString() })
        .eq("id", user!.id);
      if (error) throw error;
      await refresh();
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
      setState("error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Account</h1>
        <p className="mt-2 text-muted-foreground">Update your contact details and preferences.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-7 md:p-8 rounded-3xl bg-white border border-border ring-soft space-y-5 max-w-xl">
        <div>
          <Label className="text-ink font-medium">Email</Label>
          <Input value={user?.email || ""} disabled className="mt-2 h-11 rounded-xl bg-secondary" />
          <p className="text-xs text-muted-foreground mt-1.5">Sign-in email. Contact support to change.</p>
        </div>
        <div>
          <Label className="text-ink font-medium">Full name</Label>
          <Input {...form.register("full_name")} className="mt-2 h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-ink font-medium">Phone</Label>
          <Input {...form.register("phone")} placeholder="(512) 555-0199" className="mt-2 h-11 rounded-xl" />
        </div>

        {state === "error" && err ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{err}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={state === "saving"}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-11 px-6 font-semibold"
        >
          {state === "saving" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> :
            state === "saved" ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved</> :
            "Save changes"}
        </Button>
      </form>
    </div>
  );
}
