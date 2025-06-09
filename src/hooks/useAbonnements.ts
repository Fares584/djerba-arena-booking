
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Abonnement } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

export function useAbonnements(filters?: { 
  statut?: string;
  client_email?: string;
}) {
  return useQuery({
    queryKey: ['abonnements', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('abonnements').select('*');
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        if (filters?.client_email) {
          query = query.eq('client_email', filters.client_email);
        }
        
        const { data, error } = await query
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching abonnements:", error);
          throw error;
        }
        
        return data as Abonnement[];
      } catch (error) {
        console.error("Error in useAbonnements hook:", error);
        toast.error("Erreur lors du chargement des abonnements");
        throw error;
      }
    },
  });
}

export function useCreateAbonnement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAbonnement: Omit<Abonnement, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log("Creating abonnement:", newAbonnement);
        
        // Créer l'abonnement
        const { data: abonnement, error: abonnementError } = await supabase
          .from('abonnements')
          .insert(newAbonnement)
          .select()
          .single();
        
        if (abonnementError) {
          console.error("Error creating abonnement:", abonnementError);
          throw abonnementError;
        }

        // Si l'abonnement inclut terrain_id, jour_semaine et heure_fixe, générer les réservations automatiques
        if (abonnement.terrain_id && abonnement.jour_semaine !== null && abonnement.heure_fixe && abonnement.duree_seance) {
          console.log("Generating recurring reservations for abonnement:", abonnement.id);
          
          const { error: functionError } = await supabase.rpc('generer_reservations_abonnement', {
            p_abonnement_id: abonnement.id,
            p_terrain_id: abonnement.terrain_id,
            p_date_debut: abonnement.date_debut,
            p_date_fin: abonnement.date_fin,
            p_jour_semaine: abonnement.jour_semaine,
            p_heure: abonnement.heure_fixe,
            p_duree: abonnement.duree_seance,
            p_client_nom: abonnement.client_nom,
            p_client_tel: abonnement.client_tel,
            p_client_email: abonnement.client_email
          });

          if (functionError) {
            console.error("Error generating recurring reservations:", functionError);
            throw functionError;
          }

          console.log("Recurring reservations generated successfully");
        }
        
        return abonnement;
      } catch (error) {
        console.error("Error in createAbonnement mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Abonnement créé avec succès et réservations automatiques générées!");
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de l'abonnement");
      console.error("Abonnement creation error:", error);
    },
  });
}

export function useUpdateAbonnement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Abonnement> }) => {
      try {
        console.log("Updating abonnement:", id, updates);
        
        const { data, error } = await supabase
          .from('abonnements')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating abonnement:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error in updateAbonnement mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Abonnement mis à jour avec succès!");
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'abonnement");
      console.error("Abonnement update error:", error);
    },
  });
}

export function useDeleteAbonnement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log("Deleting abonnement:", id);
        
        // Supprimer d'abord les réservations liées à cet abonnement
        const { error: reservationError } = await supabase
          .from('reservations')
          .delete()
          .eq('abonnement_id', id);
        
        if (reservationError) {
          console.error("Error deleting related reservations:", reservationError);
          throw reservationError;
        }
        
        // Ensuite supprimer l'abonnement
        const { error } = await supabase
          .from('abonnements')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error("Error deleting abonnement:", error);
          throw error;
        }
        
        return id;
      } catch (error) {
        console.error("Error in deleteAbonnement mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Abonnement et réservations associées supprimés avec succès!");
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de l'abonnement");
      console.error("Abonnement deletion error:", error);
    },
  });
}
