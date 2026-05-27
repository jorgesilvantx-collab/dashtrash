import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { safeNext } from "@/components/auth/AuthGate";
import { api } from "@/lib/api";

export default function AuthVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();
  const [status, setStatus] = useState<"verifying" | "ok" | "error">("verifying");
  const [err, setErr] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [resendErr, setResendErr] = useState<string | null>(null);
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
        // The token in the URL is a hashed_token from Supabase's admin
        // generate_link endpoint, so verifyOtp must be called with token_hash
        // (NOT token, which expects a 6-digit OTP code).
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
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
    const next = safeNext(params.get("next"));
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
                <h1 className="font-display font-bold text-2xl text-ink mb-2">Link expired.</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Sign-in links work for one hour and can only be used once. We'll send you a fresh one.
                </p>
                {resendState === "sent" ? (
                  <div className="rounded-2xl bg-primary/15 border border-primary/30 px-4 py-3 text-sm text-ink">
                    Check your inbox at <strong>{params.get("email")}</strong> for a new sign-in link.
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={async () => {
                        const email = params.get("email");
                        if (!email) {
                          setResendErr("No email on this link — request a new one from the sign-in page.");
                          setResendState("failed");
                          return;
                        }
                        setResendState("sending");
                        setResendErr(null);
                        try {
                          const next = params.get("next") ?? undefined;
                          await api.post("/api/auth-magic", { email, next });
                          setResendState("sent");
                        } catch (e) {
                          setResendErr(e instanceof Error ? e.message : "Could not send a new link.");
                          setResendState("failed");
                        }
                      }}
                      disabled={resendState === "sending"}
                      className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    >
                      {resendState === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Email me a new link
                        </>
                      )}
                    </Button>
                    <Button asChild variant="outline" className="w-full mt-3 h-12 rounded-2xl">
                      <Link to="/login">Use a different email</Link>
                    </Button>
                    {resendState === "failed" && resendErr ? (
                      <p className="mt-4 text-xs text-destructive">{resendErr}</p>
                    ) : null}
                    {err ? (
                      <p className="mt-5 text-[11px] text-muted-foreground/70">Error: {err}</p>
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
