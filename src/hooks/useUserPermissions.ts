
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'planning_viewer' | 'none';

export function useUserPermissions() {
  const { user } = useAuth();

  const getUserRole = (): UserRole => {
    if (!user?.email) return 'none';
    
    const email = user.email.toLowerCase();
    
    // Vérifier si l'email contient les noms autorisés pour le planning
    const planningViewers = ['ahmed', 'wassim', 'khalil'];
    const isPlanningViewer = planningViewers.some(name => email.includes(name));
    
    if (isPlanningViewer) {
      return 'planning_viewer';
    }
    
    // Pour les vrais admins, vous pouvez ajouter une autre condition ici
    // Par exemple, vérifier un domaine spécifique ou une liste d'emails admin
    // if (email === 'admin@example.com') return 'admin';
    
    return 'none';
  };

  const role = getUserRole();
  
  return {
    role,
    isAdmin: role === 'admin',
    isPlanningViewer: role === 'planning_viewer',
    canAccessPlanning: role === 'admin' || role === 'planning_viewer',
    canAccessOtherAdminPages: role === 'admin'
  };
}
