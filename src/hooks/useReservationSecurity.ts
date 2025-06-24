
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SecurityCheckResult {
  canReserve: boolean;
  reason?: string;
}

export function useReservationSecurity() {
  const checkReservationLimits = async (
    phone: string, 
    email: string
  ): Promise<SecurityCheckResult> => {
    try {
      // 1. Vérifier la blacklist
      const { data: blacklistCheck } = await supabase
        .from('blacklist')
        .select('*')
        .or(`and(type.eq.phone,value.eq.${phone}),and(type.eq.email,value.eq.${email})`);

      if (blacklistCheck && blacklistCheck.length > 0) {
        return {
          canReserve: false,
          reason: 'Ce contact est bloqué. Contactez l\'administration.'
        };
      }

      // 2. Vérifier les limites par téléphone (max 2 réservations en attente)
      const { data: phoneReservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('tel', phone)
        .eq('statut', 'en_attente');

      if (phoneReservations && phoneReservations.length >= 2) {
        return {
          canReserve: false,
          reason: 'Limite atteinte : maximum 2 réservations en attente par numéro de téléphone.'
        };
      }

      // 3. Vérifier les limites par email (max 2 réservations en attente)
      const { data: emailReservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('email', email)
        .eq('statut', 'en_attente');

      if (emailReservations && emailReservations.length >= 2) {
        return {
          canReserve: false,
          reason: 'Limite atteinte : maximum 2 réservations en attente par email.'
        };
      }

      // 4. Vérifier la limitation temporelle (5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentReservations } = await supabase
        .from('reservations')
        .select('created_at')
        .or(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentReservations && recentReservations.length > 0) {
        return {
          canReserve: false,
          reason: 'Veuillez attendre 5 minutes avant de faire une nouvelle réservation.'
        };
      }

      return { canReserve: true };
    } catch (error) {
      console.error('Erreur lors de la vérification de sécurité:', error);
      return {
        canReserve: false,
        reason: 'Erreur lors de la vérification. Veuillez réessayer.'
      };
    }
  };

  return { checkReservationLimits };
}
