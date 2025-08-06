import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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
  showAllCurrent?: boolean; // Pour afficher toutes les réservations d'aujourd'hui et futures
  enableRealtime?: boolean; // Pour activer les mises à jour en temps réel
}) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
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
          
          // Si showAllCurrent est activé (pour l'admin), afficher toutes les réservations d'aujourd'hui et futures
          if (filters?.showAllCurrent) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return reservationDate >= today;
          }
          
          // Sinon, filtrer par heure de fin (comportement original)
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

  // Configurer les mises à jour en temps réel si activé
  useEffect(() => {
    if (!filters?.enableRealtime) return;

    console.log('🔄 Activation des mises à jour en temps réel pour les réservations');
    
    const channel = supabase
      .channel('reservations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('📡 Mise à jour en temps réel reçue:', payload);
          
          // Invalider et rafraîchir les requêtes de réservations
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          queryClient.invalidateQueries({ queryKey: ['reservations-history'] });
          
          // Afficher une notification discrète pour les admins
          if (payload.eventType === 'INSERT') {
            toast.success('📅 Nouvelle réservation reçue !', {
              duration: 3000,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast.info('📝 Réservation mise à jour', {
              duration: 2000,
            });
          } else if (payload.eventType === 'DELETE') {
            toast.info('🗑️ Réservation supprimée', {
              duration: 2000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Désactivation des mises à jour en temps réel');
      supabase.removeChannel(channel);
    };
  }, [filters?.enableRealtime, queryClient]);

  return query;
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
  const { getDeviceFingerprint } = useDeviceFingerprint();
  const { mutate: sendNotification } = useReservationNotification();
  const { data: terrains } = useTerrains();

  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log('=== DÉBUT CRÉATION RÉSERVATION ===');
        console.log('Données de réservation:', newReservation);
        console.log('Mode admin:', options?.isAdminCreation);
        
        // Vérification des limites de sécurité renforcée
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
        
        // Obtenir le fingerprint de l'appareil pour traçabilité et limitation
        const deviceFingerprint = getDeviceFingerprint();
        
        // Créer avec statut "en_attente" et fingerprint de l'appareil
        const reservationData = {
          ...newReservation,
          statut: 'en_attente' as const,
          ip_address: deviceFingerprint, // Stocke le fingerprint de l'appareil
          user_agent: navigator.userAgent.slice(0, 255)
        };
        
        console.log('Données finales de la réservation:', {
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
          console.error("❌ Error creating reservation:", error);
          throw error;
        }

        console.log('✅ Réservation créée avec succès:', data);
        
        // Envoyer la notification email à l'admin SEULEMENT si ce n'est PAS une création admin
        if (!options?.isAdminCreation && terrains) {
          const terrain = terrains.find(t => t.id === data.terrain_id);
          if (terrain) {
            console.log('📧 Envoi de la notification email...');
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
          }
        } else if (options?.isAdminCreation) {
          console.log('📧 Pas d\'envoi de notification - Création admin');
        }
        
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
