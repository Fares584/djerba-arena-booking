
import { useState, useMemo } from 'react';
import { useAbonnements, useDeleteAbonnement, useUpdateAbonnement, useCreateAbonnement } from '@/hooks/useAbonnements';
import { useAbonnementExpiration } from '@/hooks/useAbonnementExpiration';
import { useTerrains } from '@/hooks/useTerrains';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Users, MapPin } from 'lucide-react';
import { Abonnement } from '@/lib/supabase';
import AbonnementForm from '@/components/admin/AbonnementForm';
import EditAbonnementForm from '@/components/admin/EditAbonnementForm';
import AbonnementCard from '@/components/admin/AbonnementCard';
import { toast } from 'sonner';

const Abonnements = () => {
  const { data: abonnements, isLoading, refetch } = useAbonnements();
  const { data: terrains } = useTerrains({ actif: true });
  const deleteAbonnement = useDeleteAbonnement();
  const updateAbonnement = useUpdateAbonnement();
  const createAbonnement = useCreateAbonnement();
  
  // Ajouter la vérification automatique d'expiration
  useAbonnementExpiration(abonnements);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAbonnement, setEditingAbonnement] = useState<Abonnement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Grouper les abonnements par terrain
  const abonnementsByTerrain = useMemo(() => {
    if (!abonnements || !terrains) return {};
    
    const grouped: Record<number, { terrain: typeof terrains[0], abonnements: Abonnement[] }> = {};
    
    // Initialiser avec tous les terrains
    terrains.forEach(terrain => {
      grouped[terrain.id] = { terrain, abonnements: [] };
    });
    
    // Ajouter les abonnements à leurs terrains respectifs
    abonnements.forEach(abonnement => {
      if (abonnement.terrain_id && grouped[abonnement.terrain_id]) {
        grouped[abonnement.terrain_id].abonnements.push(abonnement);
      }
    });
    
    // Filtrer pour ne garder que les terrains avec des abonnements
    return Object.fromEntries(
      Object.entries(grouped).filter(([_, data]) => data.abonnements.length > 0)
    );
  }, [abonnements, terrains]);
  
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

  const handleRenew = async (abonnement: Abonnement) => {
    try {
      // Calculer le mois et l'année suivants
      const nextMonth = abonnement.mois_abonnement === 12 ? 1 : abonnement.mois_abonnement + 1;
      const nextYear = abonnement.mois_abonnement === 12 ? abonnement.annee_abonnement + 1 : abonnement.annee_abonnement;

      const newAbonnement = {
        terrain_id: abonnement.terrain_id,
        mois_abonnement: nextMonth,
        annee_abonnement: nextYear,
        jour_semaine: abonnement.jour_semaine,
        heure_fixe: abonnement.heure_fixe,
        client_nom: abonnement.client_nom,
        client_tel: abonnement.client_tel,
        statut: 'actif' as const
      };

      await createAbonnement.mutateAsync(newAbonnement);
      toast.success('Abonnement renouvelé avec succès pour le mois suivant !');
    } catch (error) {
      console.error('Error renewing abonnement:', error);
      toast.error('Erreur lors du renouvellement de l\'abonnement');
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

  const getTerrainColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'football':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'tennis':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'padel':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getTerrainIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'football':
        return '⚽';
      case 'tennis':
        return '🎾';
      case 'padel':
        return '🏸';
      default:
        return '🏟️';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-0">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Abonnements</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sport-green hover:bg-sport-dark text-white font-medium px-4 py-2 sm:px-6">
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

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-sport-green mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600">Total Abonnements</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{abonnements?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {abonnements?.filter(a => a.statut === 'actif').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des abonnements groupés par terrain */}
      {abonnements && abonnements.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(abonnementsByTerrain).map(([terrainId, { terrain, abonnements: terrainAbonnements }]) => (
            <div key={terrainId} className="space-y-4">
              {/* En-tête du terrain */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-l-4 ${getTerrainColor(terrain.type)}`}>
                <span className="text-2xl">{getTerrainIcon(terrain.type)}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{terrain.nom}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="capitalize">{terrain.type}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {terrainAbonnements.length} abonnement{terrainAbonnements.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-green-600 font-medium">
                      {terrainAbonnements.filter(a => a.statut === 'actif').length} actif{terrainAbonnements.filter(a => a.statut === 'actif').length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Cartes d'abonnements du terrain */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pl-4 border-l-2 border-gray-200 ml-2">
                {terrainAbonnements.map((abonnement: Abonnement) => (
                  <AbonnementCard
                    key={abonnement.id}
                    abonnement={abonnement}
                    terrainLabel={getTerrainLabel(abonnement.terrain_id)}
                    typeLabel={getTypeLabel(abonnement.terrain_id)}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRenew={handleRenew}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20 bg-white rounded-lg border border-gray-200">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Aucun abonnement</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Il n'y a pas encore d'abonnements à afficher.</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sport-green hover:bg-sport-dark text-white">
                <Plus className="mr-2 h-4 w-4" />
                Créer le premier abonnement
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
      )}

      {/* Dialog de modification */}
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
