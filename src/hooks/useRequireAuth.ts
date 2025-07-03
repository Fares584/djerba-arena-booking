
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useRequireAuth(redirectTo = '/secure-access-portal-2k24-auth-gateway-xyz789') {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useRequireAuth - user:', user?.email, 'loading:', loading);
    
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to", redirectTo);
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading };
}
