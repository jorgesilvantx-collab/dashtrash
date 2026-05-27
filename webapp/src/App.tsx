import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Waitlist from "./pages/Waitlist";
import Careers from "./pages/Careers";
import Partners from "./pages/Partners";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import AuthVerify from "./pages/AuthVerify";
import NotFound from "./pages/NotFound";

import CustomerLayout from "./pages/customer/CustomerLayout";
import DashboardOverview from "./pages/customer/DashboardOverview";
import Homes from "./pages/customer/Homes";
import Billing from "./pages/customer/Billing";
import Photos from "./pages/customer/Photos";
import Profile from "./pages/customer/Profile";

import DriverLayout from "./pages/driver/DriverLayout";
import DriverToday from "./pages/driver/DriverToday";
import DriverHistory from "./pages/driver/DriverHistory";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminWaitlist from "./pages/admin/AdminWaitlist";
import AdminApplications from "./pages/admin/AdminApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/verify" element={<AuthVerify />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allow={["customer", "admin"]}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="homes" element={<Homes />} />
              <Route path="billing" element={<Billing />} />
              <Route path="photos" element={<Photos />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="/driver"
              element={
                <ProtectedRoute allow={["driver", "admin"]}>
                  <DriverLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DriverToday />} />
              <Route path="history" element={<DriverHistory />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="drivers" element={<AdminDrivers />} />
              <Route path="routes" element={<AdminRoutes />} />
              <Route path="waitlist" element={<AdminWaitlist />} />
              <Route path="applications" element={<AdminApplications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
