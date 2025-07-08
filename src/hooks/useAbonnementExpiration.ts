
import { useEffect } from 'react';
import { useUpdateAbonnement } from '@/hooks/useAbonnements';
import { Abonnement } from '@/lib/supabase';

export function useAbonnementExpiration(abonnements: Abonnement[] | undefined) {
  const updateAbonnement = useUpdateAbonnement();

  useEffect(() => {
    if (!abonnements) return;

    const checkExpiredAbonnements = () => {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      abonnements.forEach((abonnement) => {
        if (abonnement.statut === 'actif') {
          // Vérifier si l'abonnement a expiré (mois passé)
          const isExpired = (
            abonnement.annee_abonnement < currentYear ||
            (abonnement.annee_abonnement === currentYear && abonnement.mois_abonnement < currentMonth)
          );

          if (isExpired) {
            console.log(`Expiring abonnement ${abonnement.id}: ${abonnement.client_nom} - ${abonnement.mois_abonnement}/${abonnement.annee_abonnement}`);
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

// Fonction utilitaire pour calculer les jours restants jusqu'à la fin du mois d'abonnement
export function calculateDaysRemaining(moisAbonnement: number, anneeAbonnement: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Dernier jour du mois d'abonnement
  const endDate = new Date(anneeAbonnement, moisAbonnement, 0); // 0 = dernier jour du mois précédent
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
