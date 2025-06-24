
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
      console.log('Vérification de sécurité pour:', { phone, email });
      
      // 1. Vérifier la blacklist
      const { data: blacklistCheck, error: blacklistError } = await supabase
        .from('blacklist')
        .select('*')
        .or(`and(type.eq.phone,value.eq.${phone}),and(type.eq.email,value.eq.${email})`);

      if (blacklistError) {
        console.error('Erreur lors de la vérification de la blacklist:', blacklistError);
      }

      if (blacklistCheck && blacklistCheck.length > 0) {
        console.log('Contact trouvé dans la blacklist:', blacklistCheck);
        return {
          canReserve: false,
          reason: 'Ce contact est bloqué. Contactez l\'administration.'
        };
      }

      // 2. Vérifier les limites par téléphone (max 2 réservations en attente)
      const { data: phoneReservations, error: phoneError } = await supabase
        .from('reservations')
        .select('id, statut, created_at')
        .eq('tel', phone)
        .eq('statut', 'en_attente');

      if (phoneError) {
        console.error('Erreur lors de la vérification par téléphone:', phoneError);
      }

      console.log('Réservations en attente par téléphone:', phoneReservations);

      if (phoneReservations && phoneReservations.length >= 2) {
        return {
          canReserve: false,
          reason: 'Limite atteinte : maximum 2 réservations en attente par numéro de téléphone.'
        };
      }

      // 3. Vérifier les limites par email (max 2 réservations en attente)
      const { data: emailReservations, error: emailError } = await supabase
        .from('reservations')
        .select('id, statut, created_at')
        .eq('email', email)
        .eq('statut', 'en_attente');

      if (emailError) {
        console.error('Erreur lors de la vérification par email:', emailError);
      }

      console.log('Réservations en attente par email:', emailReservations);

      if (emailReservations && emailReservations.length >= 2) {
        return {
          canReserve: false,
          reason: 'Limite atteinte : maximum 2 réservations en attente par email.'
        };
      }

      // 4. Vérifier la limitation temporelle (5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentReservations, error: recentError } = await supabase
        .from('reservations')
        .select('created_at, tel, email')
        .or(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentError) {
        console.error('Erreur lors de la vérification temporelle:', recentError);
      }

      console.log('Réservations récentes (5 min):', recentReservations);

      if (recentReservations && recentReservations.length > 0) {
        const lastReservation = recentReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        return {
          canReserve: false,
          reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      console.log('Vérification de sécurité réussie - réservation autorisée');
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
