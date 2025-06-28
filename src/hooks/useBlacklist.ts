
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

// Fonction pour normaliser les numéros tunisiens
const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Nettoyer le numéro
  let clean = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Supprimer les préfixes
  if (clean.startsWith('+216')) {
    clean = clean.substring(4);
  } else if (clean.startsWith('216')) {
    clean = clean.substring(3);
  }
  
  // Retourner les 8 chiffres
  return clean.length >= 8 ? clean.substring(0, 8) : clean;
};

export function useBlacklist() {
  const queryClient = useQueryClient();

  const { data: blacklist, isLoading } = useQuery({
    queryKey: ['blacklist'],
    queryFn: async () => {
      console.log('🔍 Chargement de la blacklist...');
      const { data, error } = await supabase
        .from('blacklist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement blacklist:', error);
        throw error;
      }
      
      console.log('📋 Blacklist chargée:', data);
      return data as BlacklistEntry[];
    },
  });

  const addToBlacklist = useMutation({
    mutationFn: async (entry: { type: 'phone' | 'email'; value: string; reason?: string }) => {
      console.log('➕ Ajout à la blacklist:', entry);
      
      let cleanValue = entry.value.trim();
      
      if (entry.type === 'phone') {
        cleanValue = normalizePhone(entry.value);
        console.log('📞 Numéro normalisé:', cleanValue);
        
        if (!/^\d{8}$/.test(cleanValue)) {
          throw new Error('Le numéro doit être un numéro tunisien valide (8 chiffres)');
        }
      } else {
        cleanValue = entry.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
          throw new Error('L\'adresse email n\'est pas valide');
        }
      }

      const { data, error } = await supabase
        .from('blacklist')
        .insert([{ ...entry, value: cleanValue }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur ajout blacklist:', error);
        throw error;
      }
      
      console.log('✅ Ajouté à la blacklist:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      toast.success('Contact ajouté à la blacklist');
    },
    onError: (error: any) => {
      console.error('❌ Erreur mutation:', error);
      if (error.code === '23505') {
        toast.error('Ce contact est déjà dans la blacklist');
      } else {
        toast.error(error.message || 'Erreur lors de l\'ajout à la blacklist');
      }
    },
  });

  const removeFromBlacklist = useMutation({
    mutationFn: async (id: number) => {
      console.log('🗑️ Suppression de la blacklist, ID:', id);
      const { error } = await supabase
        .from('blacklist')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression:', error);
        throw error;
      }
      console.log('✅ Supprimé de la blacklist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      toast.success('Contact retiré de la blacklist');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  // Fonction pour vérifier si un contact est blacklisté
  const isBlacklisted = (phone: string, email: string): boolean => {
    if (!blacklist) return false;
    
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('🔍 Vérification blacklist:', { 
      phone: normalizedPhone, 
      email: normalizedEmail 
    });
    
    const found = blacklist.some(entry => {
      if (entry.type === 'phone' && entry.value === normalizedPhone) {
        console.log('🚫 Téléphone trouvé dans blacklist:', entry);
        return true;
      }
      if (entry.type === 'email' && entry.value === normalizedEmail) {
        console.log('🚫 Email trouvé dans blacklist:', entry);
        return true;
      }
      return false;
    });
    
    console.log('📊 Résultat vérification blacklist:', found);
    return found;
  };

  return {
    blacklist,
    isLoading,
    addToBlacklist,
    removeFromBlacklist,
    isBlacklisted,
  };
}
