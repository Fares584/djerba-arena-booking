
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

interface AdminNavigationProps {
  onMobileMenuClose?: () => void;
}

const AdminNavigation = ({ onMobileMenuClose }: AdminNavigationProps) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const navItems = [
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789', label: 'Dashboard', icon: Home, exact: true },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/reservations', label: 'Réservations', icon: Calendar },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/historique', label: 'Historique', icon: History },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/terrains', label: 'Terrains', icon: MapPin },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/planning', label: 'Planning', icon: Calendar },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/abonnements', label: 'Abonnements', icon: Users },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/blacklist', label: 'Blacklist', icon: Shield },
    { path: '/admin-control-panel-secure-dashboard-2k24-mgmt-xyz789/stats', label: 'Statistiques', icon: BarChart3 },
  ];

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
