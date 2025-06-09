
import { useState } from 'react';
import { useAbonnements } from '@/hooks/useAbonnements';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useTerrains } from '@/hooks/useTerrains';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Calendar, CreditCard, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Abonnement, getDayName } from '@/lib/supabase';
import AbonnementForm from '@/components/admin/AbonnementForm';

const Abonnements = () => {
  const { data: abonnements, isLoading, refetch } = useAbonnements();
  const { data: abonnementTypes } = useAbonnementTypes({ actif: true });
  const { data: terrains } = useTerrains({ actif: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  const getTypeLabel = (abonnementTypeId: number) => {
    const type = abonnementTypes?.find(t => t.id === abonnementTypeId);
    return type?.nom || 'Type inconnu';
  };

  const getTerrainLabel = (terrainId?: number) => {
    if (!terrainId) return 'Non défini';
    const terrain = terrains?.find(t => t.id === terrainId);
    return terrain?.nom || 'Terrain inconnu';
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'expire':
        return 'Expiré';
      case 'annule':
        return 'Annulé';
      default:
        return statut;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'expire':
        return 'bg-red-100 text-red-800';
      case 'annule':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            <Calendar className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold">
                {abonnements?.filter(a => a.statut === 'actif').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold">
                {abonnementTypes && abonnements ? 
                  abonnements
                    .filter(a => a.statut === 'actif')
                    .reduce((total, a) => {
                      const type = abonnementTypes.find(t => t.id === a.abonnement_type_id);
                      return total + (type?.prix || 0);
                    }, 0)
                    .toFixed(0) + ' DT'
                  : '0 DT'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        {abonnements && abonnements.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Terrain</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abonnements.map((abonnement: Abonnement) => (
                  <TableRow key={abonnement.id}>
                    <TableCell className="font-medium">{abonnement.client_nom}</TableCell>
                    <TableCell>{abonnement.client_email}</TableCell>
                    <TableCell>{getTypeLabel(abonnement.abonnement_type_id)}</TableCell>
                    <TableCell>{getTerrainLabel(abonnement.terrain_id)}</TableCell>
                    <TableCell>
                      {abonnement.jour_semaine !== null && abonnement.heure_fixe ? (
                        <div className="text-sm">
                          <div>{getDayName(abonnement.jour_semaine)}</div>
                          <div className="text-gray-500">
                            {abonnement.heure_fixe} ({abonnement.duree_seance || 1}h)
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Non défini</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(abonnement.date_debut).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(abonnement.statut)}`}
                      >
                        {getStatusLabel(abonnement.statut)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun abonnement</h3>
            <p className="mt-1 text-gray-500">Il n'y a pas encore d'abonnements à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Abonnements;
