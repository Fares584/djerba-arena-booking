
import React, { useState } from 'react';
import { useCreateReservation } from '@/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { validateName, validateTunisianPhone } from '@/lib/validation';
import { toast } from 'sonner';

interface QuickReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  terrainId: number;
  terrainName: string;
  date: string;
  time: string;
  duration: number;
  onSuccess: () => void;
}

const QuickReservationForm = ({
  isOpen,
  onClose,
  terrainId,
  terrainName,
  date,
  time,
  duration,
  onSuccess
}: QuickReservationFormProps) => {
  const [formData, setFormData] = useState({
    nom_client: '',
    tel: ''
  });

  // Les admins peuvent créer des réservations pour tous les terrains, y compris football
  const createReservation = useCreateReservation({ isAdminCreation: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs
    const nameError = validateName(formData.nom_client);
    const phoneError = validateTunisianPhone(formData.tel);

    if (nameError || phoneError) {
      if (nameError) toast.error(`Nom: ${nameError}`);
      if (phoneError) toast.error(`Téléphone: ${phoneError}`);
      return;
    }

    if (!formData.nom_client || !formData.tel) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    // Générer un email automatique pour les réservations admin
    const adminEmail = `admin.reservation.${Date.now()}@planetsports.com`;

    createReservation.mutate({
      nom_client: formData.nom_client,
      tel: formData.tel,
      email: adminEmail,
      terrain_id: terrainId,
      date: date,
      heure: time,
      duree: duration,
      statut: 'en_attente'
    }, {
      onSuccess: () => {
        setFormData({ nom_client: '', tel: '' });
        onSuccess();
        onClose();
        toast.success('Réservation créée avec succès !');
      }
    });
  };

  const handleClose = () => {
    setFormData({ nom_client: '', tel: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle Réservation</DialogTitle>
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Terrain:</strong> {terrainName}</p>
            <p><strong>Date:</strong> {new Date(date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure:</strong> {time}</p>
            <p><strong>Durée:</strong> {duration === 1.5 ? '1h30' : `${duration}h`}</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="nom_client">Nom du client *</Label>
            <Input
              id="nom_client"
              value={formData.nom_client}
              onChange={(e) => setFormData(prev => ({ ...prev, nom_client: e.target.value }))}
              maxLength={40}
              placeholder="Nom et prénom"
              required
              autoFocus
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.nom_client.length}/40 caractères
            </p>
          </div>

          <div>
            <Label htmlFor="tel">Téléphone *</Label>
            <Input
              id="tel"
              value={formData.tel}
              onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))}
              placeholder="Ex: 12345678 ou +21612345678"
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              Numéro tunisien (8 chiffres)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createReservation.isPending}
              className="bg-sport-green hover:bg-sport-dark"
            >
              {createReservation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickReservationForm;
