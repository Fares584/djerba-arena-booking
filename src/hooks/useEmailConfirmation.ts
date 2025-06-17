
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  return useMutation({
    mutationFn: async (data: EmailConfirmationData) => {
      console.log('Tentative d\'envoi d\'email avec les données:', data);
      
      try {
        const { data: result, error } = await supabase.functions.invoke('send-reservation-email', {
          body: data
        });

        if (error) {
          console.error('Erreur Edge Function:', error);
          throw new Error(`Erreur Edge Function: ${error.message}`);
        }

        console.log('Réponse de la fonction Edge:', result);
        
        if (!result || !result.success) {
          throw new Error(result?.error || 'Réponse invalide de la fonction Edge');
        }

        return result;
      } catch (error) {
        console.error('Erreur complète lors de l\'envoi de l\'email:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('Email de confirmation envoyé avec succès:', result);
      toast.success('Email de confirmation envoyé ! Vérifiez votre boîte mail.');
    },
    onError: (error) => {
      console.error('Erreur dans useEmailConfirmation:', error);
      toast.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  });
}
