
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTerrains(filters?: { type?: string; actif?: boolean }) {
  return useQuery({
    queryKey: ['terrains', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('terrains').select('*');
        
        if (filters?.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }
        
        if (filters?.actif !== undefined) {
          query = query.eq('actif', filters.actif);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching terrains:", error);
          throw error;
        }
        
        return data as Terrain[];
      } catch (error) {
        console.error("Error in useTerrains hook:", error);
        toast.error("Erreur lors du chargement des terrains");
        throw error;
      }
    },
    retry: 1,
  });
}

export function useTerrain(id?: number) {
  return useQuery({
    queryKey: ['terrain', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from('terrains')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error fetching terrain:", error);
          throw error;
        }
        
        return data as Terrain;
      } catch (error) {
        console.error("Error in useTerrain hook:", error);
        toast.error("Erreur lors du chargement du terrain");
        throw error;
      }
    },
    enabled: !!id,
  });
}
