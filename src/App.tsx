
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Fields from "./pages/Fields";
import Reservation from "./pages/Reservation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Reservations from "./pages/admin/Reservations";
import Terrains from "./pages/admin/Terrains";
import Planning from "./pages/admin/Planning";
import Stats from "./pages/admin/Stats";
import Abonnements from "./pages/admin/Abonnements";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="terrains" element={<Terrains />} />
            <Route path="planning" element={<Planning />} />
            <Route path="stats" element={<Stats />} />
            <Route path="abonnements" element={<Abonnements />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
