
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
import { useUserRole } from '@/hooks/useUserRole';

interface AdminNavigationProps {
  onMobileMenuClose?: () => void;
}

const AdminNavigation = ({ onMobileMenuClose }: AdminNavigationProps) => {
  const location = useLocation();
  const { role } = useUserRole();

  const handleLinkClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home, exact: true, roles: ['admin'] },
    { path: '/admin/reservations', label: 'Réservations', icon: Calendar, roles: ['admin'] },
    { path: '/admin/historique', label: 'Historique', icon: History, roles: ['admin'] },
    { path: '/admin/terrains', label: 'Terrains', icon: MapPin, roles: ['admin'] },
    { path: '/admin/planning', label: 'Planning', icon: Calendar, roles: ['admin', 'employee'] },
    { path: '/admin/abonnements', label: 'Abonnements', icon: Users, roles: ['admin'] },
    { path: '/admin/blacklist', label: 'Blacklist', icon: Shield, roles: ['admin'] },
    { path: '/admin/stats', label: 'Statistiques', icon: BarChart3, roles: ['admin'] },
  ];

  // Filtrer les éléments de navigation selon le rôle
  const filteredNavItems = navItems.filter(item => 
    role && item.roles.includes(role)
  );

  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
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
