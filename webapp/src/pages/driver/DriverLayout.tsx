import { Outlet } from "react-router-dom";
import { Route, Camera, Banknote, Settings } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";

const nav = [
  { to: "/driver", label: "Today's route", icon: Route },
  { to: "/driver/history", label: "History", icon: Camera },
  { to: "/driver/payouts", label: "Payouts", icon: Banknote },
  { to: "/driver/profile", label: "Account", icon: Settings },
];

export default function DriverLayout() {
  return (
    <PortalShell title="Driver portal" nav={nav}>
      <Outlet />
    </PortalShell>
  );
}
