
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole, UserRole } from './useUserRole';

export function useRequireRole(requiredRoles: UserRole[]) {
  const { role, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!role || !requiredRoles.includes(role))) {
      console.log("Access denied, role:", role, "required:", requiredRoles);
      navigate('/login');
    }
  }, [role, loading, navigate, requiredRoles]);

  return { role, loading };
}
