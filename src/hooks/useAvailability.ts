

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

// Hook pour vérifier la disponibilité - CORRIGÉ pour tenir compte du jour de l'abonnement
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
        
        console.log('📅 Réservations pour cette date:', reservations);

        // Récupérer les abonnements actifs pour ce terrain qui correspondent à ce jour de la semaine
        const targetDate = new Date(date + 'T00:00:00');
        const dayOfWeek = targetDate.getDay(); // 0=Dimanche, 1=Lundi, etc.
        
        console.log('📅 Jour de la semaine recherché:', dayOfWeek, '(0=Dimanche, 1=Lundi, etc.)');
        console.log('📅 Date ciblée:', date);
        
        // CORRECTION: Récupérer TOUS les abonnements actifs pour ce terrain d'abord
        const { data: allAbonnements, error: abonnementsError } = await supabase
          .from('abonnements')
          .select('*')
          .eq('terrain_id', terrainId)
          .eq('statut', 'actif');
        
        if (abonnementsError) {
          console.error("Error fetching abonnements:", abonnementsError);
          throw abonnementsError;
        }

        console.log('🔄 Tous les abonnements actifs pour ce terrain:', allAbonnements);

        // Filtrer les abonnements par jour de semaine ET par période de validité
        const validAbonnements = allAbonnements?.filter(abonnement => {
          const matchesDay = abonnement.jour_semaine === dayOfWeek;
          const isInDateRange = date >= abonnement.date_debut && date <= abonnement.date_fin;
          
          console.log(`📊 Abonnement ${abonnement.id} (${abonnement.client_nom}):`, {
            jour_semaine: abonnement.jour_semaine,
            dayOfWeek,
            matchesDay,
            date_debut: abonnement.date_debut,
            date_fin: abonnement.date_fin,
            date,
            isInDateRange,
            isValid: matchesDay && isInDateRange
          });
          
          return matchesDay && isInDateRange;
        }) || [];

        console.log('✅ Abonnements valides pour ce jour et cette période:', validAbonnements);

        // Créer des réservations virtuelles pour les abonnements valides uniquement
        const virtualReservations: Reservation[] = [];
        
        validAbonnements.forEach(abonnement => {
          if (abonnement.heure_fixe && abonnement.duree_seance) {
            console.log('➕ Ajout réservation virtuelle abonnement:', {
              id: abonnement.id,
              client: abonnement.client_nom,
              jour: dayOfWeek,
              heure: abonnement.heure_fixe,
              duree: abonnement.duree_seance,
              date_debut: abonnement.date_debut,
              date_fin: abonnement.date_fin
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
