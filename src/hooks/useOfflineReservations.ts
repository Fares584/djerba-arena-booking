
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOfflineStorage } from './useOfflineStorage';
import { useReservations } from './useReservations';
import { Reservation } from '@/lib/supabase';
import { toast } from 'sonner';

export function useOfflineReservations() {
  const { isOnline, addPendingItem, saveToLocalStorage, getFromLocalStorage } = useOfflineStorage();
  const queryClient = useQueryClient();
  
  // Hook pour les réservations avec support hors ligne
  const {
    data: onlineReservations,
    isLoading: isLoadingOnline,
    error: onlineError
  } = useReservations();

  // Données locales pour mode hors ligne
  const localReservations = getFromLocalStorage('reservations');

  const data = isOnline ? onlineReservations : localReservations;
  const isLoading = isOnline ? isLoadingOnline : false;
  const error = isOnline ? onlineError : null;

  // Sauvegarder les données en ligne dans le stockage local
  if (isOnline && onlineReservations) {
    saveToLocalStorage('reservations', onlineReservations);
  }

  // Mutation pour créer une réservation hors ligne
  const createOfflineReservation = useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      if (isOnline) {
        // Si en ligne, utiliser la méthode normale
        throw new Error('Utiliser la méthode en ligne');
      }

      // Créer un ID temporaire pour le mode hors ligne
      const tempReservation = {
        ...newReservation,
        id: Date.now(), // ID temporaire
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        statut: 'en_attente' as const
      };

      // Ajouter à la liste locale
      const currentLocal = getFromLocalStorage('reservations') || [];
      const updatedLocal = [...currentLocal, tempReservation];
      saveToLocalStorage('reservations', updatedLocal);

      // Ajouter à la queue de synchronisation
      addPendingItem('reservation', newReservation, 'create');

      return tempReservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Réservation sauvegardée localement. Elle sera synchronisée dès que la connexion sera rétablie.');
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde locale:', error);
      toast.error('Erreur lors de la sauvegarde locale de la réservation');
    },
  });

  return {
    data,
    isLoading,
    error,
    createOfflineReservation,
    isOnline
  };
}
