
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import { toast } from 'sonner';
import { useReservationSecurity } from './useReservationSecurity';
import { useDeviceFingerprint } from './useDeviceFingerprint';
import { useReservationNotification } from './useReservationNotification';
import { useTerrains } from './useTerrains';
import { normalizeTunisianPhone } from '@/lib/validation';

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
  const { getDeviceFingerprint } = useDeviceFingerprint();
  const { mutate: sendNotification } = useReservationNotification();
  const { data: terrains } = useTerrains();

  return useMutation({
    mutationFn: async (newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        console.log('🔄 === DÉBUT CRÉATION RÉSERVATION (HOOK) ===');
        console.log('📝 Données reçues:', {
          nom_client: newReservation.nom_client,
          tel: newReservation.tel,
          email: newReservation.email,
          terrain_id: newReservation.terrain_id,
          date: newReservation.date,
          heure: newReservation.heure,
          statut: newReservation.statut
        });
        console.log('👤 Mode admin:', options?.isAdminCreation);
        
        // Normaliser le téléphone avant toute vérification
        const normalizedPhone = normalizeTunisianPhone(newReservation.tel);
        console.log('📞 Téléphone normalisé pour réservation:', normalizedPhone);
        
        // ==================== DOUBLE VÉRIFICATION SÉCURITÉ ====================
        console.log('🔐 DOUBLE VÉRIFICATION SÉCURITÉ (HOOK)');
        
        const securityCheck = await checkReservationLimits(
          newReservation.tel, // On passe le téléphone original, la normalisation se fait dans le hook
          newReservation.email
        );

        console.log('📋 Résultat double vérification:', securityCheck);

        if (!securityCheck.canReserve) {
          console.log('❌ === DOUBLE VÉRIFICATION ÉCHOUÉE ===');
          console.log('🚫 Raison:', securityCheck.reason);
          throw new Error(securityCheck.reason || 'Réservation non autorisée');
        }

        console.log('✅ Double vérification sécurité réussie');
        
        // Création effective de la réservation avec le téléphone normalisé
        const deviceFingerprint = getDeviceFingerprint();
        
        const reservationData = {
          ...newReservation,
          tel: normalizedPhone, // Stocker le téléphone normalisé
          email: newReservation.email.trim().toLowerCase(),
          statut: 'en_attente' as const,
          ip_address: deviceFingerprint,
          user_agent: navigator.userAgent.slice(0, 255)
        };
        
        console.log('💾 Insertion en base de données...');
        console.log('💾 Téléphone qui sera stocké:', normalizedPhone);
        
        const { data, error } = await supabase
          .from('reservations')
          .insert(reservationData)
          .select(`
            *, 
            terrain:terrains(id, nom)
          `)
          .single();

        if (error) {
          console.error("❌ Erreur insertion base de données:", error);
          throw error;
        }

        console.log('✅ Réservation créée avec succès:', data);
        
        // Envoi notification
        if (terrains) {
          const terrain = terrains.find(t => t.id === data.terrain_id);
          if (terrain) {
            console.log('📧 Envoi notification...');
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
        }
        
        console.log('🎉 === RÉSERVATION TERMINÉE AVEC SUCCÈS ===');
        toast.success("Réservation créée avec succès !");

        return data;
      } catch (error) {
        console.error("❌ ERREUR GÉNÉRALE dans createReservation:", error);
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
      console.error("❌ ERREUR FINALE création réservation:", error);
      toast.error(error.message || "Erreur lors de la création de la réservation");
    },
  });
}
