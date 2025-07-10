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
        let query = supabase.from('reservations').select(`
          *,
          abonnements!fk_abonnement (
            id,
            statut
          )
        `);
        
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
        
        // Filtrer les réservations des abonnements expirés
        const filteredData = data?.filter(reservation => {
          // Si c'est une réservation d'abonnement, vérifier que l'abonnement n'est pas expiré
          if (reservation.abonnement_id && reservation.abonnements) {
            return reservation.abonnements.statut === 'actif';
          }
          // Garder les réservations ponctuelles
          return true;
        }) || [];
        
        return filteredData as Reservation[];
      } catch (error) {
        console.error("Error in useReservations hook:", error);
        throw error;
      }
    },
  });
}

// New hook for availability checking - this is what Reservation.tsx is trying to import
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
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            abonnements!fk_abonnement (
              id,
              statut
            )
          `)
          .eq('terrain_id', terrainId)
          .eq('date', date)
          .in('statut', ['en_attente', 'confirmee']);
        
        if (error) {
          console.error("Error fetching availability:", error);
          throw error;
        }
        
        // Filtrer les réservations des abonnements expirés
        const filteredData = data?.filter(reservation => {
          // Si c'est une réservation d'abonnement, vérifier que l'abonnement n'est pas expiré
          if (reservation.abonnement_id && reservation.abonnements) {
            return reservation.abonnements.statut === 'actif';
          }
          // Garder les réservations ponctuelles
          return true;
        }) || [];
        
        return filteredData as Reservation[];
      } catch (error) {
        console.error("Error in useAvailability hook:", error);
        throw error;
      }
    },
    enabled: enabled && !!terrainId && !!date,
  });
}

// Check if a specific time slot is available - avec filtrage des abonnements expirés
export function isTimeSlotAvailable(
  reservations: Reservation[] | undefined,
  terrainId: number,
  date: string,
  startTime: string,
  duration: number
): boolean {
  if (!reservations) return true;
  
  // Filtrer les réservations actives (en excluant celles des abonnements expirés)
  const activeReservations = reservations.filter(
    r => r.terrain_id === terrainId && 
         r.date === date && 
         (r.statut === 'en_attente' || r.statut === 'confirmee') &&
         // Exclure les réservations d'abonnements expirés
         (!r.abonnement_id || (r.abonnements && r.abonnements.statut === 'actif'))
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

// Get dates that are completely unavailable for a specific terrain - avec filtrage des abonnements expirés
export function getUnavailableDates(
  reservations: Reservation[] | undefined,
  terrainId: number
): string[] {
  if (!reservations) return [];
  
  const unavailableDates: string[] = [];
  const dateReservations: { [key: string]: Reservation[] } = {};
  
  // Group active reservations by date (only 'en_attente' and 'confirmee', excluding expired subscriptions)
  reservations
    .filter(r => r.terrain_id === terrainId && 
                (r.statut === 'en_attente' || r.statut === 'confirmee') &&
                (!r.abonnement_id || (r.abonnements && r.abonnements.statut === 'actif'))
           )
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
