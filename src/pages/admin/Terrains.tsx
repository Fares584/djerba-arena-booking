
import { useState } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Check, X, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Terrain } from '@/lib/supabase';
import TerrainForm from '@/components/admin/TerrainForm';

const Terrains = () => {
  const { data: terrains, isLoading, refetch } = useTerrains();
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'foot':
        return 'Football';
      case 'tennis':
        return 'Tennis';
      case 'padel':
        return 'Padel';
      default:
        return type;
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
    <div>
      <div className="flex justify-between items-center mb-6">
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
      
      <div className="bg-white p-6 rounded-lg shadow">
        {terrains && terrains.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Prix (DT/h)</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terrains.map((terrain: Terrain) => (
                  <TableRow key={terrain.id}>
                    <TableCell>{terrain.id}</TableCell>
                    <TableCell className="font-medium">{terrain.nom}</TableCell>
                    <TableCell>{getTypeLabel(terrain.type)}</TableCell>
                    <TableCell>{terrain.capacite} personnes</TableCell>
                    <TableCell>{terrain.prix} DT</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          terrain.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {terrain.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() => handleEdit(terrain)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {terrain.actif ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(terrain.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(terrain.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun terrain</h3>
            <p className="mt-1 text-gray-500">Il n'y a pas encore de terrains à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terrains;
