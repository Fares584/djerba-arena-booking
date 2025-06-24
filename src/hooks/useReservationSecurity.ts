
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
      console.log('=== DÉBUT VÉRIFICATION SÉCURITÉ ===');
      console.log('Vérification de sécurité pour:', { phone, email });
      
      // 1. Vérifier la blacklist
      console.log('1. Vérification de la blacklist...');
      const { data: blacklistCheck, error: blacklistError } = await supabase
        .from('blacklist')
        .select('*')
        .or(`and(type.eq.phone,value.eq.${phone}),and(type.eq.email,value.eq.${email})`);

      if (blacklistError) {
        console.error('Erreur lors de la vérification de la blacklist:', blacklistError);
        // Ne pas bloquer en cas d'erreur de blacklist
      } else if (blacklistCheck && blacklistCheck.length > 0) {
        console.log('❌ Contact trouvé dans la blacklist:', blacklistCheck);
        return {
          canReserve: false,
          reason: 'Ce contact est bloqué. Contactez l\'administration.'
        };
      } else {
        console.log('✅ Contact non présent dans la blacklist');
      }

      // 2. Vérifier les limites par téléphone (max 2 réservations en attente)
      console.log('2. Vérification des limites par téléphone...');
      const { data: phoneReservations, error: phoneError } = await supabase
        .from('reservations')
        .select('id, statut, created_at, nom_client')
        .eq('tel', phone)
        .eq('statut', 'en_attente');

      if (phoneError) {
        console.error('❌ Erreur lors de la vérification par téléphone:', phoneError);
        // En cas d'erreur, on autorise la réservation pour ne pas bloquer l'utilisateur
      } else {
        console.log(`Réservations en attente par téléphone (${phone}):`, phoneReservations);
        
        if (phoneReservations && phoneReservations.length >= 2) {
          console.log('❌ Limite atteinte par téléphone:', phoneReservations.length, 'réservations en attente');
          return {
            canReserve: false,
            reason: 'Limite atteinte : maximum 2 réservations en attente par numéro de téléphone.'
          };
        } else {
          console.log(`✅ Téléphone OK: ${phoneReservations?.length || 0}/2 réservations en attente`);
        }
      }

      // 3. Vérifier les limites par email (max 2 réservations en attente)
      console.log('3. Vérification des limites par email...');
      const { data: emailReservations, error: emailError } = await supabase
        .from('reservations')
        .select('id, statut, created_at, nom_client')
        .eq('email', email)
        .eq('statut', 'en_attente');

      if (emailError) {
        console.error('❌ Erreur lors de la vérification par email:', emailError);
        // En cas d'erreur, on autorise la réservation pour ne pas bloquer l'utilisateur
      } else {
        console.log(`Réservations en attente par email (${email}):`, emailReservations);
        
        if (emailReservations && emailReservations.length >= 2) {
          console.log('❌ Limite atteinte par email:', emailReservations.length, 'réservations en attente');
          return {
            canReserve: false,
            reason: 'Limite atteinte : maximum 2 réservations en attente par email.'
          };
        } else {
          console.log(`✅ Email OK: ${emailReservations?.length || 0}/2 réservations en attente`);
        }
      }

      // 4. Vérifier la limitation temporelle globale (5 minutes par IP)
      console.log('4. Vérification de la limitation temporelle globale...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      // D'abord vérifier par contact (email ou téléphone)
      const { data: recentContactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('created_at, tel, email, nom_client')
        .or(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (contactError) {
        console.error('❌ Erreur lors de la vérification temporelle par contact:', contactError);
      } else if (recentContactReservations && recentContactReservations.length > 0) {
        const lastReservation = recentContactReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        console.log('❌ Limitation temporelle activée (par contact):', {
          lastReservation: lastReservation.created_at,
          timeDiff: timeDiff / 1000 / 60,
          minutesLeft
        });
        
        return {
          canReserve: false,
          reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // Ensuite vérifier globalement (pour empêcher le contournement en changeant email/tel)
      const { data: allRecentReservations, error: globalError } = await supabase
        .from('reservations')
        .select('created_at, ip_address')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (globalError) {
        console.error('❌ Erreur lors de la vérification temporelle globale:', globalError);
      } else if (allRecentReservations && allRecentReservations.length > 0) {
        // Obtenir l'IP actuelle (approximative via navigator si disponible)
        // Note: En production, l'IP devrait être stockée côté serveur
        const userIP = await getUserIP();
        
        if (userIP) {
          const recentFromSameIP = allRecentReservations.filter(res => 
            res.ip_address === userIP
          );
          
          if (recentFromSameIP.length > 0) {
            const lastReservation = recentFromSameIP[0];
            const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
            const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
            
            console.log('❌ Limitation temporelle activée (par IP):', {
              userIP,
              lastReservation: lastReservation.created_at,
              timeDiff: timeDiff / 1000 / 60,
              minutesLeft
            });
            
            return {
              canReserve: false,
              reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation. (Limitation par session)`
            };
          }
        }
        
        console.log('✅ Pas de réservations récentes pour cette session');
      } else {
        console.log('✅ Pas de réservations récentes dans les 5 dernières minutes');
      }

      console.log('✅ Toutes les vérifications de sécurité sont passées - réservation autorisée');
      console.log('=== FIN VÉRIFICATION SÉCURITÉ ===');
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

// Fonction pour obtenir l'IP de l'utilisateur
async function getUserIP(): Promise<string | null> {
  try {
    // Méthode simple pour obtenir une empreinte de session
    // En production, l'IP devrait être obtenue côté serveur
    const sessionId = getOrCreateSessionId();
    return sessionId;
  } catch (error) {
    console.error('Erreur lors de l\'obtention de l\'IP:', error);
    return null;
  }
}

// Créer ou récupérer un ID de session unique pour cette session de navigateur
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('reservation_session_id');
  
  if (!sessionId) {
    // Créer un identifiant unique basé sur plusieurs facteurs
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userAgent = navigator.userAgent.slice(0, 50);
    
    sessionId = btoa(`${timestamp}-${random}-${userAgent}`).slice(0, 32);
    sessionStorage.setItem('reservation_session_id', sessionId);
  }
  
  return sessionId;
}
