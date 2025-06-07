
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
        const { data, error } = await supabase
          .from('abonnements')
          .insert(newAbonnement)
          .select()
          .single();
        
        if (error) {
          console.error("Error creating abonnement:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error in createAbonnement mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Abonnement créé avec succès!");
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de l'abonnement");
      console.error("Abonnement creation error:", error);
    },
  });
}
