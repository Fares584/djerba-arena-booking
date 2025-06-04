
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from "@/components/ui/tooltip"

// Public Pages
import Index from '@/pages/Index';
import Tarifs from '@/pages/Tarifs';
import Reservation from '@/pages/Reservation';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';

// Admin Pages
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import Reservations from '@/pages/admin/Reservations';
import Terrains from '@/pages/admin/Terrains';
import Planning from '@/pages/admin/Planning';
import Stats from '@/pages/admin/Stats';
import Abonnements from '@/pages/admin/Abonnements';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/admin/reservations" element={<AdminLayout><Reservations /></AdminLayout>} />
            <Route path="/admin/terrains" element={<AdminLayout><Terrains /></AdminLayout>} />
            <Route path="/admin/abonnements" element={<AdminLayout><Abonnements /></AdminLayout>} />
            <Route path="/admin/planning" element={<AdminLayout><Planning /></AdminLayout>} />
            <Route path="/admin/stats" element={<AdminLayout><Stats /></AdminLayout>} />
            
            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
