
import { useState } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';
import TerrainForm from '@/components/admin/TerrainForm';
import TerrainCard from '@/components/admin/TerrainCard';

const Terrains = () => {
  // Côté admin, inclure tous les terrains (actifs et inactifs)
  const { data: terrains, isLoading, refetch } = useTerrains({ includeInactive: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTerrain, setEditingTerrain] = useState<Terrain | null>(null);
  
  const handleStatusChange = async (id: number, isActive: boolean) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('terrains')
        .update({ actif: isActive })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(
        isActive
          ? 'Terrain activé avec succès'
          : 'Terrain désactivé avec succès'
      );
      
      refetch();
    } catch (error) {
      console.error('Error updating terrain status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (terrain: Terrain) => {
    setEditingTerrain(terrain);
    setIsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingTerrain(null);
    refetch();
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Terrains</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTerrain(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-sport-green hover:bg-sport-dark">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Terrain
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTerrain ? 'Modifier le Terrain' : 'Ajouter un Terrain'}
              </DialogTitle>
            </DialogHeader>
            <TerrainForm 
              onSuccess={handleFormSuccess} 
              terrainToEdit={editingTerrain}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {terrains && terrains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terrains.map((terrain: Terrain) => (
            <TerrainCard
              key={terrain.id}
              terrain={terrain}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun terrain</h3>
          <p className="mt-1 text-gray-500">Il n'y a pas encore de terrains à afficher.</p>
        </div>
      )}
    </div>
  );
};

export default Terrains;
