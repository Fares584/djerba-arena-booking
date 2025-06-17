
import { useMutation } from '@tanstack/react-query';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

interface EmailJSData {
  to_email: string;
  client_name: string;
  terrain_name: string;
  date: string;
  heure: string;
  duree: number;
  confirmation_link: string;
}

export function useEmailJS() {
  return useMutation({
    mutationFn: async (data: EmailJSData) => {
      console.log('Envoi d\'email avec EmailJS:', data);
      
      try {
        // Configuration EmailJS - ces valeurs devront être configurées
        const serviceId = 'YOUR_SERVICE_ID';
        const templateId = 'YOUR_TEMPLATE_ID';
        const publicKey = 'YOUR_PUBLIC_KEY';

        const templateParams = {
          to_email: data.to_email,
          client_name: data.client_name,
          terrain_name: data.terrain_name,
          date: new Date(data.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          heure: data.heure,
          duree: data.duree,
          confirmation_link: data.confirmation_link,
          subject: '🏟️ Confirmez votre réservation - Sport Center'
        };

        console.log('Paramètres du template EmailJS:', templateParams);

        const result = await emailjs.send(
          serviceId,
          templateId,
          templateParams,
          publicKey
        );

        console.log('Email envoyé avec succès via EmailJS:', result);
        return { success: true, result };
      } catch (error) {
        console.error('Erreur lors de l\'envoi avec EmailJS:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('Email de confirmation envoyé avec succès:', result);
      toast.success('Email de confirmation envoyé avec succès !');
    },
    onError: (error) => {
      console.error('Erreur dans useEmailJS:', error);
      toast.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  });
}
