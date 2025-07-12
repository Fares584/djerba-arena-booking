
import Admin from '@/pages/admin/Dashboard';
import Abonnements from '@/pages/admin/Abonnements';
import Reservations from '@/pages/admin/Reservations';
import Tarifs from '@/pages/admin/Terrains';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Index';
import Contact from '@/pages/About';
import Auth from '@/pages/Login';
import Fields from '@/pages/Fields';
import OfflineIndicator from '@/components/OfflineIndicator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/about" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789" element={<Admin />} />
            <Route path="/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/reservations" element={<Reservations />} />
            <Route path="/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/abonnements" element={<Abonnements />} />
            <Route path="/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/terrains" element={<Tarifs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <OfflineIndicator />
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
