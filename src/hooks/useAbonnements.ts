
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AbonnementType, Abonnement } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

// Hook pour récupérer tous les types d'abonnements
export function useAbonnementTypes() {
  return useQuery({
    queryKey: ['abonnement-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abonnement_types')
        .select('*')
        .eq('actif', true)
        .order('prix', { ascending: true });
      
      if (error) {
        console.error('Error fetching abonnement types:', error);
        throw error;
      }
      
      return data as AbonnementType[];
    },
  });
}

// Hook pour récupérer tous les abonnements (admin)
export function useAbonnements(filters?: { 
  statut?: string;
  client_email?: string;
}) {
  return useQuery({
    queryKey: ['abonnements', filters],
    queryFn: async () => {
      let query = supabase
        .from('abonnements')
        .select(`
          *,
          abonnement_types!inner(*)
        `);
      
      if (filters?.statut) {
        query = query.eq('statut', filters.statut);
      }
      
      if (filters?.client_email) {
        query = query.eq('client_email', filters.client_email);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching abonnements:', error);
        throw error;
      }
      
      return data as (Abonnement & { abonnement_types: AbonnementType })[];
    },
  });
}

// Hook pour créer un nouvel abonnement
export function useCreateAbonnement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAbonnement: Omit<Abonnement, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('abonnements')
        .insert(newAbonnement)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating abonnement:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Abonnement créé avec succès!');
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
    },
    onError: (error) => {
      console.error('Abonnement creation error:', error);
      toast.error('Erreur lors de la création de l\'abonnement');
    },
  });
}

// Hook pour mettre à jour un abonnement
export function useUpdateAbonnement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Abonnement> }) => {
      const { data, error } = await supabase
        .from('abonnements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating abonnement:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Abonnement modifié avec succès!');
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
    },
    onError: (error) => {
      console.error('Abonnement update error:', error);
      toast.error('Erreur lors de la modification de l\'abonnement');
    },
  });
}
