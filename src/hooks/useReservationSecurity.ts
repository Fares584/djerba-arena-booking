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
      console.log('=== DÉBUT VÉRIFICATION SÉCURITÉ RENFORCÉE ===');
      console.log('Vérification de sécurité pour:', { phone, email });
      
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

      // 2. VÉRIFICATION : Limite quotidienne par appareil (max 2 réservations par jour)
      console.log('2. Vérification de la limite quotidienne par appareil...');
      const sessionId = getOrCreateSessionId();
      const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      const { data: dailyDeviceReservations, error: dailyError } = await supabase
        .from('reservations')
        .select('id, created_at, ip_address, nom_client, tel, email')
        .eq('ip_address', sessionId)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (!dailyError && dailyDeviceReservations && dailyDeviceReservations.length >= 2) {
        console.log('❌ BLOQUÉ - Limite quotidienne par appareil atteinte:', {
          sessionId,
          reservationsToday: dailyDeviceReservations.length,
          reservations: dailyDeviceReservations
        });
        
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par appareil par jour. Vous avez déjà fait ${dailyDeviceReservations.length} réservation(s) aujourd'hui.`
        };
      } else {
        console.log(`✅ Limite quotidienne OK: ${dailyDeviceReservations?.length || 0}/2 réservations aujourd'hui`);
      }

      // 3. VÉRIFICATION TEMPORELLE ULTRA-STRICTE (plusieurs méthodes combinées)
      console.log('3. Vérification temporelle renforcée...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      // Méthode A: Vérifier par contact (email ou téléphone) - PRIORITÉ ABSOLUE
      console.log('3A. Vérification par contact...');
      const { data: recentContactReservations, error: contactError } = await supabase
        .from('reservations')
        .select('created_at, tel, email, nom_client, ip_address, user_agent')
        .or(`tel.eq.${phone},email.eq.${email}`)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!contactError && recentContactReservations && recentContactReservations.length > 0) {
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

      // Méthode B: Vérifier par session/device - MÊME APPAREIL
      console.log('3B. Vérification par appareil/session...');
      const currentUserAgent = navigator.userAgent;

      // Vérifier les réservations récentes par session
      const { data: sessionReservations, error: sessionError } = await supabase
        .from('reservations')
        .select('created_at, ip_address, user_agent, tel, email')
        .eq('ip_address', sessionId)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!sessionError && sessionReservations && sessionReservations.length > 0) {
        const lastReservation = sessionReservations[0];
        const timeDiff = new Date().getTime() - new Date(lastReservation.created_at).getTime();
        const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        console.log('❌ BLOQUÉ - Même appareil détecté (session):', {
          sessionId,
          lastReservation: lastReservation.created_at,
          timeDiff: timeDiff / 1000 / 60,
          minutesLeft
        });
        
        return {
          canReserve: false,
          reason: `Même appareil détecté. Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
        };
      }

      // Méthode C: Vérifier par empreinte d'appareil (User-Agent + autres facteurs)
      console.log('3C. Vérification par empreinte d\'appareil...');
      const { data: userAgentReservations, error: uaError } = await supabase
        .from('reservations')
        .select('created_at, user_agent, tel, email')
        .not('user_agent', 'is', null)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!uaError && userAgentReservations && userAgentReservations.length > 0) {
        // Vérifier si un User-Agent très similaire existe
        const similarUA = userAgentReservations.find(res => {
          if (!res.user_agent) return false;
          
          // Comparaison stricte du User-Agent
          const similarity = calculateUserAgentSimilarity(currentUserAgent, res.user_agent);
          console.log('Comparaison User-Agent:', {
            current: currentUserAgent.slice(0, 100),
            stored: res.user_agent.slice(0, 100),
            similarity
          });
          
          return similarity > 0.9; // 90% de similarité minimum
        });

        if (similarUA) {
          const timeDiff = new Date().getTime() - new Date(similarUA.created_at).getTime();
          const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
          
          console.log('❌ BLOQUÉ - Appareil similaire détecté:', {
            currentUserAgent: currentUserAgent.slice(0, 100),
            similarUserAgent: similarUA.user_agent.slice(0, 100),
            lastReservation: similarUA.created_at,
            timeDiff: timeDiff / 1000 / 60,
            minutesLeft
          });
          
          return {
            canReserve: false,
            reason: `Appareil suspect détecté. Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
          };
        }
      }

      // Méthode D: Vérification par fréquence globale (protection anti-spam)
      console.log('3D. Vérification fréquence globale...');
      const { data: recentGlobalReservations, error: globalError } = await supabase
        .from('reservations')
        .select('created_at')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!globalError && recentGlobalReservations && recentGlobalReservations.length >= 5) {
        console.log('❌ BLOQUÉ - Trop de réservations récentes globalement:', recentGlobalReservations.length);
        return {
          canReserve: false,
          reason: 'Système temporairement surchargé. Veuillez réessayer dans quelques minutes.'
        };
      }

      console.log('✅ Toutes les vérifications de sécurité renforcées sont passées');
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

// Générer une empreinte d'appareil plus complexe
function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: screen.width,
    screenHeight: screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    memory: (navigator as any).deviceMemory || 0,
    cores: navigator.hardwareConcurrency || 0
  };
  
  return btoa(JSON.stringify(fingerprint)).slice(0, 64);
}

// Calculer la similarité entre deux User-Agents
function calculateUserAgentSimilarity(ua1: string, ua2: string): number {
  if (ua1 === ua2) return 1;
  
  // Extraire les parties importantes
  const parts1 = extractUserAgentParts(ua1);
  const parts2 = extractUserAgentParts(ua2);
  
  let score = 0;
  let total = 0;
  
  // Comparer navigateur (poids: 30%)
  if (parts1.browser === parts2.browser) score += 0.3;
  total += 0.3;
  
  // Comparer OS (poids: 30%)
  if (parts1.os === parts2.os) score += 0.3;
  total += 0.3;
  
  // Comparer type d'appareil (poids: 20%)
  if (parts1.device === parts2.device) score += 0.2;
  total += 0.2;
  
  // Similarité des chaînes brutes (poids: 20%)
  const rawSimilarity = calculateStringSimilarity(ua1, ua2);
  score += rawSimilarity * 0.2;
  total += 0.2;
  
  return score / total;
}

// Calculer la similarité entre deux chaînes
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const distance = matrix[len2][len1];
  return 1 - distance / Math.max(len1, len2);
}

// Extraire les parties importantes du User-Agent pour comparaison
function extractUserAgentParts(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Détecter le navigateur
  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari')) browser = 'safari';
  else if (ua.includes('edge')) browser = 'edge';
  
  // Détecter l'OS
  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'mac';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';
  
  // Détecter le type d'appareil
  let device = 'desktop';
  if (ua.includes('mobile')) device = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet';
  
  return { browser, os, device };
}
