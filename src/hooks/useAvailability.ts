import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { format, addDays } from 'date-fns';

export function useReservations(filters?: { 
  terrain_id?: number; 
  date?: string;
  statut?: string;
}) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('reservations').select('*');
        
        if (filters?.terrain_id) {
          query = query.eq('terrain_id', filters.terrain_id);
        }
        
        if (filters?.date) {
          query = query.eq('date', filters.date);
        }
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        const { data, error } = await query.order('date', { ascending: true }).order('heure', { ascending: true });
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }
        
        return data as Reservation[];
      } catch (error) {
        console.error("Error in useReservations hook:", error);
        throw error;
      }
    },
  });
}

// Hook pour vérifier la disponibilité - CORRIGÉ pour tenir compte UNIQUEMENT du jour de l'abonnement
export function useAvailability({ 
  terrainId, 
  date, 
  enabled = true 
}: { 
  terrainId?: number | null; 
  date?: string; 
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['availability', terrainId, date],
    queryFn: async () => {
      if (!terrainId || !date) return [];
      
      try {
        console.log('🔍 Vérification disponibilité pour:', { terrainId, date });
        
        // Récupérer toutes les réservations actives pour ce terrain et cette date
        const { data: reservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('*')
          .eq('terrain_id', terrainId)
          .eq('date', date)
          .in('statut', ['en_attente', 'confirmee']);
        
        if (reservationsError) {
          console.error("Error fetching reservations:", reservationsError);
          throw reservationsError;
        }
        
        console.log('📅 Réservations réelles pour cette date:', reservations);

        // Calculer le jour de la semaine de la date sélectionnée
        const targetDate = new Date(date + 'T00:00:00');
        const dayOfWeek = targetDate.getDay(); // 0=Dimanche, 1=Lundi, etc.
        
        console.log('📅 Date sélectionnée:', date);
        console.log('📅 Jour de la semaine calculé:', dayOfWeek, '(0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi)');
        
        // Récupérer les abonnements actifs pour ce terrain ET ce jour de semaine spécifique
        const { data: abonnements, error: abonnementsError } = await supabase
          .from('abonnements')
          .select('*')
          .eq('terrain_id', terrainId)
          .eq('jour_semaine', dayOfWeek)  // CRUCIAL: Filtrer par le jour exact
          .eq('statut', 'actif')
          .lte('date_debut', date)
          .gte('date_fin', date);
        
        if (abonnementsError) {
          console.error("Error fetching abonnements:", abonnementsError);
          throw abonnementsError;
        }

        console.log('🔄 Abonnements trouvés pour ce terrain, ce jour et cette période:', abonnements);

        // Créer des réservations virtuelles SEULEMENT pour les abonnements du jour exact
        const virtualReservations: Reservation[] = [];
        
        if (abonnements && abonnements.length > 0) {
          abonnements.forEach(abonnement => {
            if (abonnement.heure_fixe && abonnement.duree_seance) {
              console.log('➕ Création réservation virtuelle pour abonnement:', {
                id: abonnement.id,
                client: abonnement.client_nom,
                jour_abonnement: abonnement.jour_semaine,
                jour_recherche: dayOfWeek,
                heure: abonnement.heure_fixe,
                duree: abonnement.duree_seance,
                date_debut: abonnement.date_debut,
                date_fin: abonnement.date_fin,
                date_cible: date
              });
              
              virtualReservations.push({
                id: -abonnement.id, // ID négatif pour distinguer des vraies réservations
                nom_client: abonnement.client_nom,
                tel: abonnement.client_tel,
                email: abonnement.client_email,
                terrain_id: terrainId,
                date: date,
                heure: abonnement.heure_fixe,
                duree: abonnement.duree_seance,
                statut: 'confirmee',
                abonnement_id: abonnement.id
              } as Reservation);
            }
          });
        } else {
          console.log('✅ Aucun abonnement trouvé pour ce jour de semaine:', dayOfWeek);
        }

        // Combiner les réservations réelles et virtuelles
        const allReservations = [...(reservations || []), ...virtualReservations];
        
        console.log('📋 Total réservations (réelles + virtuelles):', allReservations.length);
        console.log('📋 Détail des réservations:', allReservations.map(r => ({
          id: r.id,
          client: r.nom_client,
          heure: r.heure,
          duree: r.duree,
          type: r.abonnement_id ? 'abonnement' : 'normale'
        })));
        
        return allReservations;
      } catch (error) {
        console.error("Error in useAvailability hook:", error);
        throw error;
      }
    },
    enabled: enabled && !!terrainId && !!date,
  });
}

// Check if a specific time slot is available - garde la logique existante pour la disponibilité
export function isTimeSlotAvailable(
  reservations: Reservation[] | undefined,
  terrainId: number,
  date: string,
  startTime: string,
  duration: number
): boolean {
  if (!reservations) return true;
  
  // Seules les réservations confirmées et en attente bloquent la disponibilité
  const activeReservations = reservations.filter(
    r => r.terrain_id === terrainId && 
         r.date === date && 
         (r.statut === 'en_attente' || r.statut === 'confirmee')
  );
  
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = startHour + duration;
  
  for (const reservation of activeReservations) {
    const reservationStartHour = parseInt(reservation.heure.split(':')[0]);
    const reservationEndHour = reservationStartHour + reservation.duree;
    
    // Check for overlap
    if (
      (startHour >= reservationStartHour && startHour < reservationEndHour) ||
      (endHour > reservationStartHour && endHour <= reservationEndHour) ||
      (startHour <= reservationStartHour && endHour >= reservationEndHour)
    ) {
      return false; // Time slot is occupied
    }
  }
  
  return true; // Time slot is available
}

// Get dates that are completely unavailable for a specific terrain
export function getUnavailableDates(
  reservations: Reservation[] | undefined,
  terrainId: number
): string[] {
  if (!reservations) return [];
  
  const unavailableDates: string[] = [];
  const dateReservations: { [key: string]: Reservation[] } = {};
  
  // Group active reservations by date (only 'en_attente' and 'confirmee')
  reservations
    .filter(r => r.terrain_id === terrainId && (r.statut === 'en_attente' || r.statut === 'confirmee'))
    .forEach(reservation => {
      if (!dateReservations[reservation.date]) {
        dateReservations[reservation.date] = [];
      }
      dateReservations[reservation.date].push(reservation);
    });
  
  // Check each date to see if all time slots are occupied
  Object.keys(dateReservations).forEach(date => {
    const dayReservations = dateReservations[date];
    
    // Sort reservations by start time
    dayReservations.sort((a, b) => a.heure.localeCompare(b.heure));
    
    // Check if the entire day (09:00-22:00) is covered by reservations
    let currentHour = 9; // Start at 9 AM
    const endHour = 22; // End at 10 PM
    
    for (const reservation of dayReservations) {
      const reservationStartHour = parseInt(reservation.heure.split(':')[0]);
      const reservationEndHour = reservationStartHour + reservation.duree;
      
      if (reservationStartHour <= currentHour && reservationEndHour > currentHour) {
        currentHour = Math.max(currentHour, reservationEndHour);
      } else if (reservationStartHour > currentHour) {
        // There's a gap, so the day is not fully booked
        break;
      }
    }
    
    // If we've covered the entire day
    if (currentHour >= endHour) {
      unavailableDates.push(date);
    }
  });
  
  return unavailableDates;
}
