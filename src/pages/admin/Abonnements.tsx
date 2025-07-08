
import { useState, useMemo } from 'react';
import { useAbonnements, useDeleteAbonnement, useUpdateAbonnement } from '@/hooks/useAbonnements';
import { useAbonnementExpiration } from '@/hooks/useAbonnementExpiration';
import { useTerrains } from '@/hooks/useTerrains';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Users } from 'lucide-react';
import { Abonnement } from '@/lib/supabase';
import AbonnementForm from '@/components/admin/AbonnementForm';
import EditAbonnementForm from '@/components/admin/EditAbonnementForm';
import AbonnementCard from '@/components/admin/AbonnementCard';

const Abonnements = () => {
  const { data: abonnements, isLoading, refetch } = useAbonnements();
  const { data: terrains } = useTerrains({ actif: true });
  const deleteAbonnement = useDeleteAbonnement();
  const updateAbonnement = useUpdateAbonnement();
  
  // Ajouter la vérification automatique d'expiration
  useAbonnementExpiration(abonnements);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAbonnement, setEditingAbonnement] = useState<Abonnement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingAbonnement(null);
    refetch();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingAbonnement(null);
  };

  const handleEdit = (abonnement: Abonnement) => {
    setEditingAbonnement(abonnement);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAbonnement.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting abonnement:', error);
    }
  };

  const handleStatusChange = async (abonnementId: number, newStatus: 'actif' | 'expire' | 'annule') => {
    try {
      await updateAbonnement.mutateAsync({
        id: abonnementId,
        updates: { statut: newStatus }
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getTerrainLabel = (terrainId?: number) => {
    if (!terrainId) return 'Non défini';
    const terrain = terrains?.find(t => t.id === terrainId);
    return terrain?.nom || 'Terrain inconnu';
  };

  const getTypeLabel = (terrainId?: number) => {
    if (!terrainId) return '';
    const terrain = terrains?.find(t => t.id === terrainId);
    return terrain?.type ? terrain.type : '';
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
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold">Gestion des Abonnements</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sport-green hover:bg-sport-dark">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Abonnement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Abonnement</DialogTitle>
            </DialogHeader>
            <AbonnementForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-sport-green mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Abonnements</p>
              <p className="text-2xl font-bold">{abonnements?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
              <p className="text-2xl font-bold">
                {abonnements?.filter(a => a.statut === 'actif').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {abonnements && abonnements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {abonnements.map((abonnement: Abonnement) => (
            <AbonnementCard
              key={abonnement.id}
              abonnement={abonnement}
              terrainLabel={getTerrainLabel(abonnement.terrain_id)}
              typeLabel={getTypeLabel(abonnement.terrain_id)}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun abonnement</h3>
          <p className="mt-1 text-gray-500">Il n'y a pas encore d'abonnements à afficher.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'Abonnement</DialogTitle>
          </DialogHeader>
          {editingAbonnement && (
            <EditAbonnementForm
              abonnement={editingAbonnement}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Abonnements;
