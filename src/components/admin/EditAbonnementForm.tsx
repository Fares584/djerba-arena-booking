
import { useState, useEffect } from 'react';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useTerrains } from '@/hooks/useTerrains';
import { useUpdateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Abonnement } from '@/lib/supabase';

// Jours de la semaine
const joursOptions = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

// Créneaux horaires
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Options de durée pour les terrains non-football
const durationOptions = [
  { value: '1', label: '1 heure' },
  { value: '1.5', label: '1 heure 30 minutes' },
  { value: '2', label: '2 heures' },
  { value: '3', label: '3 heures' },
];

// Options de statut
const statusOptions = [
  { value: 'actif', label: 'Actif' },
  { value: 'expire', label: 'Expiré' },
  { value: 'annule', label: 'Annulé' },
];

interface EditAbonnementFormProps {
  abonnement: Abonnement;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditAbonnementForm = ({ abonnement, onSuccess, onCancel }: EditAbonnementFormProps) => {
  const [typeId, setTypeId] = useState<number>(abonnement.abonnement_type_id);
  const [terrainId, setTerrainId] = useState<number>(abonnement.terrain_id || 0);
  const [dateDebut, setDateDebut] = useState(abonnement.date_debut);
  const [dateFin, setDateFin] = useState(abonnement.date_fin);
  const [jourSemaine, setJourSemaine] = useState<number>(abonnement.jour_semaine || 0);
  const [heureFixe, setHeureFixe] = useState(abonnement.heure_fixe || '');
  const [dureeSeance, setDureeSeance] = useState(abonnement.duree_seance?.toString() || '1');
  const [clientNom, setClientNom] = useState(abonnement.client_nom);
  const [clientEmail, setClientEmail] = useState(abonnement.client_email);
  const [clientTel, setClientTel] = useState(abonnement.client_tel);
  const [statut, setStatut] = useState(abonnement.statut);

  const { data: types, isLoading: typesLoading } = useAbonnementTypes({ actif: true });
  const { data: terrains, isLoading: terrainsLoading } = useTerrains({ actif: true });
  const updateAbonnement = useUpdateAbonnement();

  // Get selected terrain object
  const selectedTerrain = terrains?.find(t => t.id === terrainId);

  // Get effective duration - ALWAYS 1.5 for football
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5'; // Football always 1.5 hours
    }
    return dureeSeance;
  };

  // Update duration when terrain changes
  useEffect(() => {
    if (selectedTerrain?.type === 'foot') {
      setDureeSeance('1.5');
    }
  }, [selectedTerrain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeId || !terrainId || !dateDebut || !dateFin || jourSemaine === null || !heureFixe || !clientNom || !clientEmail || !clientTel) {
      return;
    }

    const effectiveDuration = getEffectiveDuration();

    updateAbonnement.mutate({
      id: abonnement.id,
      updates: {
        abonnement_type_id: typeId,
        terrain_id: terrainId,
        date_debut: dateDebut,
        date_fin: dateFin,
        jour_semaine: jourSemaine,
        heure_fixe: heureFixe,
        duree_seance: parseFloat(effectiveDuration),
        client_nom: clientNom,
        client_email: clientEmail,
        client_tel: clientTel,
        statut: statut as 'actif' | 'expire' | 'annule'
      }
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  const handleStatusChange = (value: string) => {
    setStatut(value as 'actif' | 'expire' | 'annule');
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div>
          <Label htmlFor="type" className="text-sm">Type d'abonnement</Label>
          <Select 
            value={typeId?.toString()} 
            onValueChange={(value) => setTypeId(parseInt(value))}
            disabled={typesLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {types?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.nom} - {type.prix} DT ({type.duree_mois} mois)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="terrain" className="text-sm">Terrain</Label>
          <Select 
            value={terrainId?.toString()} 
            onValueChange={(value) => setTerrainId(parseInt(value))}
            disabled={terrainsLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sélectionnez un terrain" />
            </SelectTrigger>
            <SelectContent>
              {terrains?.map((terrain) => (
                <SelectItem key={terrain.id} value={terrain.id.toString()}>
                  {terrain.nom} - {terrain.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dateDebut" className="text-sm">Date de début</Label>
            <Input
              id="dateDebut"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              required
              className="h-9"
            />
          </div>
          
          <div>
            <Label htmlFor="dateFin" className="text-sm">Date de fin</Label>
            <Input
              id="dateFin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              required
              className="h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="jour" className="text-sm">Jour de la semaine</Label>
            <Select 
              value={jourSemaine?.toString()} 
              onValueChange={(value) => setJourSemaine(parseInt(value))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sélectionnez un jour" />
              </SelectTrigger>
              <SelectContent>
                {joursOptions.map((jour) => (
                  <SelectItem key={jour.value} value={jour.value.toString()}>
                    {jour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="heure" className="text-sm">Heure</Label>
            <Select 
              value={heureFixe} 
              onValueChange={setHeureFixe}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sélectionnez une heure" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="duree" className="text-sm">Durée de séance</Label>
          {selectedTerrain?.type === 'foot' ? (
            <div className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 text-sm flex items-center h-9">
              1h30 (fixe pour football)
            </div>
          ) : (
            <Select 
              value={dureeSeance} 
              onValueChange={setDureeSeance}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sélectionnez une durée" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="statut" className="text-sm">Statut</Label>
          <Select 
            value={statut} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sélectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="clientNom" className="text-sm">Nom du client</Label>
          <Input
            id="clientNom"
            type="text"
            value={clientNom}
            onChange={(e) => setClientNom(e.target.value)}
            required
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="clientEmail" className="text-sm">Email du client</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="clientTel" className="text-sm">Téléphone du client</Label>
          <Input
            id="clientTel"
            type="tel"
            value={clientTel}
            onChange={(e) => setClientTel(e.target.value)}
            required
            className="h-9"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={updateAbonnement.isPending}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={updateAbonnement.isPending}
            className="bg-sport-green hover:bg-sport-dark"
          >
            {updateAbonnement.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification...
              </>
            ) : 'Valider les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditAbonnementForm;
