
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Reservation } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

export function useReservations(filters?: { 
  terrain_id?: number; 
  date?: string;
  statut?: string;
}) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
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
        toast.error("Erreur lors du chargement des réservations");
        console.error("Error fetching reservations:", error);
        throw error;
      }
      
      return data as Reservation[];
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id'>) => {
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
    },
    onSuccess: () => {
      toast.success("Réservation envoyée avec succès!");
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la réservation");
      console.error("Reservation creation error:", error);
    },
  });
}
