
import { useState, useMemo } from 'react';
import { useAbonnements, useDeleteAbonnement, useUpdateAbonnement, useCreateAbonnement } from '@/hooks/useAbonnements';
import { useAbonnementExpiration } from '@/hooks/useAbonnementExpiration';
import { useTerrains } from '@/hooks/useTerrains';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Users, Search, Filter } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<string>('all');

  // Statistiques par terrain
  const terrainStats = useMemo(() => {
    if (!abonnements || !terrains) return [];
    
    return terrains.map(terrain => {
      const terrainAbonnements = abonnements.filter(a => a.terrain_id === terrain.id);
      return {
        terrain,
        total: terrainAbonnements.length,
        actifs: terrainAbonnements.filter(a => a.statut === 'actif').length
      };
    }).filter(stat => stat.total > 0);
  }, [abonnements, terrains]);

  // Filtrer les abonnements
  const filteredAbonnements = useMemo(() => {
    if (!abonnements) return [];
    
    let filtered = abonnements;
    
    // Filtrer par terrain
    if (selectedTerrainId !== 'all') {
      filtered = filtered.filter(a => a.terrain_id === parseInt(selectedTerrainId));
    }
    
    // Filtrer par recherche de nom
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.client_nom.toLowerCase().includes(query) ||
        (a.client_tel && a.client_tel.includes(query))
      );
    }
    
    return filtered;
  }, [abonnements, selectedTerrainId, searchQuery]);

  // Grouper les abonnements filtrés par terrain
  const abonnementsByTerrain = useMemo(() => {
    if (!filteredAbonnements || !terrains) return {};
    
    const grouped: Record<number, { terrain: typeof terrains[0], abonnements: Abonnement[] }> = {};
    
    // Initialiser avec tous les terrains
    terrains.forEach(terrain => {
      grouped[terrain.id] = { terrain, abonnements: [] };
    });
    
    // Ajouter les abonnements à leurs terrains respectifs
    filteredAbonnements.forEach(abonnement => {
      if (abonnement.terrain_id && grouped[abonnement.terrain_id]) {
        grouped[abonnement.terrain_id].abonnements.push(abonnement);
      }
    });
    
    // Filtrer pour ne garder que les terrains avec des abonnements
    return Object.fromEntries(
      Object.entries(grouped).filter(([_, data]) => data.abonnements.length > 0)
    );
  }, [filteredAbonnements, terrains]);
  
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

  const getTerrainBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'football':
        return 'bg-green-50 border-green-200';
      case 'tennis':
        return 'bg-orange-50 border-orange-200';
      case 'padel':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

      {/* Résumé par stade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {terrainStats.map(({ terrain, total, actifs }) => (
          <div 
            key={terrain.id} 
            className={`p-4 rounded-lg border-2 ${getTerrainBgColor(terrain.type)} cursor-pointer transition-all hover:shadow-md ${selectedTerrainId === terrain.id.toString() ? 'ring-2 ring-sport-green' : ''}`}
            onClick={() => setSelectedTerrainId(selectedTerrainId === terrain.id.toString() ? 'all' : terrain.id.toString())}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTerrainIcon(terrain.type)}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{terrain.nom}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">{total} total</span>
                  <span className="text-green-600 font-medium">{actifs} actif{actifs > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche par nom */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtre par terrain */}
          <div className="w-full sm:w-64">
            <Select value={selectedTerrainId} onValueChange={setSelectedTerrainId}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par terrain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les terrains</SelectItem>
                {terrains?.map(terrain => (
                  <SelectItem key={terrain.id} value={terrain.id.toString()}>
                    {getTerrainIcon(terrain.type)} {terrain.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Indicateur de résultats */}
        {(searchQuery || selectedTerrainId !== 'all') && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredAbonnements.length} résultat{filteredAbonnements.length > 1 ? 's' : ''} trouvé{filteredAbonnements.length > 1 ? 's' : ''}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setSearchQuery(''); setSelectedTerrainId('all'); }}
              className="text-gray-500 hover:text-gray-700"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Liste des abonnements groupés par terrain */}
      {filteredAbonnements && filteredAbonnements.length > 0 ? (
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
          {searchQuery || selectedTerrainId !== 'all' ? (
            <>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Aucun résultat</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Aucun abonnement ne correspond à vos critères de recherche.</p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(''); setSelectedTerrainId('all'); }}
              >
                Réinitialiser les filtres
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
