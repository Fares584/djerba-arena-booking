
import { Outlet } from 'react-router-dom';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { useUserPermissions } from '@/hooks/useUserPermissions';

const AdminLayout = () => {
  const { role } = useRequireAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { isPlanningViewer } = useUserPermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Rediriger immédiatement vers la page de login
      navigate('/login', { replace: true });
      
      // Effectuer la déconnexion après la redirection
      await signOut();
      
      // Afficher le message de succès
      toast.success('Déconnexion réussie');
      
    } catch (error) {
      console.error('Logout error:', error);
      // On ne montre l'erreur que s'il y a vraiment un problème
      // et seulement si on n'a pas encore redirigé
      if (!window.location.pathname.includes('/login')) {
        toast.error('Erreur lors de la déconnexion');
      }
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getHeaderTitle = () => {
    if (isPlanningViewer) {
      return 'Planning des Terrains';
    }
    return 'Administration';
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b w-full">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 w-full max-w-full">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {!isPlanningViewer && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden flex-shrink-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {getHeaderTitle()}
            </h1>
          </div>
          <div className="flex justify-end flex-shrink-0">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm" 
              className="px-2 py-1 text-xs border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
            >
              <LogOut className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex w-full max-w-full">
        {/* Sidebar - masquée pour les planning viewers */}
        {!isPlanningViewer && (
          <aside className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 fixed lg:static top-[73px] left-0 z-50 w-64 bg-white border-r
            transition-transform duration-200 ease-in-out lg:transition-none
            flex flex-col h-[calc(100vh-73px)] max-w-full
          `}>
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              <AdminNavigation onMobileMenuClose={closeMobileMenu} />
            </div>
          </aside>
        )}

        {/* Mobile overlay */}
        {isMobileMenuOpen && !isPlanningViewer && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden top-[73px]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 w-full max-w-full overflow-x-hidden min-w-0">
          <div className="w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
