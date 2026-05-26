import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Camera, MapPin, CheckCircle2, Loader2, AlertCircle, ArrowUpFromLine, ArrowDownToLine, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Stop = {
  route_id: string;
  route_date: string;
  route_status: string;
  route_name: string | null;
  stop_id: string;
  sequence: number;
  action: "pull_out" | "return_in";
  stop_status: string;
  completed_at: string | null;
  photo_url: string | null;
  notes: string | null;
  home_id: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  bin_location_notes: string | null;
  gate_code: string | null;
  customer_name: string | null;
  customer_phone: string | null;
};

export default function DriverToday() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [activeStop, setActiveStop] = useState<Stop | null>(null);

  const { data: stops = [], isLoading } = useQuery({
    queryKey: ["driver-today", user?.id, today],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_route_with_stops")
        .select("*")
        .eq("driver_id", user!.id)
        .eq("route_date", today)
        .order("sequence", { ascending: true });
      if (error) throw error;
      return (data || []) as Stop[];
    },
  });

  const pending = stops.filter((s) => s.stop_status !== "completed");
  const completed = stops.filter((s) => s.stop_status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono-eyebrow text-muted-foreground mb-2">{new Date(today).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink">Today's route</h1>
        <p className="mt-2 text-muted-foreground">
          {stops.length === 0
            ? "No route assigned today. Check back tomorrow."
            : `${pending.length} stop${pending.length !== 1 ? "s" : ""} remaining · ${completed.length} done`}
        </p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : stops.length === 0 ? (
        <div className="p-10 rounded-3xl bg-cream border border-border text-center">
          <Navigation className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-display font-bold text-xl text-ink mb-1">No stops scheduled</h3>
          <p className="text-sm text-muted-foreground">Dispatch hasn't published your route yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stops.map((s) => (
            <StopCard key={s.stop_id} stop={s} onComplete={() => setActiveStop(s)} />
          ))}
        </div>
      )}

      <CompletionDialog stop={activeStop} onClose={() => setActiveStop(null)} onSaved={() => {
        qc.invalidateQueries({ queryKey: ["driver-today", user?.id, today] });
        setActiveStop(null);
      }} />
    </div>
  );
}

function StopCard({ stop, onComplete }: { stop: Stop; onComplete: () => void }) {
  const isDone = stop.stop_status === "completed";
  const ActionIcon = stop.action === "pull_out" ? ArrowUpFromLine : ArrowDownToLine;
  return (
    <div className={cn(
      "p-5 rounded-3xl border bg-white",
      isDone ? "border-border opacity-60" : "border-border hover:border-foreground/15"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-11 w-11 rounded-2xl flex items-center justify-center font-display font-bold text-ink shrink-0",
          isDone ? "bg-secondary" : "bg-primary/20"
        )}>
          {isDone ? <CheckCircle2 className="h-5 w-5" /> : stop.sequence + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ActionIcon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
            <span className="font-mono-eyebrow text-muted-foreground">
              {stop.action === "pull_out" ? "Pull bins out" : "Return bins in"}
            </span>
          </div>
          <div className="font-display font-bold text-lg text-ink leading-tight">{stop.street_address}</div>
          <div className="text-sm text-muted-foreground">{stop.city}, {stop.state} {stop.zip}</div>
          {stop.customer_name ? <div className="text-xs text-muted-foreground mt-1">Customer: {stop.customer_name}</div> : null}
          {stop.bin_location_notes ? <div className="text-xs text-foreground/80 mt-2 italic">"{stop.bin_location_notes}"</div> : null}
          {stop.gate_code ? <div className="text-xs text-accent font-medium mt-1">Gate: {stop.gate_code}</div> : null}
        </div>
        <div className="flex flex-col gap-2">
          {stop.lat && stop.lng ? (
            <Button asChild variant="outline" size="sm" className="rounded-xl border-foreground/15 bg-white">
              <a href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`} target="_blank" rel="noreferrer">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Map
              </a>
            </Button>
          ) : null}
          {!isDone ? (
            <Button size="sm" onClick={onComplete} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold">
              <Camera className="h-3.5 w-3.5 mr-1" />
              Complete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CompletionDialog({ stop, onClose, onSaved }: { stop: Stop | null; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setNotes("");
    setPreview(null);
    setBusy(false);
    setErr(null);
  }

  function handleFile(f: File | null) {
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else setPreview(null);
  }

  async function save() {
    if (!stop || !file || !user) return;
    setBusy(true);
    setErr(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${stop.route_id}/${stop.stop_id}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("completion-photos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("completion-photos").getPublicUrl(path);
      const photo_url = pub.publicUrl;

      const upd = await supabase
        .from("route_stops")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          photo_url,
          notes: notes || null,
        })
        .eq("id", stop.stop_id);
      if (upd.error) throw upd.error;

      await supabase.from("notifications_outbox").insert({
        recipient: "support@dashtrashtx.com",
        subject: `Stop completed: ${stop.street_address}`,
        body: `${stop.action === "pull_out" ? "Pull-out" : "Return-in"} completed at ${stop.street_address}, ${stop.city}. Notes: ${notes || "—"}`,
        template: "stop_completed",
        payload: { stop_id: stop.stop_id, photo_url },
      });

      reset();
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!stop} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-2xl text-ink">
            {stop?.action === "pull_out" ? "Pulled out" : "Returned in"}
          </DialogTitle>
        </DialogHeader>
        {stop ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{stop.street_address}, {stop.city}</div>

            <div className="aspect-[4/3] rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-6">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                  <div className="text-xs text-muted-foreground">Take or upload photo proof</div>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Button
              onClick={() => inputRef.current?.click()}
              variant="outline"
              className="w-full rounded-2xl border-foreground/15 bg-white text-ink hover:bg-secondary font-semibold h-11"
            >
              <Camera className="h-4 w-4 mr-2" />
              {file ? "Retake photo" : "Take photo"}
            </Button>

            <Textarea
              placeholder="Optional notes (gate stuck, contamination, etc.)"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl"
            />

            {err ? (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{err}</span>
              </div>
            ) : null}

            <Button
              onClick={save}
              disabled={!file || busy}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold"
            >
              {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Mark complete"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
