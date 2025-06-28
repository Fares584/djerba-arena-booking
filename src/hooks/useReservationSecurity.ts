
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceFingerprint } from './useDeviceFingerprint';
import { normalizeTunisianPhone } from '@/lib/validation';

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
      console.log('🔐 === DÉBUT VÉRIFICATION SÉCURITÉ COMPLÈTE ===');
      console.log('📞 Téléphone brut reçu:', phone);
      console.log('📧 Email à vérifier:', email);
      console.log('👤 Mode admin:', isAdminCreation);
      
      // Normaliser le téléphone vers 8 chiffres
      const normalizedPhone = normalizeTunisianPhone(phone);
      const cleanEmail = email.trim().toLowerCase();
      
      console.log('📞 Téléphone normalisé (8 chiffres):', normalizedPhone);
      console.log('📧 Email nettoyé:', cleanEmail);

      // ==================== VÉRIFICATION BLACKLIST OBLIGATOIRE ====================
      console.log('🚫 1. VÉRIFICATION BLACKLIST (TOUJOURS ACTIVE)');
      
      // Vérifier téléphone dans blacklist avec le numéro normalisé
      console.log('🔍 Recherche téléphone normalisé dans blacklist...');
      const { data: phoneBlacklistData, error: phoneBlacklistError } = await supabase
        .from('blacklist')
        .select('*')
        .eq('type', 'phone')
        .eq('value', normalizedPhone);

      if (phoneBlacklistError) {
        console.error('❌ Erreur vérification téléphone blacklist:', phoneBlacklistError);
        throw new Error('Erreur de vérification de sécurité');
      }

      console.log('📋 Résultat recherche téléphone normalisé:', phoneBlacklistData);

      if (phoneBlacklistData && phoneBlacklistData.length > 0) {
        console.log('🚫 TÉLÉPHONE BLOQUÉ DÉTECTÉ:', phoneBlacklistData[0]);
        console.log('❌ === RÉSERVATION REFUSÉE - TÉLÉPHONE BLACKLISTÉ ===');
        return {
          canReserve: false,
          reason: `Ce numéro de téléphone (${phone}) est bloqué définitivement. Contactez l'administration.`
        };
      }

      // Vérifier email dans blacklist
      console.log('🔍 Recherche email dans blacklist...');
      const { data: emailBlacklistData, error: emailBlacklistError } = await supabase
        .from('blacklist')
        .select('*')
        .eq('type', 'email')
        .eq('value', cleanEmail);

      if (emailBlacklistError) {
        console.error('❌ Erreur vérification email blacklist:', emailBlacklistError);
        throw new Error('Erreur de vérification de sécurité');
      }

      console.log('📋 Résultat recherche email:', emailBlacklistData);

      if (emailBlacklistData && emailBlacklistData.length > 0) {
        console.log('🚫 EMAIL BLOQUÉ DÉTECTÉ:', emailBlacklistData[0]);
        console.log('❌ === RÉSERVATION REFUSÉE - EMAIL BLACKLISTÉ ===');
        return {
          canReserve: false,
          reason: `Cette adresse email (${cleanEmail}) est bloquée définitivement. Contactez l'administration.`
        };
      }

      console.log('✅ Contact non présent dans la blacklist');

      // ==================== AUTRES VÉRIFICATIONS (CONTOURNABLES SI ADMIN) ====================
      if (isAdminCreation) {
        console.log('👤 MODE ADMIN - Autres vérifications contournées');
        console.log('✅ === AUTORISATION ADMIN ACCORDÉE ===');
        return { canReserve: true };
      }

      console.log('🔄 2. Vérifications supplémentaires...');
      
      const deviceFingerprint = getDeviceFingerprint();
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      // Vérification limites quotidiennes par contact - utiliser le téléphone normalisé
      const { data: contactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('id, created_at, tel, email, nom_client')
        .eq('tel', normalizedPhone)
        .eq('email', cleanEmail)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (contactError) {
        console.error('Erreur vérification contact:', contactError);
      }

      const contactCount = contactReservations?.length || 0;
      console.log(`📊 Réservations par ce contact aujourd'hui: ${contactCount}/2`);

      if (contactCount >= 2) {
        console.log('❌ Limite quotidienne par contact atteinte');
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par personne par jour. Vous avez déjà fait ${contactCount} réservation(s) aujourd'hui.`
        };
      }

      // Vérification limites par appareil
      const { data: deviceReservations, error: deviceError } = await supabase
        .from('reservations')
        .select('id, created_at, ip_address')
        .eq('ip_address', deviceFingerprint)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (deviceError) {
        console.error('Erreur vérification appareil:', deviceError);
      }

      const deviceCount = deviceReservations?.length || 0;
      console.log(`📊 Réservations par cet appareil aujourd'hui: ${deviceCount}/2`);

      if (deviceCount >= 2) {
        console.log('❌ Limite quotidienne par appareil atteinte');
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par appareil par jour. Cet appareil a déjà fait ${deviceCount} réservation(s) aujourd'hui.`
        };
      }

      // Vérifications temporelles - utiliser le téléphone normalisé
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentContactReservations } = await supabase
        .from('reservations')
        .select('created_at')
        .eq('tel', normalizedPhone)
        .eq('email', cleanEmail)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentContactReservations && recentContactReservations.length > 0) {
        const timeDiff = new Date().getTime() - new Date(recentContactReservations[0].created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        return {
          canReserve: false,
          reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: recentDeviceReservations } = await supabase
        .from('reservations')
        .select('created_at')
        .eq('ip_address', deviceFingerprint)
        .gte('created_at', twoMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentDeviceReservations && recentDeviceReservations.length > 0) {
        const timeDiff = new Date().getTime() - new Date(recentDeviceReservations[0].created_at).getTime();
        const minutesLeft = Math.ceil((2 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        return {
          canReserve: false,
          reason: `Cet appareil doit attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      console.log('✅ === TOUTES LES VÉRIFICATIONS PASSÉES ===');
      return { canReserve: true };
      
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE dans checkReservationLimits:', error);
      return {
        canReserve: false,
        reason: 'Erreur de vérification de sécurité. Veuillez réessayer.'
      };
    }
  };

  return { checkReservationLimits };
}
