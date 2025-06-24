
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

      // 4. Vérifier la limitation temporelle (5 minutes)
      console.log('4. Vérification de la limitation temporelle...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentReservations, error: recentError } = await supabase
        .from('reservations')
        .select('created_at, tel, email, nom_client')
        .or(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentError) {
        console.error('❌ Erreur lors de la vérification temporelle:', recentError);
        // En cas d'erreur, on autorise la réservation pour ne pas bloquer l'utilisateur
      } else {
        console.log('Réservations récentes (5 dernières minutes):', recentReservations);
        
        if (recentReservations && recentReservations.length > 0) {
          const lastReservation = recentReservations[0];
          const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
          const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
          
          console.log('❌ Limitation temporelle activée:', {
            lastReservation: lastReservation.created_at,
            timeDiff: timeDiff / 1000 / 60,
            minutesLeft
          });
          
          return {
            canReserve: false,
            reason: `Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
          };
        } else {
          console.log('✅ Pas de réservations récentes dans les 5 dernières minutes');
        }
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
