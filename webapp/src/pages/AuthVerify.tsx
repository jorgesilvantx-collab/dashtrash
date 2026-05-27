import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function AuthVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();
  const [status, setStatus] = useState<"verifying" | "ok" | "error">("verifying");
  const [err, setErr] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) {
      setStatus("error");
      setErr("Missing email or token in the link. Try requesting a new sign-in link.");
      return;
    }

    (async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "magiclink",
        });
        if (error) throw error;
        setStatus("ok");
      } catch (e) {
        setStatus("error");
        setErr(e instanceof Error ? e.message : "Could not verify sign-in link.");
      }
    })();
  }, [params]);

  useEffect(() => {
    if (status !== "ok" || loading) return;
    if (!session) return;
    const next = params.get("next");
    if (next) {
      navigate(next, { replace: true });
      return;
    }
    if (profile?.role === "admin") navigate("/admin", { replace: true });
    else if (profile?.role === "driver") navigate("/driver", { replace: true });
    else navigate("/dashboard", { replace: true });
  }, [status, loading, session, profile, navigate, params]);

  return (
    <PageShell>
      <section className="relative bg-background min-h-[60vh] flex items-center justify-center py-24">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="p-8 rounded-3xl bg-white border border-border ring-soft text-center">
            {status === "verifying" ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <h1 className="font-display font-bold text-2xl text-ink mb-2">Signing you in…</h1>
                <p className="text-muted-foreground text-sm">Verifying your link, hold tight.</p>
              </>
            ) : status === "ok" ? (
              <>
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-7 w-7 text-ink" strokeWidth={2} />
                </div>
                <h1 className="font-display font-bold text-2xl text-ink mb-2">Signed in.</h1>
                <p className="text-muted-foreground text-sm">Taking you to your dashboard…</p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="h-7 w-7 text-destructive" strokeWidth={2} />
                </div>
                <h1 className="font-display font-bold text-2xl text-ink mb-2">Link didn't work.</h1>
                <p className="text-muted-foreground text-sm mb-6">{err}</p>
                <Button asChild className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  <Link to="/login">Request a new sign-in link</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
