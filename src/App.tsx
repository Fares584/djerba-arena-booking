import Admin from '@/pages/admin/Admin';
import Abonnements from '@/pages/admin/Abonnements';
import Reservations from '@/pages/admin/Reservations';
import Tarifs from '@/pages/admin/Tarifs';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import Contact from '@/pages/Contact';
import PolitiqueConfidentialite from '@/pages/PolitiqueConfidentialite';
import ConditionsGenerales from '@/pages/ConditionsGenerales';
import MentionsLegales from '@/pages/MentionsLegales';
import TerrainDetails from '@/pages/TerrainDetails';
import Profile from '@/pages/Profile';
import Auth from '@/pages/Auth';
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/conditions-generales" element={<ConditionsGenerales />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/terrain/:id" element={<TerrainDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/reservations" element={<Reservations />} />
            <Route path="/admin/abonnements" element={<Abonnements />} />
            <Route path="/admin/tarifs" element={<Tarifs />} />
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
