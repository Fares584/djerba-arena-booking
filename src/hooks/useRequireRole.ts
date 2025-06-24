
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole, UserRole } from './useUserRole';
import { useAuth } from './useAuth';

export function useRequireRole(allowedRoles: UserRole[], redirectTo = '/login') {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useRequireRole - user:', user?.email, 'role:', role, 'authLoading:', authLoading, 'roleLoading:', roleLoading);
    
    if (!authLoading && !roleLoading) {
      if (!user) {
        console.log("User not authenticated, redirecting to", redirectTo);
        navigate(redirectTo);
        return;
      }
      
      if (role && !allowedRoles.includes(role)) {
        console.log("User role not allowed, redirecting to planning");
        navigate('/admin/planning');
        return;
      }
    }
  }, [user, role, authLoading, roleLoading, navigate, redirectTo, allowedRoles]);

  return { user, role, loading: authLoading || roleLoading };
}
