
import { useMutation } from '@tanstack/react-query';
import { useEmailJS } from './useEmailJS';

interface EmailConfirmationData {
  reservation_id: number;
  email: string;
  nom_client: string;
  terrain_nom: string;
  date: string;
  heure: string;
  duree: number;
  confirmation_token: string;
}

export function useEmailConfirmation() {
  const emailJS = useEmailJS();

  return useMutation({
    mutationFn: async (data: EmailConfirmationData) => {
      console.log('Tentative d\'envoi d\'email avec EmailJS:', data);
      
      try {
        // Créer le lien de confirmation
        const confirmationLink = `${window.location.origin}/confirm-reservation?token=${data.confirmation_token}`;
        
        // Préparer les données pour EmailJS
        const emailData = {
          to_email: data.email,
          client_name: data.nom_client,
          terrain_name: data.terrain_nom,
          date: data.date,
          heure: data.heure,
          duree: data.duree,
          confirmation_link: confirmationLink
        };

        // Envoyer via EmailJS
        const result = await emailJS.mutateAsync(emailData);
        return result;
      } catch (error) {
        console.error('Erreur complète lors de l\'envoi de l\'email:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('Email de confirmation envoyé avec succès:', result);
    },
    onError: (error) => {
      console.error('Erreur dans useEmailConfirmation:', error);
    }
  });
}
