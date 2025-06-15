import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function generateToken(length = 48) {
  // crypto for browsers; fallback if not available
  if ('crypto' in window) {
    return Array.from(window.crypto.getRandomValues(new Uint8Array(length)))
      .map(x => ('00' + x.toString(16)).slice(-2)).join('');
  } else {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res = "";
    for (let i = 0; i < length; ++i) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  }
}

export function useReservations(filters?: { 
  terrain_id?: number; 
  date?: string;
  statut?: string;
  excludeSubscriptions?: boolean;
}) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('reservations').select('*');
        
        if (filters?.terrain_id) {
          query = query.eq('terrain_id', filters.terrain_id);
        }
        
        if (filters?.date) {
          query = query.eq('date', filters.date);
        }
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        // Exclure les réservations d'abonnement si demandé
        if (filters?.excludeSubscriptions) {
          query = query.is('abonnement_id', null);
        }
        
        const { data, error } = await query.order('date', { ascending: true }).order('heure', { ascending: true });
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }
        
        return data as Reservation[];
      } catch (error) {
        console.error("Error in useReservations hook:", error);
        toast.error("Erreur lors du chargement des réservations");
        throw error;
      }
    },
  });
}

export function useCreateReservation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        // Création directe avec statut "confirmee"
        const { data, error } = await supabase
          .from('reservations')
          .insert({
            ...newReservation,
            statut: 'confirmee' // Immédiatement confirmée !
          })
          .select(`
            *, 
            terrain:terrains(id, nom)
          `)
          .single();

        if (error) {
          console.error("Error creating reservation:", error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error in createReservation mutation:", error);
        throw error;
      }
    },
    onSuccess: (...args) => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la réservation");
      console.error("Reservation creation error:", error);
    },
  });
}
