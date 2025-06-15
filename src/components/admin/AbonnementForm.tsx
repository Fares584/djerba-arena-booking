import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import TerrainSelector from '@/components/TerrainSelector';

// Types locaux pour les jours
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
  // On supprime le type d’abonnement
  // On charge les terrains et les abonnementTypes pour trouver un abonnement_type_id valide
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [prix, setPrix] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [jourSemaine, setJourSemaine] = useState<number | null>(null);
  const [heureFixe, setHeureFixe] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTel, setClientTel] = useState('');
  const { data: terrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const { data: abonnementTypes = [], isLoading: typesLoading } = useAbonnementTypes({ actif: true });
  const createAbonnement = useCreateAbonnement();

  // Prendre l'abonnement_type_id du premier abonnementType dispo, obligatoire pour la BDD
  const abonnementTypeId = abonnementTypes.length > 0 ? abonnementTypes[0].id : null;

  // Calcul automatique de la date de fin (toujours 1 mois après)
  useEffect(() => {
    if (dateDebut) {
      const debut = new Date(dateDebut);
      const fin = addMonths(debut, 1);
      setDateFin(format(fin, 'yyyy-MM-dd'));
    } else {
      setDateFin('');
    }
  }, [dateDebut]);

  // Sécurise le format de l'heure en HH:mm
  function normalizeTime(input: string): string {
    if (!input) return '';
    if (/AM|PM/i.test(input)) {
      const [time, ampm] = input.split(' ');
      let [h, m] = time.split(':');
      let hours = parseInt(h, 10);
      if (/PM/i.test(ampm) && hours < 12) hours += 12;
      if (/AM/i.test(ampm) && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${m}`;
    }
    return input.length === 5 ? input : input.slice(0, 5);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !abonnementTypeId ||
      !selectedTerrainId ||
      !prix ||
      !dateDebut ||
      !dateFin ||
      jourSemaine === null ||
      !heureFixe ||
      !clientNom ||
      !clientEmail ||
      !clientTel
    ) {
      return;
    }
    createAbonnement.mutate(
      {
        abonnement_type_id: abonnementTypeId,
        terrain_id: selectedTerrainId,
        date_debut: dateDebut,
        date_fin: dateFin,
        jour_semaine: jourSemaine,
        heure_fixe: normalizeTime(heureFixe),
        duree_seance: 1,
        client_nom: clientNom,
        client_email: clientEmail,
        client_tel: clientTel,
        statut: "actif",
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Ajouter un Abonnement Mensuel</h2>
      <div>
        <Label>Choisissez votre terrain</Label>
        {terrainsLoading ? (
          <div className="py-8 text-center text-gray-400">Chargement des terrains...</div>
        ) : (
          <TerrainSelector
            terrains={terrains}
            selectedTerrainId={selectedTerrainId}
            onTerrainSelect={setSelectedTerrainId}
          />
        )}
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
          <select
            id="jourSemaine"
            value={jourSemaine !== null ? jourSemaine : ''}
            onChange={(e) => setJourSemaine(e.target.value !== '' ? parseInt(e.target.value) : null)}
            className="w-full py-2 px-3 border rounded"
            required
          >
            <option value="">Sélectionnez un jour</option>
            {joursOptions.map((jour) => (
              <option key={jour.value} value={jour.value}>
                {jour.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="heureFixe">Heure</Label>
          <Input
            id="heureFixe"
            type="time"
            value={heureFixe}
            step="60"
            inputMode="numeric"
            onChange={(e) => setHeureFixe(e.target.value)}
            required
            lang="fr"
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
          disabled={createAbonnement.isPending || typesLoading}
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
