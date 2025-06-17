import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from './useEmailConfirmation';

export function useReservations(filters?: { 
  terrain_id?: number; 
  date?: string;
  statut?: string;
  excludeSubscriptions?: boolean;
}) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('reservations').select('*');
        
        if (filters?.terrain_id) {
          query = query.eq('terrain_id', filters.terrain_id);
        }
        
        if (filters?.date) {
          query = query.eq('date', filters.date);
        }
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        // Exclure les réservations d'abonnement si demandé
        if (filters?.excludeSubscriptions) {
          query = query.is('abonnement_id', null);
        }
        
        // Toujours exclure les réservations passées (sauf si une date spécifique est demandée)
        if (!filters?.date) {
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('date', today);
        }
        
        const { data, error } = await query.order('date', { ascending: true }).order('heure', { ascending: true });
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }
        
        return data as Reservation[];
      } catch (error) {
        console.error("Error in useReservations hook:", error);
        toast.error("Erreur lors du chargement des réservations");
        throw error;
      }
    },
  });
}

// Nouveau hook pour l'historique des réservations
export function useReservationsHistory(filters?: { 
  terrain_id?: number; 
  statut?: string;
  excludeSubscriptions?: boolean;
}) {
  return useQuery({
    queryKey: ['reservations-history', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('reservations').select('*');
        
        if (filters?.terrain_id) {
          query = query.eq('terrain_id', filters.terrain_id);
        }
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        // Exclure les réservations d'abonnement si demandé
        if (filters?.excludeSubscriptions) {
          query = query.is('abonnement_id', null);
        }
        
        // Inclure uniquement les réservations passées
        const today = new Date().toISOString().split('T')[0];
        query = query.lt('date', today);
        
        const { data, error } = await query.order('date', { ascending: false }).order('heure', { ascending: false });
        
        if (error) {
          console.error("Error fetching reservations history:", error);
          throw error;
        }
        
        return data as Reservation[];
      } catch (error) {
        console.error("Error in useReservationsHistory hook:", error);
        toast.error("Erreur lors du chargement de l'historique des réservations");
        throw error;
      }
    },
  });
}

export function useCreateReservation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const emailConfirmation = useEmailConfirmation();

  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log('Création de la réservation avec les données:', newReservation);
        
        // Créer avec statut "en_attente" qui nécessite confirmation
        const { data, error } = await supabase
          .from('reservations')
          .insert({
            ...newReservation,
            statut: 'en_attente'
          })
          .select(`
            *, 
            terrain:terrains(id, nom)
          `)
          .single();

        if (error) {
          console.error("Error creating reservation:", error);
          throw error;
        }

        console.log('Réservation créée avec succès:', data);
        console.log('Token de confirmation généré:', data.confirmation_token);

        // Envoyer l'email de confirmation immédiatement après la création
        if (data.confirmation_token) {
          console.log('Envoi de l\'email de confirmation...');
          
          try {
            await emailConfirmation.mutateAsync({
              reservation_id: data.id,
              email: data.email,
              nom_client: data.nom_client,
              terrain_nom: data.terrain?.nom || 'Terrain inconnu',
              date: data.date,
              heure: data.heure,
              duree: data.duree,
              confirmation_token: data.confirmation_token
            });
            
            console.log('Email de confirmation envoyé avec succès');
            toast.success("Réservation créée ! Vérifiez votre email pour la confirmation.");
          } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            toast.error("Réservation créée mais erreur lors de l'envoi de l'email. Contactez l'administration.");
          }
        } else {
          console.error('Pas de token de confirmation généré');
          toast.error("Erreur : token de confirmation non généré");
        }

        return data;
      } catch (error) {
        console.error("Error in createReservation mutation:", error);
        throw error;
      }
    },
    onSuccess: (...args) => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-history'] });
    },
    onError: (error) => {
      console.error("Reservation creation error:", error);
      toast.error("Erreur lors de la création de la réservation");
    },
  });
}
