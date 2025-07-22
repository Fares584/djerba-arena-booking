
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { toast } from 'sonner';
import { useReservationSecurity } from './useReservationSecurity';
import { useDeviceFingerprint } from './useDeviceFingerprint';
import { useReservationNotification } from './useReservationNotification';
import { useTerrains } from './useTerrains';

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
        console.log('🔍 RESERVATIONS QUERY: Chargement des réservations avec filtres:', filters);
        
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
          console.error("❌ RESERVATIONS QUERY: Erreur lors du chargement:", error);
          throw error;
        }
        
        console.log('✅ RESERVATIONS QUERY: Réservations chargées:', data?.length || 0);
        
        const now = new Date();
        const currentReservations = (data as Reservation[]).filter(reservation => {
          // Pour les réservations annulées, on les garde toujours pour les stats
          if (reservation.statut === 'annulee') {
            return true;
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
        
        console.log('✅ RESERVATIONS QUERY: Réservations filtrées (actuelles):', currentReservations.length);
        return currentReservations;
      } catch (error) {
        console.error("❌ RESERVATIONS QUERY: Erreur dans le hook useReservations:", error);
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

export function useCreateReservation(options?: { onSuccess?: () => void; isAdminCreation?: boolean; onError?: (error: any) => void }) {
  const queryClient = useQueryClient();
  const { checkReservationLimits } = useReservationSecurity();
  const { getDeviceFingerprint } = useDeviceFingerprint();
  const { mutate: sendNotification } = useReservationNotification();
  const { data: terrains } = useTerrains();

  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log('=== DÉBUT CRÉATION RÉSERVATION ===');
        console.log('📝 RESERVATION CREATE: Données reçues:', newReservation);
        console.log('🔧 RESERVATION CREATE: Mode admin:', options?.isAdminCreation);
        
        // Vérification des limites de sécurité renforcée
        console.log('🔒 RESERVATION CREATE: Vérification des limites de sécurité...');
        const securityCheck = await checkReservationLimits(
          newReservation.tel,
          newReservation.email,
          options?.isAdminCreation || false
        );

        console.log('✅ RESERVATION CREATE: Résultat vérification sécurité:', securityCheck);

        if (!securityCheck.canReserve) {
          console.log('❌ RESERVATION CREATE: Réservation bloquée:', securityCheck.reason);
          throw new Error(securityCheck.reason || 'Réservation non autorisée');
        }

        console.log('🚀 RESERVATION CREATE: Sécurité validée, création de la réservation...');
        
        // Obtenir le fingerprint de l'appareil pour traçabilité et limitation
        const deviceFingerprint = getDeviceFingerprint();
        
        // Créer avec statut "en_attente" et fingerprint de l'appareil
        const reservationData = {
          ...newReservation,
          statut: 'en_attente' as const,
          ip_address: deviceFingerprint, // Stocke le fingerprint de l'appareil
          user_agent: navigator.userAgent.slice(0, 255)
        };
        
        console.log('💾 RESERVATION CREATE: Données finales pour insertion:', {
          ...reservationData,
          ip_address: `device_${deviceFingerprint.slice(0, 8)}...` // Affichage tronqué pour la console
        });
        
        const { data, error } = await supabase
          .from('reservations')
          .insert(reservationData)
          .select(`
            *, 
            terrain:terrains(id, nom)
          `)
          .single();

        if (error) {
          console.error("❌ RESERVATION CREATE: Erreur lors de l'insertion en base:", error);
          throw error;
        }

        console.log('✅ RESERVATION CREATE: Réservation créée avec succès en base:', data);
        
        // Envoyer la notification email à l'admin SEULEMENT si ce n'est PAS une création admin
        if (!options?.isAdminCreation && terrains) {
          const terrain = terrains.find(t => t.id === data.terrain_id);
          if (terrain) {
            console.log('📧 RESERVATION CREATE: Envoi de la notification email...');
            sendNotification({
              reservation: {
                id: data.id,
                nom_client: data.nom_client,
                tel: data.tel,
                email: data.email,
                terrain_id: data.terrain_id,
                date: data.date,
                heure: data.heure,
                duree: data.duree,
                statut: data.statut
              },
              terrain
            });
          } else {
            console.warn('⚠️ RESERVATION CREATE: Terrain non trouvé pour notification');
          }
        } else if (options?.isAdminCreation) {
          console.log('📧 RESERVATION CREATE: Pas d\'envoi de notification - Création admin');
        } else {
          console.warn('⚠️ RESERVATION CREATE: Pas de terrains disponibles pour notification');
        }
        
        console.log('=== FIN CRÉATION RÉSERVATION ===');
        toast.success("Réservation créée avec succès !");

        return data;
      } catch (error) {
        console.error("❌ RESERVATION CREATE: Erreur dans la mutation createReservation:", error);
        throw error;
      }
    },
    onSuccess: (...args) => {
      console.log('✅ RESERVATION CREATE: Callback onSuccess déclenché');
      if (options?.onSuccess) {
        options.onSuccess();
      }
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-history'] });
    },
    onError: (error) => {
      console.error("❌ RESERVATION CREATE: Callback onError déclenché:", error);
      if (options?.onError) {
        options.onError(error);
      }
      toast.error(error.message || "Erreur lors de la création de la réservation");
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: number) => {
      try {
        console.log('🗑️ Suppression de la réservation:', reservationId);
        
        const { error } = await supabase
          .from('reservations')
          .delete()
          .eq('id', reservationId);

        if (error) {
          console.error("❌ Erreur lors de la suppression:", error);
          throw error;
        }

        console.log('✅ Réservation supprimée avec succès');
        return reservationId;
      } catch (error) {
        console.error("❌ Erreur dans la mutation de suppression:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-history'] });
      toast.success("Réservation supprimée avec succès !");
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de la réservation");
    },
  });
}
