
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppSetting } from '@/lib/supabase';
import { toast } from 'sonner';

export function useAppSettings() {
  return useQuery({
    queryKey: ['app_settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*');
        
        if (error) {
          console.error("Error fetching app settings:", error);
          throw error;
        }
        
        return data as AppSetting[];
      } catch (error) {
        console.error("Error in useAppSettings hook:", error);
        toast.error("Erreur lors du chargement des paramètres");
        throw error;
      }
    },
  });
}

export function useAppSetting(settingName: string) {
  return useQuery({
    queryKey: ['app_setting', settingName],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('setting_name', settingName)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching app setting:", error);
          throw error;
        }
        
        return data as AppSetting | null;
      } catch (error) {
        console.error("Error in useAppSetting hook:", error);
        toast.error("Erreur lors du chargement du paramètre");
        throw error;
      }
    },
  });
}

export function useUpdateAppSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ settingName, settingValue }: { settingName: string; settingValue: string }) => {
      try {
        console.log('Tentative de mise à jour du paramètre:', { settingName, settingValue });
        
        // Utiliser upsert (INSERT ... ON CONFLICT) pour créer ou mettre à jour
        const { data, error } = await supabase
          .from('app_settings')
          .upsert(
            { 
              setting_name: settingName,
              setting_value: settingValue,
              updated_at: new Date().toISOString()
            },
            { 
              onConflict: 'setting_name',
              ignoreDuplicates: false
            }
          )
          .select()
          .single();
        
        if (error) {
          console.error("Error updating app setting:", error);
          throw error;
        }
        
        console.log('Paramètre mis à jour avec succès:', data);
        return data;
      } catch (error) {
        console.error("Error in updateAppSetting mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Paramètre mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
      queryClient.invalidateQueries({ queryKey: ['app_setting'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du paramètre");
      console.error("App setting update error:", error);
    },
  });
}
