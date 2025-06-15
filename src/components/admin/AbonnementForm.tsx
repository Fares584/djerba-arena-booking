
import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format, addMonths } from 'date-fns';

// Types locaux pour les sports/terrains
const abonnementTypes = [
  { value: 'foot', label: 'Football' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
];

const joursOptions = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [type, setType] = useState('');
  const [terrainId, setTerrainId] = useState<number | null>(null);
  const [prix, setPrix] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [jourSemaine, setJourSemaine] = useState<number | null>(null);
  const [heureFixe, setHeureFixe] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTel, setClientTel] = useState('');

  const { data: terrains, isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();

  // Calculer date de fin automatiquement (1 mois après début)
  useEffect(() => {
    if (dateDebut) {
      const debut = new Date(dateDebut);
      const fin = addMonths(debut, 1);
      setDateFin(format(fin, 'yyyy-MM-dd'));
    } else {
      setDateFin('');
    }
  }, [dateDebut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !terrainId || !prix || !dateDebut || !dateFin || jourSemaine === null || !heureFixe || !clientNom || !clientEmail || !clientTel) {
      return;
    }

    // Utilisation d'un type id factice ou mapping si besoin
    createAbonnement.mutate({
      abonnement_type_id: 0, // Plus utilisé, à ignorer côté backend si possible
      terrain_id: terrainId,
      date_debut: dateDebut,
      date_fin: dateFin,
      jour_semaine: jourSemaine,
      heure_fixe: heureFixe,
      duree_seance: 1, // Valeur par défaut, ignorée
      client_nom: clientNom,
      client_email: clientEmail,
      client_tel: clientTel,
      statut: 'actif',
      // + Nouveau champ montant si backend l'accepte ; 
      // sinon à exploiter côté stats/affichage
      montant: parseFloat(prix),
      type_sport: type,
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Ajouter un Abonnement</h2>
      <div>
        <Label htmlFor="type">Type d'abonnement</Label>
        <Select
          value={type}
          onValueChange={setType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type (sport)" />
          </SelectTrigger>
          <SelectContent>
            {abonnementTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="prix">Montant de l'abonnement (DT)</Label>
        <Input
          id="prix"
          type="number"
          min="0"
          step="0.1"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
          placeholder="Montant en dinars"
        />
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
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jourSemaine">Jour de la semaine</Label>
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
          <Label htmlFor="heureFixe">Heure</Label>
          <Input
            id="heureFixe"
            type="time"
            value={heureFixe}
            onChange={(e) => setHeureFixe(e.target.value)}
            required
          />
        </div>
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
          ) : "Créer l'abonnement"}
        </Button>
      </div>
    </form>
  );
};

export default AbonnementForm;
