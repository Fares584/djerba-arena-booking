
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Terrain } from '@/lib/supabase';

interface UseTerrainsOptions {
  actif?: boolean;
}

export const useTerrains = (options: UseTerrainsOptions = {}) => {
  return useQuery({
    queryKey: ['terrains', options],
    queryFn: async () => {
      let query = supabase.from('terrains').select('*');
      
      if (options.actif !== undefined) {
        query = query.eq('actif', options.actif);
      }
      
      const { data, error } = await query.order('nom');
      
      if (error) throw error;
      
      return data as Terrain[];
    },
    staleTime: 0, // Toujours considérer les données comme périmées
    gcTime: 1000 * 60 * 5, // Garder en cache 5 minutes (anciennement cacheTime)
  });
};

// Hook pour invalider le cache des terrains
export const useInvalidateTerrains = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['terrains'] });
  };
};
