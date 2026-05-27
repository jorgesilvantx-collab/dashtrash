import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/**
 * Sanitize a `next` redirect target so we only ever bounce back to in-app paths.
 * Accepts: "/dashboard", "/waitlist?type=residential"
 * Rejects: "//evil.com", "http://...", "javascript:...", empty/non-strings.
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || typeof next !== "string") return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next.startsWith("/\\")) return null;
  return next;
}

type Props = {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
};

/**
 * Wrap any page that needs the user signed in BEFORE rendering its content.
 * Shows a friendly card explaining why an account is required and links to
 * /login (and /login for new accounts via magic-link) with ?next= set to the
 * current path so the user lands right back here after signing in.
 */
export function AuthGate({ children, title, description, eyebrow }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="relative bg-background min-h-[60vh] flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </section>
    );
  }

  if (user) return <>{children}</>;

  const next = encodeURIComponent(location.pathname + location.search);

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="container relative py-16 md:py-24">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10 animate-fade-up">
            <div className="font-mono-eyebrow text-muted-foreground mb-4">
              {eyebrow ?? "Account required"}
            </div>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance text-ink">
              {title ?? (
                <>
                  Create a free account to <span className="text-primary">check your address</span>.
                </>
              )}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {description ??
                "DashTrash keeps your address, pickup days, and photo proof tied to your account — so you only ever have to enter them once. Sign in or create a free account to continue."}
            </p>
          </div>

          <div className="p-7 md:p-9 rounded-3xl bg-white border border-border ring-soft">
            <div className="flex items-start gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-ink" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-display font-bold text-lg text-ink leading-tight">
                  Why an account?
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  We use your sign-in to securely link your address to your subscription, photo
                  proof, and pickup history. No password — we'll email you a one-tap magic link.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl border-border text-ink hover:bg-secondary font-semibold"
              >
                <Link to={`/login?next=${next}`}>
                  <LogIn className="h-4 w-4 mr-2" /> Sign in
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-semibold"
              >
                <Link to={`/login?next=${next}`}>
                  <UserPlus className="h-4 w-4 mr-2" /> Create account
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-5">
              New here or returning — same magic-link flow. No password to remember.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
