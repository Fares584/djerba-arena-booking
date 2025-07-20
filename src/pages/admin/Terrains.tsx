
import { useState } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import TerrainForm from '@/components/admin/TerrainForm';
import TerrainCard from '@/components/admin/TerrainCard';

const Terrains = () => {
  // Inclure tous les terrains (y compris inactifs et football) pour l'admin
  const { data: terrains, isLoading, refetch } = useTerrains({ includeInactive: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTerrainAdded = () => {
    setIsDialogOpen(false);
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sport-green hover:bg-sport-dark">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Terrain
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Terrain</DialogTitle>
            </DialogHeader>
            <TerrainForm onSuccess={handleTerrainAdded} />
          </DialogContent>
        </Dialog>
      </div>
      
      {terrains && terrains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terrains.map((terrain) => (
            <TerrainCard
              key={terrain.id}
              terrain={terrain}
              onUpdate={() => refetch()}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium text-gray-900">Aucun terrain</h3>
          <p className="mt-1 text-gray-500">Commencez par ajouter votre premier terrain.</p>
        </div>
      )}
    </div>
  );
};

export default Terrains;
