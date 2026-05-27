import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function PortalShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 hairline-bottom">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoTile size={36} />
              <span className="font-display font-extrabold text-lg tracking-tight text-ink hidden sm:inline">
                DashTrashTX<span className="text-primary">TX</span>
              </span>
            </Link>
            <div className="hidden md:block font-mono-eyebrow text-muted-foreground">{title}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 mr-2 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-ink text-xs">
                {(profile?.full_name || profile?.email || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-ink leading-tight">{profile?.full_name || "—"}</div>
                <div className="text-xs text-muted-foreground capitalize">{profile?.role}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-foreground/80 hover:text-ink rounded-xl">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 -mr-2" aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 container py-8 md:py-10 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className={cn(
          "md:block",
          open ? "block" : "hidden"
        )}>
          <nav className="space-y-1 sticky top-24">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ink text-background"
                    : "text-foreground/70 hover:text-ink hover:bg-secondary"
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
