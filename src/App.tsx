
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Maintenance from "./pages/Maintenance";
import Login from "./pages/Login";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Reservations from "./pages/admin/Reservations";
import Terrains from "./pages/admin/Terrains";
import Planning from "./pages/admin/Planning";
import Stats from "./pages/admin/Stats";
import Abonnements from "./pages/admin/Abonnements";
import HistoriqueReservations from "./pages/admin/HistoriqueReservations";

// Mode maintenance activé
const MAINTENANCE_MODE = true;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// ScrollToTop component to handle scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // Si le mode maintenance est activé, afficher uniquement la page maintenance
  // sauf pour les routes admin
  if (MAINTENANCE_MODE) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Accès admin toujours disponible */}
              <Route path="/secure-access-portal-2k24-auth-gateway-xyz789" element={<Login />} />
              <Route path="/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="historique" element={<HistoriqueReservations />} />
                <Route path="terrains" element={<Terrains />} />
                <Route path="planning" element={<Planning />} />
                <Route path="stats" element={<Stats />} />
                <Route path="abonnements" element={<Abonnements />} />
              </Route>
              
              {/* Toutes les autres routes affichent la page maintenance */}
              <Route path="*" element={<Maintenance />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Maintenance />} />
            <Route path="/fields" element={<Maintenance />} />
            <Route path="/reservation" element={<Maintenance />} />
            <Route path="/about" element={<Maintenance />} />
            <Route path="/secure-access-portal-2k24-auth-gateway-xyz789" element={<Login />} />
            
            {/* Admin routes */}
            <Route path="/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="historique" element={<HistoriqueReservations />} />
              <Route path="terrains" element={<Terrains />} />
              <Route path="planning" element={<Planning />} />
              <Route path="stats" element={<Stats />} />
              <Route path="abonnements" element={<Abonnements />} />
            </Route>
            
            <Route path="*" element={<Maintenance />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
