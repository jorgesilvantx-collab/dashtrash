import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { safeNext } from "@/components/auth/AuthGate";
import { api } from "@/lib/api";

// Status flow: ready → verifying → ok | error
// IMPORTANT: We do NOT auto-verify on page load. Email scanners (Gmail, Outlook
// SafeLinks, etc.) prefetch every link in an email, which consumes the
// single-use Supabase token before the real user ever clicks. By waiting for
// an explicit button press, the scanner hits the page but never fires the
// verify call, leaving the token valid for the human.
type Status = "ready" | "verifying" | "ok" | "error";

export default function AuthVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, profile, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>("ready");
  const [err, setErr] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [resendErr, setResendErr] = useState<string | null>(null);

  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  // If the user is already signed in, bounce them straight to their dashboard.
  if (!authLoading && session && profile && status === "ready") {
    const next = safeNext(params.get("next"));
    const dest = next ?? (profile.role === "admin" ? "/admin" : profile.role === "driver" ? "/driver" : "/dashboard");
    navigate(dest, { replace: true });
    return null;
  }

  if (!email || !token) {
    return (
      <PageShell>
        <VerifyCard>
          <ErrorIcon />
          <h1 className="font-display font-bold text-2xl text-ink mb-2">Broken link.</h1>
          <p className="text-muted-foreground text-sm mb-6">The sign-in link is missing required info. Please request a new one.</p>
          <Button asChild className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold">
            <Link to="/login">Go to sign-in</Link>
          </Button>
        </VerifyCard>
      </PageShell>
    );
  }

  async function handleVerify() {
    setStatus("verifying");
    setErr(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "magiclink",
      });
      if (error) throw error;
      setStatus("ok");
      // Give Supabase auth listener a moment to propagate session
      setTimeout(() => {
        const next = safeNext(params.get("next"));
        if (next) { navigate(next, { replace: true }); return; }
        // Redirect based on role once profile loads
        if (profile?.role === "admin") navigate("/admin", { replace: true });
        else if (profile?.role === "driver") navigate("/driver", { replace: true });
        else navigate("/dashboard", { replace: true });
      }, 800);
    } catch (e) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Could not verify sign-in link.");
    }
  }

  async function handleResend() {
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
  }

  return (
    <PageShell>
      <VerifyCard>
        {status === "ready" && (
          <>
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-ink" strokeWidth={2} />
            </div>
            <h1 className="font-display font-bold text-2xl text-ink mb-2">Ready to sign in.</h1>
            <p className="text-muted-foreground text-sm mb-1">
              Signing in as <span className="text-ink font-medium">{email}</span>
            </p>
            <p className="text-muted-foreground text-xs mb-6">Click the button below to complete your sign-in.</p>
            <Button
              onClick={handleVerify}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
            >
              Complete sign-in
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2 h-10 rounded-2xl text-sm text-muted-foreground">
              <Link to="/login">Use a different email</Link>
            </Button>
          </>
        )}

        {status === "verifying" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h1 className="font-display font-bold text-2xl text-ink mb-2">Signing you in…</h1>
            <p className="text-muted-foreground text-sm">Just a moment.</p>
          </>
        )}

        {status === "ok" && (
          <>
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-7 w-7 text-ink" strokeWidth={2} />
            </div>
            <h1 className="font-display font-bold text-2xl text-ink mb-2">Signed in.</h1>
            <p className="text-muted-foreground text-sm">Taking you to your dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon />
            <h1 className="font-display font-bold text-2xl text-ink mb-2">Link expired.</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Sign-in links are single-use and expire in 1 hour. Request a fresh one below.
            </p>
            {resendState === "sent" ? (
              <div className="rounded-2xl bg-primary/15 border border-primary/30 px-4 py-3 text-sm text-ink">
                New link sent to <strong>{email}</strong> — check your inbox (and spam).
              </div>
            ) : (
              <>
                <Button
                  onClick={handleResend}
                  disabled={resendState === "sending"}
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {resendState === "sending" ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                  ) : (
                    <><Mail className="h-4 w-4 mr-2" />Email me a new link</>
                  )}
                </Button>
                <Button asChild variant="outline" className="w-full mt-3 h-12 rounded-2xl">
                  <Link to="/login">Use a different email</Link>
                </Button>
                {resendState === "failed" && resendErr && (
                  <p className="mt-4 text-xs text-destructive">{resendErr}</p>
                )}
                {err && (
                  <p className="mt-5 text-[11px] text-muted-foreground/60">Technical detail: {err}</p>
                )}
              </>
            )}
          </>
        )}
      </VerifyCard>
    </PageShell>
  );
}

function VerifyCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative bg-[#0F1722] min-h-[70vh] flex items-center justify-center py-24">
      <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none" />
      <div className="max-w-md w-full mx-auto px-6 relative">
        <div className="p-8 rounded-3xl bg-white border border-border ring-soft text-center">
          {children}
        </div>
      </div>
    </section>
  );
}

function ErrorIcon() {
  return (
    <div className="h-14 w-14 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-5">
      <AlertCircle className="h-7 w-7 text-destructive" strokeWidth={2} />
    </div>
  );
}
