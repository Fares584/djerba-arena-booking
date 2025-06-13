
import { useState, useEffect } from 'react';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useTerrains } from '@/hooks/useTerrains';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

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

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [typeId, setTypeId] = useState<number | null>(null);
  const [terrainId, setTerrainId] = useState<number | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [jourSemaine, setJourSemaine] = useState<number | null>(null);
  const [heureFixe, setHeureFixe] = useState('');
  const [dureeSeance, setDureeSeance] = useState('1');
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTel, setClientTel] = useState('');

  const { data: types, isLoading: typesLoading } = useAbonnementTypes({ actif: true });
  const { data: terrains, isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();

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

  // Calculer automatiquement la date de fin en fonction du type d'abonnement
  useEffect(() => {
    if (typeId && dateDebut && types) {
      const type = types.find(t => t.id === typeId);
      if (type) {
        const debut = new Date(dateDebut);
        const fin = new Date(debut);
        fin.setMonth(fin.getMonth() + type.duree_mois);
        setDateFin(format(fin, 'yyyy-MM-dd'));
      }
    }
  }, [typeId, dateDebut, types]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeId || !terrainId || !dateDebut || !dateFin || jourSemaine === null || !heureFixe || !clientNom || !clientEmail || !clientTel) {
      return;
    }

    const effectiveDuration = getEffectiveDuration();

    createAbonnement.mutate({
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
      statut: 'actif'
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type d'abonnement</Label>
        <Select 
          value={typeId?.toString() || ""} 
          onValueChange={(value) => setTypeId(parseInt(value))}
          disabled={typesLoading}
        >
          <SelectTrigger>
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
        <Label htmlFor="terrain">Terrain</Label>
        <Select 
          value={terrainId?.toString() || ""} 
          onValueChange={(value) => setTerrainId(parseInt(value))}
          disabled={terrainsLoading}
        >
          <SelectTrigger>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateDebut">Date de début</Label>
          <Input
            id="dateDebut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="dateFin">Date de fin</Label>
          <Input
            id="dateFin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jour">Jour de la semaine</Label>
          <Select 
            value={jourSemaine?.toString() || ""} 
            onValueChange={(value) => setJourSemaine(parseInt(value))}
          >
            <SelectTrigger>
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
          <Label htmlFor="heure">Heure</Label>
          <Select 
            value={heureFixe} 
            onValueChange={setHeureFixe}
          >
            <SelectTrigger>
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
        <Label htmlFor="duree">Durée de séance</Label>
        {selectedTerrain?.type === 'foot' ? (
          <div className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 text-sm flex items-center h-10">
            1h30 (fixe pour football)
          </div>
        ) : (
          <Select 
            value={dureeSeance} 
            onValueChange={setDureeSeance}
          >
            <SelectTrigger>
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
        <Label htmlFor="clientNom">Nom du client</Label>
        <Input
          id="clientNom"
          type="text"
          value={clientNom}
          onChange={(e) => setClientNom(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="clientEmail">Email du client</Label>
        <Input
          id="clientEmail"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="clientTel">Téléphone du client</Label>
        <Input
          id="clientTel"
          type="tel"
          value={clientTel}
          onChange={(e) => setClientTel(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="submit" 
          disabled={createAbonnement.isPending}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {createAbonnement.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : 'Créer l\'abonnement'}
        </Button>
      </div>
    </form>
  );
};

export default AbonnementForm;
