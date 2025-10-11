
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Abonnement } from '@/lib/supabase';
import { toast } from 'sonner';

export function useAbonnements(filters?: { 
  statut?: string;
  mois_abonnement?: number;
  annee_abonnement?: number;
}) {
  return useQuery({
    queryKey: ['abonnements', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('abonnements').select('*');
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        if (filters?.mois_abonnement) {
          query = query.eq('mois_abonnement', filters.mois_abonnement);
        }
        
        if (filters?.annee_abonnement) {
          query = query.eq('annee_abonnement', filters.annee_abonnement);
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

        if (!abonnement) {
          throw new Error("No abonnement returned from insert");
        }

        // Générer les réservations automatiques pour le mois
        if (abonnement.terrain_id && abonnement.jour_semaine !== null && abonnement.heure_fixe) {
          console.log("Generating monthly reservations for abonnement:", abonnement.id);
          
          const { error: functionError } = await supabase.rpc('generer_reservations_mensuelles', {
            p_abonnement_id: abonnement.id,
            p_terrain_id: abonnement.terrain_id,
            p_mois: abonnement.mois_abonnement,
            p_annee: abonnement.annee_abonnement,
            p_jour_semaine: abonnement.jour_semaine,
            p_heure: abonnement.heure_fixe,
            p_client_nom: abonnement.client_nom,
            p_client_tel: abonnement.client_tel || '',
            p_duree: abonnement.duree || 1.5
          });

          if (functionError) {
            console.error("Error generating monthly reservations:", functionError);
            throw functionError;
          }

          console.log("Monthly reservations generated successfully");
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
        
        // Mettre à jour l'abonnement
        const { data: updatedAbonnement, error } = await supabase
          .from('abonnements')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating abonnement:", error);
          throw error;
        }

        // Si des informations critiques ont changé (terrain, jour, heure, mois, année), 
        // supprimer les anciennes réservations et régénérer
        const criticalFields = ['terrain_id', 'jour_semaine', 'heure_fixe', 'mois_abonnement', 'annee_abonnement'];
        const hasCriticalChanges = criticalFields.some(field => updates.hasOwnProperty(field));

        if (hasCriticalChanges && updatedAbonnement.terrain_id && updatedAbonnement.jour_semaine !== null && updatedAbonnement.heure_fixe) {
          console.log("Critical changes detected, regenerating reservations...");
          
          // Supprimer les anciennes réservations automatiques de cet abonnement
          const { error: deleteError } = await supabase
            .from('reservations')
            .delete()
            .eq('abonnement_id', id);

          if (deleteError) {
            console.error("Error deleting old reservations:", deleteError);
            throw deleteError;
          }

          // Régénérer les réservations avec les nouvelles informations
          const { error: functionError } = await supabase.rpc('generer_reservations_mensuelles', {
            p_abonnement_id: id,
            p_terrain_id: updatedAbonnement.terrain_id,
            p_mois: updatedAbonnement.mois_abonnement,
            p_annee: updatedAbonnement.annee_abonnement,
            p_jour_semaine: updatedAbonnement.jour_semaine,
            p_heure: updatedAbonnement.heure_fixe,
            p_client_nom: updatedAbonnement.client_nom,
            p_client_tel: updatedAbonnement.client_tel || '',
            p_duree: updatedAbonnement.duree || 1.5
          });

          if (functionError) {
            console.error("Error regenerating monthly reservations:", functionError);
            throw functionError;
          }

          console.log("Monthly reservations regenerated successfully");
        } else {
          // Si seules les informations client ont changé, mettre à jour les réservations existantes
          if (updates.client_nom || updates.client_tel) {
            console.log("Updating client info in existing reservations...");
            
            const updateData: any = {};
            if (updates.client_nom) updateData.nom_client = updates.client_nom;
            if (updates.client_tel !== undefined) updateData.tel = updates.client_tel || '';

            const { error: updateReservationsError } = await supabase
              .from('reservations')
              .update(updateData)
              .eq('abonnement_id', id);

            if (updateReservationsError) {
              console.error("Error updating reservations client info:", updateReservationsError);
              throw updateReservationsError;
            }
          }
        }
        
        return updatedAbonnement;
      } catch (error) {
        console.error("Error in updateAbonnement mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Abonnement mis à jour avec succès et réservations régénérées!");
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
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
