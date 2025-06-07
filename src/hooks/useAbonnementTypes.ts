
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AbonnementType } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

export function useAbonnementTypes(filters?: { actif?: boolean }) {
  return useQuery({
    queryKey: ['abonnement-types', filters],
    queryFn: async () => {
      try {
        console.log('Fetching abonnement types with filters:', filters);
        let query = supabase.from('abonnement_types').select('*');
        
        if (filters?.actif !== undefined) {
          query = query.eq('actif', filters.actif);
        }
        
        const { data, error } = await query.order('nom', { ascending: true });
        
        if (error) {
          console.error("Error fetching abonnement types:", error);
          throw error;
        }
        
        console.log('Abonnement types fetched successfully:', data);
        return data as AbonnementType[];
      } catch (error) {
        console.error("Error in useAbonnementTypes hook:", error);
        toast.error("Erreur lors du chargement des types d'abonnements");
        throw error;
      }
    },
    retry: 1,
  });
}

export function useAbonnementType(id?: number) {
  return useQuery({
    queryKey: ['abonnement-type', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from('abonnement_types')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error fetching abonnement type:", error);
          throw error;
        }
        
        return data as AbonnementType;
      } catch (error) {
        console.error("Error in useAbonnementType hook:", error);
        toast.error("Erreur lors du chargement du type d'abonnement");
        throw error;
      }
    },
    enabled: !!id,
  });
}
