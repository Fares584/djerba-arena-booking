
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
      console.log('Envoi de l\'email avec les données:', data);
      
      const { data: result, error } = await supabase.functions.invoke('send-reservation-email', {
        body: data
      });

      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      console.log('Email de confirmation envoyé avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email de confirmation');
    }
  });
}
