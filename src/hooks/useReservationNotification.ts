
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';

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
        console.error('Erreur lors de l\'envoi de la notification:', error);
        throw error;
      }

      console.log('✅ Notification envoyée avec succès');
      return data;
    },
    onError: (error) => {
      console.error('❌ Échec de l\'envoi de la notification:', error);
      // On ne fait pas échouer la création de réservation si l'email échoue
    }
  });
};
