import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoTile, Wordmark } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/#how", label: "How it works" },
  { to: "/#services", label: "Services" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/#coverage", label: "Coverage" },
  { to: "/partners", label: "Partners" },
  { to: "/careers", label: "Careers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#0F1722] border-b border-white/10">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <LogoTile size={38} className="transition group-hover:rotate-[-3deg]" />
          <Wordmark className="text-lg md:text-xl text-white [&>span]:text-primary" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a
            href="tel:+16823625847"
            className="hidden xl:inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-white mr-2 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            (682) 362-5847
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
            className="text-white/80 hover:text-white hover:bg-white/10 font-semibold rounded-xl border border-white/20 h-9 px-4"
          >
            Sign in
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/signup")}
            className="bg-primary text-[#0F1722] hover:bg-primary/90 rounded-xl h-9 px-5 font-bold"
          >
            Start service
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2 text-white"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-300 border-t border-white/10 bg-[#0F1722]",
          open ? "max-h-[32rem]" : "max-h-0"
        )}
      >
        <div className="container py-5 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              className="py-3 px-2 text-white/80 font-medium hover:text-white border-b border-white/5 last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href="tel:+16823625847"
            className="flex items-center gap-2 py-3 px-2 text-white font-semibold border-b border-white/5"
          >
            <Phone className="h-4 w-4 text-primary" />
            (682) 362-5847
          </a>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white font-semibold h-11"
              onClick={() => { setOpen(false); navigate("/login"); }}
            >
              Sign in
            </Button>
            <Button
              className="flex-1 bg-primary text-[#0F1722] hover:bg-primary/90 rounded-xl font-bold h-11"
              onClick={() => { setOpen(false); navigate("/signup"); }}
            >
              Start service
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
