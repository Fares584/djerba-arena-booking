
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReservationNotificationData {
  reservation: {
    id: number;
    nom_client: string;
    tel: string;
    email: string;
    terrain_id: number;
    date: string;
    heure: string;
    duree: number;
    statut: string;
  };
  terrain: Terrain;
}

export const useReservationNotification = () => {
  return useMutation({
    mutationFn: async ({ reservation, terrain }: ReservationNotificationData) => {
      const { data, error } = await supabase.functions.invoke('send-reservation-notification', {
        body: {
          reservation,
          terrain: {
            nom: terrain.nom,
            type: terrain.type
          }
        }
      });

      if (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
        throw new Error(`Erreur notification: ${error.message}`);
      }

      if (data?.error) {
        console.error('❌ Erreur dans la réponse:', data.error);
        throw new Error(`Erreur serveur: ${data.error}`);
      }

      return data;
    },
    onSuccess: (data) => {
      // Suppression du toast de succès - l'utilisateur n'a pas besoin de savoir si l'email a été envoyé
    },
    onError: (error) => {
      console.error('❌ Échec de l\'envoi de la notification:', error);
      // Suppression du toast d'erreur aussi - pas nécessaire d'informer l'utilisateur des problèmes d'email
      // On ne fait pas échouer la création de réservation si l'email échoue
    }
  });
};
