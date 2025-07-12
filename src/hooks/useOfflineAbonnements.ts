
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOfflineStorage } from './useOfflineStorage';
import { useAbonnements } from './useAbonnements';
import { Abonnement } from '@/lib/supabase';
import { toast } from 'sonner';

export function useOfflineAbonnements() {
  const { isOnline, addPendingItem, saveToLocalStorage, getFromLocalStorage } = useOfflineStorage();
  const queryClient = useQueryClient();
  
  // Hook pour les abonnements avec support hors ligne
  const {
    data: onlineAbonnements,
    isLoading: isLoadingOnline,
    error: onlineError
  } = useAbonnements();

  // Données locales pour mode hors ligne
  const localAbonnements = getFromLocalStorage('abonnements');

  const data = isOnline ? onlineAbonnements : localAbonnements;
  const isLoading = isOnline ? isLoadingOnline : false;
  const error = isOnline ? onlineError : null;

  // Sauvegarder les données en ligne dans le stockage local
  if (isOnline && onlineAbonnements) {
    saveToLocalStorage('abonnements', onlineAbonnements);
  }

  // Mutation pour créer un abonnement hors ligne
  const createOfflineAbonnement = useMutation({
    mutationFn: async (newAbonnement: Omit<Abonnement, 'id' | 'created_at' | 'updated_at'>) => {
      if (isOnline) {
        // Si en ligne, utiliser la méthode normale
        throw new Error('Utiliser la méthode en ligne');
      }

      // Créer un ID temporaire pour le mode hors ligne
      const tempAbonnement = {
        ...newAbonnement,
        id: Date.now(), // ID temporaire
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ajouter à la liste locale
      const currentLocal = getFromLocalStorage('abonnements') || [];
      const updatedLocal = [...currentLocal, tempAbonnement];
      saveToLocalStorage('abonnements', updatedLocal);

      // Ajouter à la queue de synchronisation
      addPendingItem('abonnement', newAbonnement, 'create');

      return tempAbonnement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      toast.success('Abonnement sauvegardé localement. Il sera synchronisé dès que la connexion sera rétablie.');
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde locale:', error);
      toast.error('Erreur lors de la sauvegarde locale de l\'abonnement');
    },
  });

  return {
    data,
    isLoading,
    error,
    createOfflineAbonnement,
    isOnline
  };
}
