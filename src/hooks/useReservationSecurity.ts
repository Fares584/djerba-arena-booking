
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SecurityCheckResult {
  canReserve: boolean;
  reason?: string;
}

export function useReservationSecurity() {
  const checkReservationLimits = async (
    phone: string, 
    email: string,
    isAdminCreation: boolean = false
  ): Promise<SecurityCheckResult> => {
    try {
      console.log('=== DÉBUT VÉRIFICATION SÉCURITÉ RENFORCÉE ===');
      console.log('Vérification de sécurité pour:', { phone, email, isAdminCreation });
      
      // Si c'est une création admin, contourner TOUTES les vérifications immédiatement
      if (isAdminCreation) {
        console.log('✅ ADMIN CRÉATION - Toutes les vérifications de sécurité contournées');
        console.log('=== FIN VÉRIFICATION SÉCURITÉ RENFORCÉE ===');
        return { canReserve: true };
      }

      // 1. Vérifier la blacklist
      console.log('1. Vérification de la blacklist...');
      const { data: blacklistCheck, error: blacklistError } = await supabase
        .from('blacklist')
        .select('*')
        .or(`and(type.eq.phone,value.eq.${phone}),and(type.eq.email,value.eq.${email})`);

      if (blacklistError) {
        console.error('Erreur lors de la vérification de la blacklist:', blacklistError);
      } else if (blacklistCheck && blacklistCheck.length > 0) {
        console.log('❌ Contact trouvé dans la blacklist:', blacklistCheck);
        return {
          canReserve: false,
          reason: 'Ce contact est bloqué. Contactez l\'administration.'
        };
      } else {
        console.log('✅ Contact non présent dans la blacklist');
      }

      // 2. VÉRIFICATION RENFORCÉE : Limite quotidienne par contact (email + téléphone)
      console.log('2. Vérification de la limite quotidienne par contact...');
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      // Vérifier UNIQUEMENT par contact (email ET téléphone exact)
      const { data: dailyContactReservations, error: dailyError } = await supabase
        .from('reservations')
        .select('id, created_at, nom_client, tel, email')
        .and(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (dailyError) {
        console.error('Erreur lors de la vérification quotidienne:', dailyError);
      }

      const totalReservationsToday = dailyContactReservations ? dailyContactReservations.length : 0;

      console.log(`Réservations du même contact aujourd'hui: ${totalReservationsToday}/2`);

      if (totalReservationsToday >= 2) {
        console.log('❌ BLOQUÉ - Limite quotidienne par contact atteinte:', {
          totalReservationsToday,
          phone,
          email
        });
        
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par contact par jour. Ce numéro et email ont déjà fait ${totalReservationsToday} réservation(s) aujourd'hui.`
        };
      } else {
        console.log(`✅ Limite quotidienne OK: ${totalReservationsToday}/2 réservations aujourd'hui pour ce contact`);
      }

      // 3. VÉRIFICATION TEMPORELLE PAR CONTACT UNIQUEMENT
      console.log('3. Vérification temporelle par contact...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      // Vérifier UNIQUEMENT par contact exact (email ET téléphone)
      console.log('3A. Vérification par contact exact...');
      const { data: recentContactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('created_at, tel, email, nom_client')
        .and(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!contactError && recentContactReservations && recentContactReservations.length > 0) {
        const lastReservation = recentContactReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        console.log('❌ BLOQUÉ - Limitation temporelle par contact exact:', {
          lastReservation: lastReservation.created_at,
          timeDiff: timeDiff / 1000 / 60,
          minutesLeft
        });
        
        return {
          canReserve: false,
          reason: `Ce contact vient de faire une réservation. Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // 4. Vérification par fréquence globale (protection anti-spam très basique)
      console.log('4. Vérification fréquence globale...');
      const { data: recentGlobalReservations, error: globalError } = await supabase
        .from('reservations')
        .select('created_at')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!globalError && recentGlobalReservations && recentGlobalReservations.length >= 10) {
        console.log('❌ BLOQUÉ - Trop de réservations récentes globalement:', recentGlobalReservations.length);
        return {
          canReserve: false,
          reason: 'Système temporairement surchargé. Veuillez réessayer dans quelques minutes.'
        };
      }

      console.log('✅ Toutes les vérifications de sécurité sont passées');
      console.log('=== FIN VÉRIFICATION SÉCURITÉ RENFORCÉE ===');
      return { canReserve: true };
      
    } catch (error) {
      console.error('❌ Erreur générale lors de la vérification de sécurité:', error);
      // En cas d'erreur générale, on autorise la réservation pour ne pas bloquer complètement le système
      return {
        canReserve: true,
        reason: 'Vérification de sécurité échouée, réservation autorisée par défaut'
      };
    }
  };

  return { checkReservationLimits };
}
