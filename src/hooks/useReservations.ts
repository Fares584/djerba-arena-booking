
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

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        // Generate confirmation token
        const confirmation_token = generateToken(32);

        // First: create reservation, statut = 'en_attente', confirmed_by_user: false
        const { data, error } = await supabase
          .from('reservations')
          .insert({
            ...newReservation,
            confirmation_token,
            confirmed_by_user: false,
            statut: 'en_attente',
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

        // Send confirmation email via edge function (call from frontend)
        const confirmLink = `${window.location.origin}/confirm-reservation?token=${confirmation_token}`;
        await fetch("https://gohcvgpwuzlepfcucvmj.supabase.co/functions/v1/send-reservation-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            nom_client: data.nom_client,
            field_name: data.terrain?.nom ?? '—',
            date: data.date,
            heure: data.heure,
            confirmation_link: confirmLink,
          }),
        });

        return data;
      } catch (error) {
        console.error("Error in createReservation mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Votre réservation a bien été enregistrée. Veuillez confirmer via l'email que vous venez de recevoir.");
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
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
