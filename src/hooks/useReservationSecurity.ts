
import { useBlacklist } from './useBlacklist';

export function useReservationSecurity() {
  const { isBlacklisted } = useBlacklist();

  const checkReservationLimits = async (
    phone: string, 
    email: string,
    isAdminCreation: boolean = false
  ) => {
    try {
      console.log('🔐 Vérification sécurité - Téléphone:', phone, 'Email:', email);
      
      // Vérification blacklist OBLIGATOIRE
      const blocked = isBlacklisted(phone, email);
      
      if (blocked) {
        console.log('🚫 Contact bloqué détecté');
        return {
          canReserve: false,
          reason: 'Ce contact est bloqué et ne peut pas effectuer de réservation.'
        };
      }
      
      console.log('✅ Contact autorisé');
      return { canReserve: true };
      
    } catch (error) {
      console.error('❌ Erreur vérification sécurité:', error);
      return {
        canReserve: false,
        reason: 'Erreur de vérification de sécurité. Veuillez réessayer.'
      };
    }
  };

  return { checkReservationLimits };
}
