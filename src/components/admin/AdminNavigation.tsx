
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Calendar, 
  MapPin, 
  Users, 
  Settings, 
  History,
  Home,
  Shield
} from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface AdminNavigationProps {
  onMobileMenuClose?: () => void;
}

const AdminNavigation = ({ onMobileMenuClose }: AdminNavigationProps) => {
  const location = useLocation();
  const { canAccessOtherAdminPages } = useUserPermissions();

  const handleLinkClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const allNavItems = [
    { path: '/admin', label: 'Dashboard', icon: Home, exact: true },
    { path: '/admin/reservations', label: 'Réservations', icon: Calendar },
    { path: '/admin/historique', label: 'Historique', icon: History },
    { path: '/admin/terrains', label: 'Terrains', icon: MapPin },
    { path: '/admin/planning', label: 'Planning', icon: Calendar },
    { path: '/admin/abonnements', label: 'Abonnements', icon: Users },
    { path: '/admin/blacklist', label: 'Blacklist', icon: Shield },
    { path: '/admin/stats', label: 'Statistiques', icon: BarChart3 },
  ];

  // Filtrer les éléments de navigation selon les permissions
  const navItems = canAccessOtherAdminPages 
    ? allNavItems 
    : allNavItems.filter(item => item.path === '/admin/planning');

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact 
          ? location.pathname === item.path 
          : location.pathname.startsWith(item.path);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-sport-green text-white"
                : "text-gray-600 hover:text-sport-green hover:bg-green-50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNavigation;
