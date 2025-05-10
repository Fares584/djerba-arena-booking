
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Terrain } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

export function useTerrains(filters?: { type?: string; actif?: boolean }) {
  return useQuery({
    queryKey: ['terrains', filters],
    queryFn: async () => {
      let query = supabase.from('terrains').select('*');
      
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.actif !== undefined) {
        query = query.eq('actif', filters.actif);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast.error("Erreur lors du chargement des terrains");
        console.error("Error fetching terrains:", error);
        throw error;
      }
      
      return data as Terrain[];
    },
  });
}

export function useTerrain(id?: number) {
  return useQuery({
    queryKey: ['terrain', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('terrains')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        toast.error("Erreur lors du chargement du terrain");
        console.error("Error fetching terrain:", error);
        throw error;
      }
      
      return data as Terrain;
    },
    enabled: !!id,
  });
}
