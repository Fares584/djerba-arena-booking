import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Calendar, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import ReservationForm from '@/components/admin/ReservationForm';
import EditReservationForm from '@/components/admin/EditReservationForm';
import ReservationCard from '@/components/admin/ReservationCard';

const Reservations = () => {
  // Afficher toutes les réservations (en_attente, confirmée, etc.) sauf abonnements, y compris celles d'aujourd'hui
  // Activation des mises à jour en temps réel pour voir les nouvelles réservations instantanément
  const { data: reservations, isLoading, refetch } = useReservations({ 
    excludeSubscriptions: true, 
    showAllCurrent: true,
    enableRealtime: true // 🔄 Mises à jour en temps réel activées
  });
  const { data: terrains } = useTerrains();
  const [searchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Récupérer le paramètre de recherche depuis l'URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  const handleStatusChange = async (id: number, newStatus: 'confirmee' | 'annulee') => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ statut: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(
        newStatus === 'confirmee'
          ? 'Réservation confirmée avec succès'
          : 'Réservation annulée avec succès'
      );
      
      refetch();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingReservation(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Réservation supprimée avec succès');
      
      refetch();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Erreur lors de la suppression de la réservation');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTerrainName = (terrainId: number) => {
    if (!terrains) return 'Inconnu';
    const terrain = terrains.find(t => t.id === terrainId);
    return terrain ? terrain.nom : 'Inconnu';
  };

  const handleReservationAdded = () => {
    setIsDialogOpen(false);
    refetch();
  };

  // Filter reservations based on search term, terrain and status
  const filteredReservations = reservations?.filter(reservation => {
    const matchesSearch = reservation.nom_client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTerrain = selectedTerrainId === 'all' || reservation.terrain_id.toString() === selectedTerrainId;
    const matchesStatus = selectedStatus === 'all' || reservation.statut === selectedStatus;
    return matchesSearch && matchesTerrain && matchesStatus;
  }) || [];

  // Sort reservations by creation date (most recent first)
  const sortedReservations = filteredReservations.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sport-green hover:bg-sport-dark">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Réservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[90vh] w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Ajouter une Réservation</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <ReservationForm onSuccess={handleReservationAdded} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-sport-green" />
          <h2 className="font-semibold text-gray-700">Filtres</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recherche par nom */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom du client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par stade */}
          <Select value={selectedTerrainId} onValueChange={setSelectedTerrainId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par stade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les stades</SelectItem>
              {terrains?.map((terrain) => (
                <SelectItem key={terrain.id} value={terrain.id.toString()}>
                  {terrain.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre par statut */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="confirmee">Confirmée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReservations.map((reservation: Reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              terrainName={getTerrainName(reservation.terrain_id)}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">
            {searchTerm ? 'Aucune réservation trouvée' : 'Aucune réservation'}
          </h3>
          <p className="mt-1 text-gray-500">
            {searchTerm 
              ? `Aucune réservation ne correspond à "${searchTerm}"`
              : "Il n'y a pas encore de réservations à afficher."
            }
          </p>
        </div>
      )}
      
      {/* Edit Reservation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl h-[90vh] w-[95vw] sm:w-full flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier la Réservation #{editingReservation?.id}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {editingReservation && (
              <EditReservationForm 
                reservation={editingReservation}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;
