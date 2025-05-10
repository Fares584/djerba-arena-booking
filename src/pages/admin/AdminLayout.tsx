
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard, CalendarCheck, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const AdminLayout = () => {
  const { loading } = useRequireAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sport-gray">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sport-green"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex flex-col md:flex-row bg-sport-gray">
        {/* Sidebar */}
        <div className="md:w-64 bg-white shadow-md p-4">
          <div className="space-y-1 mb-8">
            <h1 className="text-xl font-bold text-sport-green px-4 py-2">Dashboard Admin</h1>
          </div>
          
          <nav className="space-y-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-sport-green text-white' : 'hover:bg-sport-gray text-gray-700'}`}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              <span>Tableau de bord</span>
            </NavLink>
            
            <NavLink
              to="/admin/reservations"
              className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-sport-green text-white' : 'hover:bg-sport-gray text-gray-700'}`}
            >
              <CalendarCheck className="mr-2 h-5 w-5" />
              <span>Réservations</span>
            </NavLink>
            
            <NavLink
              to="/admin/terrains"
              className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-sport-green text-white' : 'hover:bg-sport-gray text-gray-700'}`}
            >
              <Users className="mr-2 h-5 w-5" />
              <span>Terrains</span>
            </NavLink>
            
            <NavLink
              to="/admin/planning"
              className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-sport-green text-white' : 'hover:bg-sport-gray text-gray-700'}`}
            >
              <CalendarCheck className="mr-2 h-5 w-5" />
              <span>Planning</span>
            </NavLink>
            
            <NavLink
              to="/admin/stats"
              className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-sport-green text-white' : 'hover:bg-sport-gray text-gray-700'}`}
            >
              <Settings className="mr-2 h-5 w-5" />
              <span>Statistiques</span>
            </NavLink>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 mt-8" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Déconnexion</span>
            </Button>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-grow p-4 md:p-8">
          <Outlet />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;
