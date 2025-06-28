
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceFingerprint } from './useDeviceFingerprint';

interface SecurityCheckResult {
  canReserve: boolean;
  reason?: string;
}

export function useReservationSecurity() {
  const { getDeviceFingerprint } = useDeviceFingerprint();

  const checkReservationLimits = async (
    phone: string, 
    email: string,
    isAdminCreation: boolean = false
  ): Promise<SecurityCheckResult> => {
    try {
      console.log('=== DÉBUT VÉRIFICATION BLACKLIST ===');
      console.log('Vérification pour:', { phone: phone.trim(), email: email.trim().toLowerCase(), isAdminCreation });
      
      // Nettoyer les données d'entrée
      const cleanPhone = phone.trim();
      const cleanEmail = email.trim().toLowerCase();
      
      // 1. VÉRIFICATION BLACKLIST - PRIORITÉ ABSOLUE
      console.log('1. Vérification BLACKLIST (priorité absolue)...');
      
      // Vérifier le téléphone dans la blacklist
      console.log('Recherche téléphone dans blacklist:', cleanPhone);
      const { data: phoneBlacklist, error: phoneError } = await supabase
        .from('blacklist')
        .select('*')
        .eq('type', 'phone')
        .eq('value', cleanPhone);

      if (phoneError) {
        console.error('❌ Erreur lors de la vérification téléphone blacklist:', phoneError);
        return {
          canReserve: false,
          reason: 'Erreur de vérification de sécurité. Veuillez réessayer.'
        };
      }

      if (phoneBlacklist && phoneBlacklist.length > 0) {
        console.log('❌ TÉLÉPHONE BLOQUÉ - Trouvé dans blacklist:', phoneBlacklist[0]);
        return {
          canReserve: false,
          reason: 'Ce numéro de téléphone est bloqué. Contactez l\'administration pour plus d\'informations.'
        };
      }

      // Vérifier l'email dans la blacklist
      console.log('Recherche email dans blacklist:', cleanEmail);
      const { data: emailBlacklist, error: emailError } = await supabase
        .from('blacklist')
        .select('*')
        .eq('type', 'email')
        .eq('value', cleanEmail);

      if (emailError) {
        console.error('❌ Erreur lors de la vérification email blacklist:', emailError);
        return {
          canReserve: false,
          reason: 'Erreur de vérification de sécurité. Veuillez réessayer.'
        };
      }

      if (emailBlacklist && emailBlacklist.length > 0) {
        console.log('❌ EMAIL BLOQUÉ - Trouvé dans blacklist:', emailBlacklist[0]);
        return {
          canReserve: false,
          reason: 'Cette adresse email est bloquée. Contactez l\'administration pour plus d\'informations.'
        };
      }

      console.log('✅ Contact non présent dans la blacklist');

      // Si c'est une création admin, contourner le RESTE des vérifications (pas la blacklist)
      if (isAdminCreation) {
        console.log('✅ ADMIN CRÉATION - Autres vérifications contournées (blacklist toujours active)');
        console.log('=== FIN VÉRIFICATION BLACKLIST ===');
        return { canReserve: true };
      }

      // Le reste des vérifications de sécurité (limites quotidiennes, etc.)
      const deviceFingerprint = getDeviceFingerprint();
      console.log('Fingerprint de l\'appareil:', deviceFingerprint);

      // 2. Vérification des limites par contact (email + téléphone)
      console.log('2. Vérification des limites par contact...');
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      const { data: contactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('id, created_at, tel, email, nom_client, ip_address')
        .eq('tel', cleanPhone)
        .eq('email', cleanEmail)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (contactError) {
        console.error('Erreur lors de la vérification par contact:', contactError);
      }

      const contactReservationsCount = contactReservations?.length || 0;
      console.log(`Réservations par ce contact aujourd'hui: ${contactReservationsCount}/2`);

      if (contactReservationsCount >= 2) {
        console.log('❌ BLOQUÉ - Limite quotidienne par contact atteinte');
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par personne par jour. Vous avez déjà fait ${contactReservationsCount} réservation(s) aujourd'hui.`
        };
      }

      // 3. Vérification des limites par appareil (fingerprint)
      console.log('3. Vérification des limites par appareil...');
      const { data: deviceReservations, error: deviceError } = await supabase
        .from('reservations')
        .select('id, created_at, tel, email, nom_client, ip_address')
        .eq('ip_address', deviceFingerprint)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (deviceError) {
        console.error('Erreur lors de la vérification par appareil:', deviceError);
      }

      const deviceReservationsCount = deviceReservations?.length || 0;
      console.log(`Réservations par cet appareil aujourd'hui: ${deviceReservationsCount}/2`);

      if (deviceReservationsCount >= 2) {
        console.log('❌ BLOQUÉ - Limite quotidienne par appareil atteinte');
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par appareil par jour. Cet appareil a déjà fait ${deviceReservationsCount} réservation(s) aujourd'hui.`
        };
      }

      // 4. Vérification temporelle par contact (5 minutes)
      console.log('4. Vérification temporelle par contact...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentContactReservations, error: recentContactError } = await supabase
        .from('reservations')
        .select('created_at, tel, email')
        .eq('tel', cleanPhone)
        .eq('email', cleanEmail)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentContactError && recentContactReservations && recentContactReservations.length > 0) {
        const lastReservation = recentContactReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        console.log('❌ BLOQUÉ - Limitation temporelle par contact');
        return {
          canReserve: false,
          reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // 5. Vérification temporelle par appareil (2 minutes)
      console.log('5. Vérification temporelle par appareil...');
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data: recentDeviceReservations, error: recentDeviceError } = await supabase
        .from('reservations')
        .select('created_at, ip_address')
        .eq('ip_address', deviceFingerprint)
        .gte('created_at', twoMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentDeviceError && recentDeviceReservations && recentDeviceReservations.length > 0) {
        const lastDeviceReservation = recentDeviceReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastDeviceReservation.created_at).getTime();
        const minutesLeft = Math.ceil((2 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        console.log('❌ BLOQUÉ - Limitation temporelle par appareil');
        return {
          canReserve: false,
          reason: `Cet appareil doit attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      console.log('✅ Toutes les vérifications de sécurité sont passées');
      console.log('=== FIN VÉRIFICATION BLACKLIST ===');
      return { canReserve: true };
      
    } catch (error) {
      console.error('❌ Erreur générale lors de la vérification de sécurité:', error);
      return {
        canReserve: false,
        reason: 'Erreur de vérification de sécurité. Veuillez réessayer dans quelques minutes.'
      };
    }
  };

  return { checkReservationLimits };
}
