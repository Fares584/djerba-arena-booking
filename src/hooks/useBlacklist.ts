
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BlacklistEntry = {
  id: number;
  type: 'phone' | 'email';
  value: string;
  reason?: string;
  created_at: string;
};

export function useBlacklist() {
  const queryClient = useQueryClient();

  const { data: blacklist, isLoading } = useQuery({
    queryKey: ['blacklist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blacklist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlacklistEntry[];
    },
  });

  const addToBlacklist = useMutation({
    mutationFn: async (entry: { type: 'phone' | 'email'; value: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('blacklist')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      toast.success('Contact ajouté à la blacklist');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ce contact est déjà dans la blacklist');
      } else {
        toast.error('Erreur lors de l\'ajout à la blacklist');
      }
    },
  });

  const removeFromBlacklist = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('blacklist')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      toast.success('Contact retiré de la blacklist');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    blacklist,
    isLoading,
    addToBlacklist,
    removeFromBlacklist,
  };
}
