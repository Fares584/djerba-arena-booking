
import { useState } from 'react';
import { useAbonnements, useAbonnementTypes } from '@/hooks/useAbonnements';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Users, CreditCard } from 'lucide-react';
import AbonnementForm from '@/components/admin/AbonnementForm';

const Abonnements = () => {
  const { data: abonnements, isLoading, refetch } = useAbonnements();
  const { data: abonnementTypes } = useAbonnementTypes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'expire':
        return 'bg-red-100 text-red-800';
      case 'suspendu':
        return 'bg-yellow-100 text-yellow-800';
      case 'annule':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'actif':
        return 'Actif';
      case 'expire':
        return 'Expiré';
      case 'suspendu':
        return 'Suspendu';
      case 'annule':
        return 'Annulé';
      default:
        return status;
    }
  };

  const handleAbonnementAdded = () => {
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un Abonnement</DialogTitle>
            </DialogHeader>
            <AbonnementForm onSuccess={handleAbonnementAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-sport-green" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Abonnés</p>
              <p className="text-2xl font-bold text-gray-900">
                {abonnements?.filter(a => a.statut === 'actif').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
              <p className="text-2xl font-bold text-gray-900">
                {abonnements?.filter(a => a.statut === 'actif')
                  .reduce((sum, a) => {
                    const type = abonnementTypes?.find(t => t.id === a.abonnement_type_id);
                    return sum + (type ? type.prix / type.duree_mois : 0);
                  }, 0).toFixed(0) || 0} DT
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abonnements Expirés</p>
              <p className="text-2xl font-bold text-gray-900">
                {abonnements?.filter(a => a.statut === 'expire').length || 0}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type d'abonnement</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Réservations</TableHead>
                  <TableHead>Prix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abonnements.map((abonnement) => (
                  <TableRow key={abonnement.id}>
                    <TableCell>{abonnement.id}</TableCell>
                    <TableCell className="font-medium">{abonnement.client_nom}</TableCell>
                    <TableCell>
                      <div>{abonnement.client_email}</div>
                      <div className="text-sm text-gray-500">{abonnement.client_tel}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{abonnement.abonnement_types?.nom}</div>
                      <div className="text-sm text-gray-500">{abonnement.abonnement_types?.description}</div>
                    </TableCell>
                    <TableCell>
                      <div>Du {format(new Date(abonnement.date_debut), 'dd/MM/yyyy', { locale: fr })}</div>
                      <div>Au {format(new Date(abonnement.date_fin), 'dd/MM/yyyy', { locale: fr })}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(abonnement.statut)}`}>
                        {getStatusLabel(abonnement.statut)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {abonnement.reservations_utilisees} / {abonnement.abonnement_types?.reservations_incluses || 0}
                      </div>
                      <div className="text-xs text-gray-500">utilisées ce mois</div>
                    </TableCell>
                    <TableCell className="font-bold text-sport-green">
                      {abonnement.abonnement_types?.prix} DT
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun abonnement</h3>
            <p className="mt-1 text-gray-500">Il n'y a pas encore d'abonnements à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Abonnements;
