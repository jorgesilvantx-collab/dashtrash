import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth, Role } from "@/lib/auth";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow: Role[];
}) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (profile && !allow.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
