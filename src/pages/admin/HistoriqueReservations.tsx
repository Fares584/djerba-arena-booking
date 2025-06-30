
import { useState } from 'react';
import { useReservationsHistory, useDeleteReservation } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { Input } from '@/components/ui/input';
import { Loader2, Search, History, Calendar } from 'lucide-react';
import { Reservation } from '@/lib/supabase';
import ReservationCard from '@/components/admin/ReservationCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const HistoriqueReservations = () => {
  // Afficher les réservations passées confirmées ET les réservations annulées
  // Exclure les réservations d'abonnement
  const { data: reservations, isLoading } = useReservationsHistory({ 
    excludeSubscriptions: true
  });
  const { data: terrains } = useTerrains();
  const deleteReservation = useDeleteReservation();
  const [searchTerm, setSearchTerm] = useState('');
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
  
  const getTerrainName = (terrainId: number) => {
    if (!terrains) return 'Inconnu';
    const terrain = terrains.find(t => t.id === terrainId);
    return terrain ? terrain.nom : 'Inconnu';
  };

  // Filter reservations based on search term
  const filteredReservations = reservations?.filter(reservation =>
    reservation.nom_client.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteConfirm = () => {
    if (reservationToDelete) {
      deleteReservation.mutate(reservationToDelete);
      setReservationToDelete(null);
    }
  };

  // Reservations are already sorted by date (descending) from the hook

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-sport-green" />
        <h1 className="text-3xl font-bold">Historique des Réservations</h1>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par nom du client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation: Reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              terrainName={getTerrainName(reservation.terrain_id)}
              onStatusChange={() => {}} // Pas de changement de statut pour l'historique
              onEdit={() => {}} // Pas de modification pour l'historique
              onDelete={(id) => setReservationToDelete(id)} // Permettre la suppression
              isUpdating={deleteReservation.isPending}
              isHistoryView={true} // Nouvelle prop pour indiquer que c'est la vue historique
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">
            {searchTerm ? 'Aucune réservation trouvée' : 'Aucun historique'}
          </h3>
          <p className="mt-1 text-gray-500">
            {searchTerm 
              ? `Aucune réservation dans l'historique ne correspond à "${searchTerm}"`
              : "Il n'y a pas encore de réservations dans l'historique."
            }
          </p>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!reservationToDelete} onOpenChange={() => setReservationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement cette réservation de l'historique ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteReservation.isPending}
            >
              {deleteReservation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoriqueReservations;
