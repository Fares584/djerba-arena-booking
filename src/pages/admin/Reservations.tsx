import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Calendar, Search, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/supabase';
import ReservationForm from '@/components/admin/ReservationForm';
import EditReservationForm from '@/components/admin/EditReservationForm';
import ReservationCard from '@/components/admin/ReservationCard';
import ReservationDetailModal from '@/components/admin/ReservationDetailModal';

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
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
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

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalOpen(true);
  };

  // Filter reservations based on search term
  const filteredReservations = reservations?.filter(reservation =>
    reservation.nom_client.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sort reservations by creation date (most recent first)
  const sortedReservations = filteredReservations.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Catégoriser les réservations par statut
  const totalReservations = sortedReservations;
  const confirmedReservations = sortedReservations.filter(r => r.statut === 'confirmee');
  const pendingReservations = sortedReservations.filter(r => r.statut === 'en_attente');
  const cancelledReservations = sortedReservations.filter(r => r.statut === 'annulee');

  const renderReservationGrid = (reservations: Reservation[], emptyMessage: string) => {
    if (reservations.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{emptyMessage}</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map((reservation: Reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            terrainName={getTerrainName(reservation.terrain_id)}
            onView={handleViewReservation}
          />
        ))}
      </div>
    );
  };

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

      {/* Tabs pour catégoriser les réservations */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Toutes ({totalReservations.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Confirmées ({confirmedReservations.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            En attente ({pendingReservations.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Annulées ({cancelledReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderReservationGrid(totalReservations, 'Aucune réservation')}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {renderReservationGrid(confirmedReservations, 'Aucune réservation confirmée')}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {renderReservationGrid(pendingReservations, 'Aucune réservation en attente')}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {renderReservationGrid(cancelledReservations, 'Aucune réservation annulée')}
        </TabsContent>
      </Tabs>
      
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

      {/* Reservation Detail Modal */}
      <ReservationDetailModal
        reservation={selectedReservation}
        terrainName={selectedReservation ? getTerrainName(selectedReservation.terrain_id) : ''}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReservation(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default Reservations;
