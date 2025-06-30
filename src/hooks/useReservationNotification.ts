
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
      console.log('📧 Envoi de notification email et push pour réservation:', reservation.id);
      console.log('📧 Données à envoyer:', { reservation, terrain });
      
      // Envoi de l'email
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-reservation-notification', {
        body: {
          reservation,
          terrain: {
            nom: terrain.nom,
            type: terrain.type
          }
        }
      });

      if (emailError) {
        console.error('❌ Erreur lors de l\'envoi de la notification email:', emailError);
      } else {
        console.log('✅ Email envoyé avec succès:', emailData);
      }

      // Envoi de la notification push
      const dateFormatted = new Date(reservation.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      const { data: pushData, error: pushError } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '🏟️ Nouvelle Réservation',
          body: `${reservation.nom_client} - ${terrain.nom} le ${dateFormatted} à ${reservation.heure}`,
          data: {
            reservationId: reservation.id,
            terrainId: reservation.terrain_id,
            url: '/admin/reservations'
          }
        }
      });

      if (pushError) {
        console.error('❌ Erreur lors de l\'envoi de la notification push:', pushError);
      } else {
        console.log('✅ Notification push envoyée avec succès:', pushData);
      }

      // Retourner un succès même si une des notifications échoue
      return { 
        emailSuccess: !emailError,
        pushSuccess: !pushError,
        emailData,
        pushData
      };
    },
    onSuccess: (data) => {
      console.log('✅ Hook: Notifications envoyées');
      if (data.emailSuccess) {
        console.log('✅ Email envoyé avec succès');
      }
      if (data.pushSuccess) {
        console.log('✅ Notification push envoyée avec succès');
      }
      // Suppression du toast de succès - l'utilisateur n'a pas besoin de savoir si l'email a été envoyé
    },
    onError: (error) => {
      console.error('❌ Échec de l\'envoi des notifications:', error);
      // Suppression du toast d'erreur aussi - pas nécessaire d'informer l'utilisateur des problèmes d'email
      // On ne fait pas échouer la création de réservation si l'email échoue
    }
  });
};
