
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
      console.log('📧 Envoi de notification email pour réservation:', reservation.id);
      console.log('📧 Données à envoyer:', { reservation, terrain });
      
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

      console.log('✅ Notification envoyée avec succès:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Hook: Notification envoyée avec succès');
      if (data?.emailId) {
        toast.success('📧 Email de notification envoyé !');
      }
    },
    onError: (error) => {
      console.error('❌ Échec de l\'envoi de la notification:', error);
      toast.error(`❌ Erreur email: ${error.message}`);
      // On ne fait pas échouer la création de réservation si l'email échoue
    }
  });
};
