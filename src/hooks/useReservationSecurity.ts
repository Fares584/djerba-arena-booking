
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

      // 2. VÉRIFICATION RENFORCÉE : Limite quotidienne par empreinte d'appareil
      console.log('2. Vérification de la limite quotidienne par empreinte d\'appareil...');
      const deviceFingerprint = generateAdvancedDeviceFingerprint();
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      // Vérifier TOUTES les méthodes d'identification d'appareil
      const sessionId = getOrCreateSessionId();
      const currentUserAgent = navigator.userAgent;

      console.log('Identifiants de l\'appareil:', {
        sessionId: sessionId.slice(0, 20) + '...',
        fingerprint: deviceFingerprint.slice(0, 20) + '...',
        userAgent: currentUserAgent.slice(0, 50) + '...'
      });

      // Recherche combinée par plusieurs critères d'identification
      const { data: dailyDeviceReservations, error: dailyError } = await supabase
        .from('reservations')
        .select('id, created_at, ip_address, user_agent, nom_client, tel, email')
        .or(`ip_address.eq.${sessionId},user_agent.eq.${currentUserAgent}`)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (dailyError) {
        console.error('Erreur lors de la vérification quotidienne:', dailyError);
      }

      // Compter les réservations uniques (éviter les doublons)
      const uniqueReservations = new Set();
      let totalReservationsToday = 0;

      if (dailyDeviceReservations) {
        dailyDeviceReservations.forEach(res => {
          const key = `${res.tel}-${res.email}-${res.created_at}`;
          if (!uniqueReservations.has(key)) {
            uniqueReservations.add(key);
            totalReservationsToday++;
          }
        });
      }

      // Vérification supplémentaire par similarité User-Agent (protection contre changement d'onglet)
      const { data: allTodayReservations, error: allTodayError } = await supabase
        .from('reservations')
        .select('user_agent, created_at, tel, email')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .not('user_agent', 'is', null);

      if (!allTodayError && allTodayReservations) {
        allTodayReservations.forEach(res => {
          if (res.user_agent && calculateUserAgentSimilarity(currentUserAgent, res.user_agent) > 0.95) {
            const key = `${res.tel}-${res.email}-${res.created_at}`;
            if (!uniqueReservations.has(key)) {
              uniqueReservations.add(key);
              totalReservationsToday++;
            }
          }
        });
      }

      console.log(`Réservations détectées aujourd'hui: ${totalReservationsToday}/2`);

      if (totalReservationsToday >= 2) {
        console.log('❌ BLOQUÉ - Limite quotidienne par appareil atteinte:', {
          totalReservationsToday,
          deviceFingerprint: deviceFingerprint.slice(0, 20) + '...',
          sessionId: sessionId.slice(0, 20) + '...'
        });
        
        return {
          canReserve: false,
          reason: `Limite quotidienne atteinte : maximum 2 réservations par appareil par jour. Vous avez déjà fait ${totalReservationsToday} réservation(s) aujourd'hui.`
        };
      } else {
        console.log(`✅ Limite quotidienne OK: ${totalReservationsToday}/2 réservations aujourd'hui`);
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

      // Méthode B: Vérification renforcée par empreinte d'appareil (tous onglets confondus)
      console.log('3B. Vérification par empreinte d\'appareil renforcée...');

      // Vérifier les réservations récentes par plusieurs critères
      const { data: recentDeviceReservations, error: deviceError } = await supabase
        .from('reservations')
        .select('created_at, ip_address, user_agent, tel, email')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!deviceError && recentDeviceReservations && recentDeviceReservations.length > 0) {
        // Vérifier par session ID exacte
        const exactSessionMatch = recentDeviceReservations.find(res => res.ip_address === sessionId);
        
        // Vérifier par User-Agent exact
        const exactUserAgentMatch = recentDeviceReservations.find(res => res.user_agent === currentUserAgent);
        
        // Vérifier par similarité User-Agent très élevée (même appareil, possiblement autre onglet)
        const similarUserAgentMatch = recentDeviceReservations.find(res => {
          if (!res.user_agent) return false;
          return calculateUserAgentSimilarity(currentUserAgent, res.user_agent) > 0.98;
        });

        const suspiciousReservation = exactSessionMatch || exactUserAgentMatch || similarUserAgentMatch;

        if (suspiciousReservation) {
          const timeDiff = new Date().getTime() - new Date(suspiciousReservation.created_at).getTime();
          const minutesLeft = Math.ceil((5 * 60 * 1000 - timeDiff) / (60 * 1000));
          
          console.log('❌ BLOQUÉ - Même appareil détecté (multi-onglets):', {
            matchType: exactSessionMatch ? 'session' : exactUserAgentMatch ? 'userAgent' : 'similar',
            lastReservation: suspiciousReservation.created_at,
            timeDiff: timeDiff / 1000 / 60,
            minutesLeft
          });
          
          return {
            canReserve: false,
            reason: `Même appareil détecté. Veuillez attendre ${minutesLeft} minute(s) avant de faire une nouvelle réservation.`
          };
        }
      }

      // Méthode C: Vérification par fréquence globale (protection anti-spam)
      console.log('3C. Vérification fréquence globale...');
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

// Générer une empreinte d'appareil plus complexe et stable
function generateAdvancedDeviceFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasFingerprint = '';
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test', 2, 2);
      canvasFingerprint = canvas.toDataURL();
    }
    
    // Collecter plus d'informations pour une empreinte unique
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(',') || '',
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint.slice(0, 100), // Limiter la taille
      memory: (navigator as any).deviceMemory || 0,
      cores: navigator.hardwareConcurrency || 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || '',
      pixelRatio: window.devicePixelRatio || 1
    };
    
    return btoa(JSON.stringify(fingerprint)).slice(0, 64);
  } catch (error) {
    console.warn('Erreur lors de la génération de l\'empreinte:', error);
    // Fallback simple
    return btoa(`${navigator.userAgent}-${screen.width}x${screen.height}-${Date.now()}`).slice(0, 64);
  }
}

// Calculer la similarité entre deux User-Agents (version améliorée)
function calculateUserAgentSimilarity(ua1: string, ua2: string): number {
  if (ua1 === ua2) return 1;
  if (!ua1 || !ua2) return 0;
  
  // Comparaison par segments importants
  const segments1 = ua1.split(/[\s\/\(\)]+/);
  const segments2 = ua2.split(/[\s\/\(\)]+/);
  
  let matches = 0;
  const totalSegments = Math.max(segments1.length, segments2.length);
  
  segments1.forEach(segment => {
    if (segment.length > 2 && segments2.includes(segment)) {
      matches++;
    }
  });
  
  const segmentSimilarity = matches / totalSegments;
  
  // Comparaison par distance de Levenshtein pour affiner
  const levenshteinSimilarity = calculateStringSimilarity(ua1, ua2);
  
  // Moyenne pondérée (priorité aux segments)
  return (segmentSimilarity * 0.7) + (levenshteinSimilarity * 0.3);
}

// Calculer la similarité entre deux chaînes avec l'algorithme de Levenshtein
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
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
