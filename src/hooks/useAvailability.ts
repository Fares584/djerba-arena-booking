
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';

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

// Hook simplifié pour récupérer SEULEMENT les vraies réservations
export function useRealReservations({ 
  terrainId, 
  date, 
  enabled = true 
}: { 
  terrainId?: number | null; 
  date?: string; 
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['real-reservations', terrainId, date],
    queryFn: async () => {
      if (!terrainId || !date) return [];
      
      console.log('🔍 Récupération réservations réelles pour:', { terrainId, date });
      
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('terrain_id', terrainId)
        .eq('date', date)
        .in('statut', ['en_attente', 'confirmee']);
      
      if (error) {
        console.error("Erreur récupération réservations:", error);
        throw error;
      }
      
      console.log('📅 Réservations réelles trouvées:', reservations);
      return reservations || [];
    },
    enabled: enabled && !!terrainId && !!date,
  });
}

// Fonction pour vérifier si un créneau est disponible (logique séparée et claire)
export function isTimeSlotAvailable(
  realReservations: Reservation[] | undefined,
  terrainId: number,
  date: string,
  startTime: string,
  duration: number
): boolean {
  if (!realReservations) return true;
  
  console.log('🕒 Vérification disponibilité créneau:', {
    terrainId,
    date,
    startTime,
    duration,
    reservationsCount: realReservations.length
  });
  
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = startHour + duration;
  
  for (const reservation of realReservations) {
    const reservationStartHour = parseInt(reservation.heure.split(':')[0]);
    const reservationEndHour = reservationStartHour + reservation.duree;
    
    // Vérifier chevauchement
    const hasOverlap = (
      (startHour >= reservationStartHour && startHour < reservationEndHour) ||
      (endHour > reservationStartHour && endHour <= reservationEndHour) ||
      (startHour <= reservationStartHour && endHour >= reservationEndHour)
    );
    
    if (hasOverlap) {
      console.log('❌ Créneau occupé par réservation:', reservation);
      return false;
    }
  }
  
  console.log('✅ Créneau disponible');
  return true;
}

// Fonction pour obtenir les dates complètement indisponibles
export function getUnavailableDates(
  reservations: Reservation[] | undefined,
  terrainId: number
): string[] {
  if (!reservations) return [];
  
  const unavailableDates: string[] = [];
  const dateReservations: { [key: string]: Reservation[] } = {};
  
  // Grouper les réservations actives par date
  reservations
    .filter(r => r.terrain_id === terrainId && (r.statut === 'en_attente' || r.statut === 'confirmee'))
    .forEach(reservation => {
      if (!dateReservations[reservation.date]) {
        dateReservations[reservation.date] = [];
      }
      dateReservations[reservation.date].push(reservation);
    });
  
  // Vérifier chaque date pour voir si tous les créneaux sont occupés
  Object.keys(dateReservations).forEach(date => {
    const dayReservations = dateReservations[date];
    
    // Trier les réservations par heure de début
    dayReservations.sort((a, b) => a.heure.localeCompare(b.heure));
    
    // Vérifier si toute la journée (09:00-22:00) est couverte
    let currentHour = 9;
    const endHour = 22;
    
    for (const reservation of dayReservations) {
      const reservationStartHour = parseInt(reservation.heure.split(':')[0]);
      const reservationEndHour = reservationStartHour + reservation.duree;
      
      if (reservationStartHour <= currentHour && reservationEndHour > currentHour) {
        currentHour = Math.max(currentHour, reservationEndHour);
      } else if (reservationStartHour > currentHour) {
        break;
      }
    }
    
    if (currentHour >= endHour) {
      unavailableDates.push(date);
    }
  });
  
  return unavailableDates;
}
