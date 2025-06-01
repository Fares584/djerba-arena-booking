import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Calendar, Users, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, requireAuth, logout } = useAuth();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  if (!user) {
    return null; // Or a loading spinner, redirect, etc.
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      href: '/admin', 
      label: 'Tableau de bord', 
      icon: <BarChart3 className="h-4 w-4" /> 
    },
    { 
      href: '/admin/reservations', 
      label: 'Réservations', 
      icon: <Calendar className="h-4 w-4" /> 
    },
    { 
      href: '/admin/terrains', 
      label: 'Terrains', 
      icon: <Users className="h-4 w-4" /> 
    },
    { 
      href: '/admin/abonnements', 
      label: 'Abonnements', 
      icon: <CreditCard className="h-4 w-4" /> 
    },
    { 
      href: '/admin/planning', 
      label: 'Planning', 
      icon: <Calendar className="h-4 w-4" /> 
    },
    { 
      href: '/admin/stats', 
      label: 'Statistiques', 
      icon: <BarChart3 className="h-4 w-4" /> 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 py-4">
        <div className="px-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={`w-full justify-start font-normal ${location.pathname === item.href ? 'bg-gray-100 hover:bg-gray-100' : ''}`}
              onClick={() => navigate(item.href)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </nav>
        <Separator className="my-4" />
        <div className="sticky bottom-0 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto">
            <h2 className="text-xl font-semibold text-gray-700">
              {menuItems.find(item => item.href === location.pathname)?.label || 'Tableau de bord'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto py-6 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
