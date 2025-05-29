
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface ReservationSlot {
  date: string;
  heure: string;
  duree: number;
  terrain_id: number;
}

export function useReservations(filters?: { 
  terrain_id?: number; 
  date?: string;
}) {
  return useQuery({
    queryKey: ['reservations-availability', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('reservations')
          .select('date, heure, duree, terrain_id')
          .eq('statut', 'confirmee'); // Only confirmed reservations
        
        if (filters?.terrain_id) {
          query = query.eq('terrain_id', filters.terrain_id);
        }
        
        if (filters?.date) {
          query = query.eq('date', filters.date);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }
        
        return data as ReservationSlot[];
      } catch (error) {
        console.error("Error in useReservations hook:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// Helper function to check if a specific time slot is available
export function isTimeSlotAvailable(
  reservations: ReservationSlot[] | undefined,
  terrainId: number,
  date: string,
  time: string,
  duration: number
): boolean {
  if (!reservations) return true;
  
  const relevantReservations = reservations.filter(
    res => res.terrain_id === terrainId && res.date === date
  );
  
  const requestedStartTime = parseFloat(time.replace(':', '.'));
  const requestedEndTime = requestedStartTime + duration;
  
  for (const reservation of relevantReservations) {
    const existingStartTime = parseFloat(reservation.heure.replace(':', '.'));
    const existingEndTime = existingStartTime + reservation.duree;
    
    // Check for overlap
    if (
      (requestedStartTime >= existingStartTime && requestedStartTime < existingEndTime) ||
      (requestedEndTime > existingStartTime && requestedEndTime <= existingEndTime) ||
      (requestedStartTime <= existingStartTime && requestedEndTime >= existingEndTime)
    ) {
      return false;
    }
  }
  
  return true;
}

// Helper function to get unavailable dates for a terrain
export function getUnavailableDates(
  reservations: ReservationSlot[] | undefined,
  terrainId: number
): string[] {
  if (!reservations) return [];
  
  const unavailableDates: string[] = [];
  const dateReservations = reservations.filter(res => res.terrain_id === terrainId);
  
  // Group reservations by date
  const reservationsByDate = dateReservations.reduce((acc, res) => {
    if (!acc[res.date]) {
      acc[res.date] = [];
    }
    acc[res.date].push(res);
    return acc;
  }, {} as Record<string, ReservationSlot[]>);
  
  // Check if all time slots are taken for each date
  Object.entries(reservationsByDate).forEach(([date, dayReservations]) => {
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
    
    const availableSlots = timeSlots.filter(time => 
      isTimeSlotAvailable(dayReservations, terrainId, date, time, 1)
    );
    
    if (availableSlots.length === 0) {
      unavailableDates.push(date);
    }
  });
  
  return unavailableDates;
}
