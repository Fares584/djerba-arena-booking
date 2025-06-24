
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
      console.log('=== DÉBUT VÉRIFICATION SÉCURITÉ AMÉLIORÉE ===');
      console.log('Vérification de sécurité pour:', { phone, email, isAdminCreation });
      
      // Si c'est une création admin, contourner TOUTES les vérifications
      if (isAdminCreation) {
        console.log('✅ ADMIN CRÉATION - Toutes les vérifications de sécurité contournées');
        return { canReserve: true };
      }

      // 1. Vérifier la blacklist
      console.log('1. Vérification de la blacklist...');
      const { data: blacklistCheck, error: blacklistError } = await supabase
        .from('blacklist')
        .select('*')
        .or(`type.eq.phone,type.eq.email`)
        .or(`value.eq.${phone},value.eq.${email}`);

      if (blacklistError) {
        console.error('Erreur lors de la vérification de la blacklist:', blacklistError);
      } else if (blacklistCheck && blacklistCheck.length > 0) {
        const isBlacklisted = blacklistCheck.some(item => 
          (item.type === 'phone' && item.value === phone) ||
          (item.type === 'email' && item.value === email)
        );
        
        if (isBlacklisted) {
          console.log('❌ Contact trouvé dans la blacklist:', blacklistCheck);
          return {
            canReserve: false,
            reason: 'Ce contact est bloqué. Contactez l\'administration.'
          };
        }
      }
      console.log('✅ Contact non présent dans la blacklist');

      // 2. NOUVELLE APPROCHE : Identification basée uniquement sur le contact (email + téléphone)
      console.log('2. Vérification des limites par contact...');
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      // Recherche UNIQUEMENT par email ET téléphone exact
      const { data: contactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('id, created_at, tel, email, nom_client')
        .eq('tel', phone)
        .eq('email', email)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (contactError) {
        console.error('Erreur lors de la vérification par contact:', contactError);
      }

      const contactReservationsCount = contactReservations?.length || 0;
      console.log(`Réservations par ce contact aujourd'hui: ${contactReservationsCount}/2`);

      if (contactReservationsCount >= 2) {
        console.log('❌ BLOQUÉ - Limite quotidienne par contact atteinte:', {
          contactReservationsCount,
          phone,
          email: email.slice(0, 5) + '...'
        });
        
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par personne par jour. Vous avez déjà fait ${contactReservationsCount} réservation(s) aujourd'hui.`
        };
      }

      // 3. Vérification temporelle par contact (5 minutes)
      console.log('3. Vérification temporelle par contact...');
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
        
        console.log('❌ BLOQUÉ - Limitation temporelle par contact:', {
          lastReservation: lastReservation.created_at,
          timeDiff: timeDiff / 1000 / 60,
          minutesLeft
        });
        
        return {
          canReserve: false,
          reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // 4. Vérification anti-spam global (protection du système)
      console.log('4. Vérification anti-spam global...');
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
      console.log('=== FIN VÉRIFICATION SÉCURITÉ AMÉLIORÉE ===');
      return { canReserve: true };
      
    } catch (error) {
      console.error('❌ Erreur générale lors de la vérification de sécurité:', error);
      // En cas d'erreur, on autorise la réservation pour ne pas bloquer le système
      return {
        canReserve: true,
        reason: 'Vérification de sécurité échouée, réservation autorisée par défaut'
      };
    }
  };

  return { checkReservationLimits };
}

// Créer un ID de session simple pour traçabilité
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('reservation_session_id');
  
  if (!sessionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    sessionId = `${timestamp}-${random}`;
    sessionStorage.setItem('reservation_session_id', sessionId);
  }
  
  return sessionId;
}
