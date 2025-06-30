
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useUserPermissions } from './useUserPermissions';

export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const { role, canAccessPlanning, canAccessOtherAdminPages } = useUserPermissions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('useRequireAuth - user:', user?.email, 'loading:', loading, 'role:', role);
    
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to", redirectTo);
      navigate(redirectTo);
      return;
    }

    if (!loading && user && role === 'none') {
      console.log("User has no permissions, redirecting to login");
      navigate('/login');
      return;
    }

    // Si l'utilisateur est un planning_viewer et essaie d'accéder à autre chose que le planning
    if (!loading && user && role === 'planning_viewer') {
      const currentPath = location.pathname;
      
      // Autoriser seulement /admin et /admin/planning pour les planning_viewers
      if (currentPath !== '/admin' && currentPath !== '/admin/planning') {
        console.log("Planning viewer trying to access restricted area, redirecting to planning");
        navigate('/admin/planning');
      }
    }
  }, [user, loading, navigate, redirectTo, role, location.pathname]);

  return { user, loading, role };
}
