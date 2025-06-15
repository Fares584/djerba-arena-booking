import { useState, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import TerrainSelector from '@/components/TerrainSelector';

// Options pour la durée (pour futurs usages)
const dureeOptions = [
  { value: '1', label: '1 heure' },
  { value: '1.5', label: '1h30' },
  { value: '2', label: '2 heures' },
  { value: '3', label: '3 heures' },
];

// Types locaux
interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  // Nouveaux états pour suivre la logique "réservation"
  const [selectedType, setSelectedType] = useState<string>(''); // foot, tennis, padel
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [montant, setMontant] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [heure, setHeure] = useState('');
  const [duree, setDuree] = useState('1');
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Chargement données supabase
  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const { data: abonnementTypes = [] } = useAbonnementTypes({ actif: true });
  const createAbonnement = useCreateAbonnement();

  // Filtrer les terrains selon le type choisi
  const filteredTerrains = selectedType
    ? allTerrains.filter(t => t.type === selectedType)
    : [];

  // Sélection d'un terrain => facultatif, il est réinitialisé si le type change
  useEffect(() => {
    setSelectedTerrainId(null);
  }, [selectedType]);

  // Trouver l'abonnementType correspondant au type de terrain
  const abonnementTypeId: number | null = (() => {
    const typeName =
      selectedType === 'foot'
        ? 'abonnement mensuel foot'
        : selectedType === 'tennis'
        ? 'abonnement mensuel tennis'
        : selectedType === 'padel'
        ? 'abonnement mensuel padel'
        : '';
    const found = abonnementTypes.find(t => t.nom.toLowerCase() === typeName);
    return found ? found.id : null;
  })();

  // Validation minimale
  const prixNum = Number(montant);
  const dureeNum = Number(duree);
  const isValid =
    abonnementTypeId !== null &&
    selectedTerrainId !== null &&
    !!montant &&
    !isNaN(prixNum) &&
    prixNum > 0 &&
    !!dateDebut &&
    !!dateFin &&
    !!heure &&
    !!clientNom.trim() &&
    !!clientEmail.trim() &&
    !!clientTel.trim() &&
    dureeNum > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValid) {
      setFormError('Merci de remplir correctement tous les champs obligatoires.');
      import('sonner').then(({ toast }) => {
        toast.error('Merci de remplir correctement tous les champs.');
      });
      return;
    }

    createAbonnement.mutate(
      {
        abonnement_type_id: abonnementTypeId!,
        terrain_id: selectedTerrainId!,
        date_debut: dateDebut,
        date_fin: dateFin,
        jour_semaine: undefined, // à ignorer avec ce mode simple
        heure_fixe: heure,
        duree_seance: dureeNum,
        client_nom: clientNom.trim(),
        client_email: clientEmail.trim(),
        client_tel: clientTel.trim(),
        statut: 'actif',
      },
      {
        onSuccess: () => {
          setFormError(null);
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <h2 className="text-xl font-semibold mb-4">Créer un Abonnement</h2>

      {formError && <div className="bg-red-100 text-red-700 rounded p-2 text-sm">{formError}</div>}

      {/* Etape 1: Choix du type de terrain */}
      <ReservationTypeSelector
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* Etape 2: Choix du terrain */}
      {selectedType && (
        <div>
          <Label>Choisissez le terrain</Label>
          <TerrainSelector
            terrains={filteredTerrains}
            selectedTerrainId={selectedTerrainId}
            onTerrainSelect={setSelectedTerrainId}
          />
        </div>
      )}

      {/* Montant & période */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="montant">Montant (DT)</Label>
          <Input
            id="montant"
            type="number"
            min="0"
            step="0.1"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            required
            placeholder="Montant en dinars"
          />
        </div>
        <div>
          <Label htmlFor="duree">Durée de la séance (heures)</Label>
          <select
            id="duree"
            value={duree}
            onChange={e => setDuree(e.target.value)}
            className="w-full py-2 px-3 border rounded"
            required
          >
            {dureeOptions.map(opt => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Période: dates et heure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="dateDebut">Date de début</Label>
          <Input
            id="dateDebut"
            type="date"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="dateFin">Date de fin</Label>
          <Input
            id="dateFin"
            type="date"
            value={dateFin}
            onChange={e => setDateFin(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="heure">Heure de la séance</Label>
          <Input
            id="heure"
            type="time"
            value={heure}
            onChange={e => setHeure(e.target.value)}
            required
          />
        </div>
      </div>
      {/* Infos client */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div>
          <Label htmlFor="clientNom">Nom du client</Label>
          <Input
            id="clientNom"
            type="text"
            value={clientNom}
            onChange={e => setClientNom(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientEmail">Email du client</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={e => setClientEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientTel">Téléphone du client</Label>
          <Input
            id="clientTel"
            type="tel"
            value={clientTel}
            onChange={e => setClientTel(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={createAbonnement.isPending || !isValid}
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
