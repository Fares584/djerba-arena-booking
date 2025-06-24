import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { toast } from 'sonner';
import { useReservationSecurity } from './useReservationSecurity';

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
        
        if (filters?.excludeSubscriptions) {
          query = query.is('abonnement_id', null);
        }
        
        const { data, error } = await query.order('date', { ascending: true }).order('heure', { ascending: true });
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }
        
        const now = new Date();
        const currentReservations = (data as Reservation[]).filter(reservation => {
          if (reservation.statut === 'annulee') {
            return false;
          }
          
          const reservationDate = new Date(reservation.date);
          const [hours, minutes] = reservation.heure.split(':').map(Number);
          const reservationStart = new Date(reservationDate);
          reservationStart.setHours(hours, minutes, 0, 0);
          
          const reservationEnd = new Date(reservationStart);
          reservationEnd.setHours(reservationEnd.getHours() + Math.floor(reservation.duree));
          reservationEnd.setMinutes(reservationEnd.getMinutes() + ((reservation.duree % 1) * 60));
          
          return reservationEnd > now;
        });
        
        return currentReservations;
      } catch (error) {
        console.error("Error in useReservations hook:", error);
        toast.error("Erreur lors du chargement des réservations");
        throw error;
      }
    },
  });
}

// Hook pour l'historique des réservations - réservations terminées ou annulées
export function useReservationsHistory(filters?: { 
  terrain_id?: number; 
  statut?: string;
  excludeSubscriptions?: boolean;
}) {
  return useQuery({
    queryKey: ['reservations-history', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('reservations').select('*');
        
        if (filters?.terrain_id) {
          query = query.eq('terrain_id', filters.terrain_id);
        }
        
        if (filters?.statut) {
          query = query.eq('statut', filters.statut);
        }
        
        if (filters?.excludeSubscriptions) {
          query = query.is('abonnement_id', null);
        }
        
        const { data, error } = await query.order('date', { ascending: false }).order('heure', { ascending: false });
        
        if (error) {
          console.error("Error fetching reservations history:", error);
          throw error;
        }
        
        const now = new Date();
        const historyReservations = (data as Reservation[]).filter(reservation => {
          if (reservation.statut === 'annulee') {
            return true;
          }
          
          if (reservation.statut === 'confirmee') {
            const reservationDate = new Date(reservation.date);
            const [hours, minutes] = reservation.heure.split(':').map(Number);
            const reservationStart = new Date(reservationDate);
            reservationStart.setHours(hours, minutes, 0, 0);
            
            const reservationEnd = new Date(reservationStart);
            reservationEnd.setHours(reservationEnd.getHours() + Math.floor(reservation.duree));
            reservationEnd.setMinutes(reservationEnd.getMinutes() + ((reservation.duree % 1) * 60));
            
            return reservationEnd <= now;
          }
          
          return false;
        });
        
        return historyReservations;
      } catch (error) {
        console.error("Error in useReservationsHistory hook:", error);
        toast.error("Erreur lors du chargement de l'historique des réservations");
        throw error;
      }
    },
  });
}

export function useCreateReservation(options?: { onSuccess?: () => void; isAdminCreation?: boolean }) {
  const queryClient = useQueryClient();
  const { checkReservationLimits } = useReservationSecurity();

  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log('=== DÉBUT CRÉATION RÉSERVATION ===');
        console.log('Données de réservation:', newReservation);
        console.log('Mode admin:', options?.isAdminCreation);
        
        // Vérification des limites de sécurité améliorée
        console.log('Vérification des limites de sécurité...');
        const securityCheck = await checkReservationLimits(
          newReservation.tel,
          newReservation.email,
          options?.isAdminCreation || false
        );

        console.log('Résultat vérification sécurité:', securityCheck);

        if (!securityCheck.canReserve) {
          console.log('❌ Réservation bloquée:', securityCheck.reason);
          throw new Error(securityCheck.reason || 'Réservation non autorisée');
        }

        console.log('✅ Sécurité validée, création de la réservation...');
        
        // Obtenir l'ID de session pour traçabilité uniquement
        const sessionId = getOrCreateSessionId();
        
        // Créer avec statut "en_attente"
        const reservationData = {
          ...newReservation,
          statut: 'en_attente' as const,
          ip_address: sessionId, // Utilisé uniquement pour traçabilité
          user_agent: navigator.userAgent.slice(0, 255)
        };
        
        console.log('Données finales de la réservation:', reservationData);
        
        const { data, error } = await supabase
          .from('reservations')
          .insert(reservationData)
          .select(`
            *, 
            terrain:terrains(id, nom)
          `)
          .single();

        if (error) {
          console.error("❌ Error creating reservation:", error);
          throw error;
        }

        console.log('✅ Réservation créée avec succès:', data);
        console.log('=== FIN CRÉATION RÉSERVATION ===');
        toast.success("Réservation créée avec succès !");

        return data;
      } catch (error) {
        console.error("❌ Error in createReservation mutation:", error);
        throw error;
      }
    },
    onSuccess: (...args) => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-history'] });
    },
    onError: (error) => {
      console.error("❌ Reservation creation error:", error);
      toast.error(error.message || "Erreur lors de la création de la réservation");
    },
  });
}

// Fonction utilitaire pour l'ID de session (traçabilité uniquement)
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('reservation_session_id');
  
  if (!sessionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    sessionId = `${timestamp}-${random}`;
    sessionStorage.setItem('reservation_session_id', sessionId);
  }
  
  return sessionId;
}
