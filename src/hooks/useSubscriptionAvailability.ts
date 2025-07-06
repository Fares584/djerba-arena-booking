
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Abonnement } from '@/lib/supabase';

export function useSubscriptionAvailability({
  terrainId,
  targetDate,
  enabled = true
}: {
  terrainId?: number | null;
  targetDate?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['subscription-availability', terrainId, targetDate],
    queryFn: async () => {
      if (!terrainId || !targetDate) return [];
      
      console.log('🔍 Vérification disponibilité abonnements pour:', { terrainId, targetDate });
      
      // Calculer le jour de la semaine de la date cible
      const targetDateObj = new Date(targetDate + 'T00:00:00');
      const dayOfWeek = targetDateObj.getDay();
      
      console.log('📅 Date cible:', targetDate, 'Jour de semaine:', dayOfWeek);
      
      // Récupérer TOUS les abonnements actifs pour ce terrain
      const { data: allAbonnements, error } = await supabase
        .from('abonnements')
        .select('*')
        .eq('terrain_id', terrainId)
        .eq('statut', 'actif');
      
      if (error) {
        console.error("Erreur récupération abonnements:", error);
        throw error;
      }
      
      console.log('📋 Tous les abonnements actifs:', allAbonnements);
      
      // Filtrer côté client pour plus de contrôle
      const relevantAbonnements = allAbonnements?.filter(abonnement => {
        // Vérifier le jour de la semaine
        if (abonnement.jour_semaine !== dayOfWeek) {
          console.log(`❌ Abonnement ${abonnement.id} ignoré - mauvais jour (${abonnement.jour_semaine} ≠ ${dayOfWeek})`);
          return false;
        }
        
        // Vérifier la période de validité de l'abonnement
        const dateDebut = new Date(abonnement.date_debut);
        const dateFin = new Date(abonnement.date_fin);
        
        if (targetDateObj < dateDebut || targetDateObj > dateFin) {
          console.log(`❌ Abonnement ${abonnement.id} ignoré - hors période (${targetDate} pas entre ${abonnement.date_debut} et ${abonnement.date_fin})`);
          return false;
        }
        
        console.log(`✅ Abonnement ${abonnement.id} VALIDE pour ${targetDate}`);
        return true;
      }) || [];
      
      console.log('🎯 Abonnements pertinents pour cette date:', relevantAbonnements);
      
      return relevantAbonnements;
    },
    enabled: enabled && !!terrainId && !!targetDate,
  });
}

// Hook pour vérifier si un créneau spécifique est bloqué par un abonnement
export function useTimeSlotSubscriptionCheck({
  terrainId,
  targetDate,
  timeSlot,
  enabled = true
}: {
  terrainId?: number | null;
  targetDate?: string;
  timeSlot?: string;
  enabled?: boolean;
}) {
  const { data: relevantAbonnements } = useSubscriptionAvailability({
    terrainId,
    targetDate,
    enabled
  });
  
  const isBlockedBySubscription = relevantAbonnements?.some(
    abonnement => abonnement.heure_fixe === timeSlot
  ) || false;
  
  return {
    isBlockedBySubscription,
    blockingSubscription: relevantAbonnements?.find(
      abonnement => abonnement.heure_fixe === timeSlot
    )
  };
}
