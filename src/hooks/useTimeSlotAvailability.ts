
import { useRealReservations } from './useAvailability';
import { useTimeSlotSubscriptionCheck } from './useSubscriptionAvailability';

export function useTimeSlotAvailability({
  terrainId,
  date,
  timeSlot,
  duration = 1,
  enabled = true
}: {
  terrainId?: number | null;
  date?: string;
  timeSlot?: string;
  duration?: number;
  enabled?: boolean;
}) {
  // Récupérer les vraies réservations
  const { data: realReservations, isLoading: reservationsLoading } = useRealReservations({
    terrainId,
    date,
    enabled
  });
  
  // Vérifier les abonnements
  const { isBlockedBySubscription, blockingSubscription } = useTimeSlotSubscriptionCheck({
    terrainId,
    targetDate: date,
    timeSlot,
    enabled
  });
  
  const isLoading = reservationsLoading;
  
  if (!terrainId || !date || !timeSlot || isLoading) {
    return {
      isAvailable: false,
      isLoading,
      blockingReason: 'Chargement...',
      blockingSubscription: null
    };
  }
  
  // Vérifier si bloqué par un abonnement
  if (isBlockedBySubscription) {
    console.log('❌ Créneau bloqué par abonnement:', blockingSubscription);
    return {
      isAvailable: false,
      isLoading: false,
      blockingReason: `Occupé par l'abonnement de ${blockingSubscription?.client_nom}`,
      blockingSubscription
    };
  }
  
  // Vérifier si bloqué par une vraie réservation
  const startHour = parseInt(timeSlot.split(':')[0]);
  const endHour = startHour + duration;
  
  const conflictingReservation = realReservations?.find(reservation => {
    const reservationStartHour = parseInt(reservation.heure.split(':')[0]);
    const reservationEndHour = reservationStartHour + reservation.duree;
    
    return (
      (startHour >= reservationStartHour && startHour < reservationEndHour) ||
      (endHour > reservationStartHour && endHour <= reservationEndHour) ||
      (startHour <= reservationStartHour && endHour >= reservationEndHour)
    );
  });
  
  if (conflictingReservation) {
    console.log('❌ Créneau bloqué par réservation:', conflictingReservation);
    return {
      isAvailable: false,
      isLoading: false,
      blockingReason: `Occupé par la réservation de ${conflictingReservation.nom_client}`,
      blockingSubscription: null
    };
  }
  
  console.log('✅ Créneau disponible pour:', { terrainId, date, timeSlot });
  return {
    isAvailable: true,
    isLoading: false,
    blockingReason: null,
    blockingSubscription: null
  };
}
