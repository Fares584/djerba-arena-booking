
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

export function useReservations(filters?: { 
  terrain_id?: number; 
  date?: string;
  statut?: string;
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

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at'>) => {
      try {
        console.log("Creating reservation:", newReservation);
        const { data, error } = await supabase
          .from('reservations')
          .insert(newReservation)
          .select()
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
    onSuccess: () => {
      toast.success("Réservation envoyée avec succès!");
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      // Redirect to home page after successful reservation
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la réservation");
      console.error("Reservation creation error:", error);
    },
  });
}
