
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceFingerprint } from './useDeviceFingerprint';

interface SecurityCheckResult {
  canReserve: boolean;
  reason?: string;
}

export function useReservationSecurity() {
  const { getDeviceFingerprint } = useDeviceFingerprint();

  // Fonction pour normaliser les numéros de téléphone
  const normalizePhoneNumber = (phone: string): string => {
    // Supprimer tous les espaces, tirets, points, parenthèses
    let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
    
    // Convertir +216 ou 216 en format local (8 chiffres)
    if (cleaned.startsWith('+216')) {
      cleaned = cleaned.substring(4);
    } else if (cleaned.startsWith('216')) {
      cleaned = cleaned.substring(3);
    }
    
    // S'assurer qu'on a bien 8 chiffres pour la Tunisie
    if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
      return cleaned;
    }
    
    // Retourner le numéro original si pas de format reconnu
    return phone.trim();
  };

  const checkReservationLimits = async (
    phone: string, 
    email: string,
    isAdminCreation: boolean = false
  ): Promise<SecurityCheckResult> => {
    try {
      // Si c'est une création admin, contourner TOUTES les vérifications
      if (isAdminCreation) {
        return { canReserve: true };
      }

      // Normaliser les données d'entrée
      const normalizedPhone = normalizePhoneNumber(phone);
      const normalizedEmail = email.trim().toLowerCase();

      // Obtenir le fingerprint de l'appareil
      const deviceFingerprint = getDeviceFingerprint();

      // 1. Vérification de la blacklist
      const { data: allBlacklistItems, error: blacklistError } = await supabase
        .from('blacklist')
        .select('*');

      if (blacklistError) {
        console.error('❌ Erreur lors de la récupération de la blacklist:', blacklistError);
        return {
          canReserve: false,
          reason: 'Erreur de vérification de sécurité. Veuillez réessayer.'
        };
      }

      // Vérifier manuellement si le téléphone ou l'email sont dans la blacklist
      if (allBlacklistItems && allBlacklistItems.length > 0) {
        // Vérifier téléphone - test avec plusieurs variations
        const phoneVariations = [phone, normalizedPhone, phone.trim()];
        
        for (const phoneItem of allBlacklistItems.filter(item => item.type === 'phone')) {
          for (const phoneVar of phoneVariations) {
            if (phoneItem.value === phoneVar || phoneItem.value.includes(phoneVar) || phoneVar.includes(phoneItem.value)) {
              return {
                canReserve: false,
                reason: 'Ce contact est bloqué. Contactez l\'administration.'
              };
            }
          }
        }

        // Vérifier email - test avec plusieurs variations
        const emailVariations = [email, normalizedEmail, email.trim()];
        
        for (const emailItem of allBlacklistItems.filter(item => item.type === 'email')) {
          for (const emailVar of emailVariations) {
            if (emailItem.value === emailVar || emailItem.value.includes(emailVar) || emailVar.includes(emailItem.value)) {
              return {
                canReserve: false,
                reason: 'Ce contact est bloqué. Contactez l\'administration.'
              };
            }
          }
        }
      }

      // 2. Vérification des limites par contact (email + téléphone)
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      const { data: contactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('id, created_at, tel, email, nom_client, ip_address')
        .eq('tel', phone)
        .eq('email', email)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (contactError) {
        console.error('Erreur lors de la vérification par contact:', contactError);
      }

      const contactReservationsCount = contactReservations?.length || 0;

      if (contactReservationsCount >= 2) {
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par personne par jour. Vous avez déjà fait ${contactReservationsCount} réservation(s) aujourd'hui.`
        };
      }

      // 3. Vérification des limites par appareil (fingerprint)
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

      if (deviceReservationsCount >= 2) {
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par appareil par jour. Cet appareil a déjà fait ${deviceReservationsCount} réservation(s) aujourd'hui.`
        };
      }

      // 4. Vérification temporelle par contact (5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentContactReservations, error: recentContactError } = await supabase
        .from('reservations')
        .select('created_at, tel, email')
        .eq('tel', phone)
        .eq('email', email)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentContactError && recentContactReservations && recentContactReservations.length > 0) {
        const lastReservation = recentContactReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        return {
          canReserve: false,
          reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // 5. Vérification temporelle par appareil (2 minutes)
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
        
        return {
          canReserve: false,
          reason: `Cet appareil doit attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // 6. Vérification anti-spam global (protection du système)
      const { data: recentGlobalReservations, error: globalError } = await supabase
        .from('reservations')
        .select('created_at')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!globalError && recentGlobalReservations && recentGlobalReservations.length >= 15) {
        return {
          canReserve: false,
          reason: 'Système temporairement surchargé. Veuillez réessayer dans quelques minutes.'
        };
      }

      return { canReserve: true };
      
    } catch (error) {
      console.error('❌ Erreur générale lors de la vérification de sécurité:', error);
      // En cas d'erreur, on bloque par sécurité
      return {
        canReserve: false,
        reason: 'Erreur de vérification de sécurité. Veuillez réessayer dans quelques minutes.'
      };
    }
  };

  return { checkReservationLimits };
}
