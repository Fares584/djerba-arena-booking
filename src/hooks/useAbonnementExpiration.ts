
import { useEffect } from 'react';
import { useUpdateAbonnement } from '@/hooks/useAbonnements';
import { Abonnement } from '@/lib/supabase';

export function useAbonnementExpiration(abonnements: Abonnement[] | undefined) {
  const updateAbonnement = useUpdateAbonnement();

  useEffect(() => {
    if (!abonnements) return;

    const checkExpiredAbonnements = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      abonnements.forEach((abonnement) => {
        if (abonnement.statut === 'actif') {
          const dateFinAbonnement = new Date(abonnement.date_fin);
          dateFinAbonnement.setHours(0, 0, 0, 0);

          // Si la date de fin est dépassée, marquer comme expiré
          if (dateFinAbonnement < today) {
            console.log(`Expiring abonnement ${abonnement.id}: ${abonnement.client_nom}`);
            updateAbonnement.mutate({
              id: abonnement.id,
              updates: { statut: 'expire' }
            });
          }
        }
      });
    };

    checkExpiredAbonnements();
  }, [abonnements, updateAbonnement]);
}

// Fonction utilitaire pour calculer les jours restants
export function calculateDaysRemaining(dateFin: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateFin);
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
