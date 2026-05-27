import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { safeNext } from "@/components/auth/AuthGate";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    const next = safeNext(params.get("next"));
    if (next) {
      navigate(next, { replace: true });
      return;
    }
    if (profile?.role === "admin") navigate("/admin", { replace: true });
    else if (profile?.role === "driver") navigate("/driver", { replace: true });
    else navigate("/dashboard", { replace: true });
  }, [loading, session, profile, navigate, params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      <div className="text-sm text-muted-foreground">Signing you in…</div>
    </div>
  );
}
