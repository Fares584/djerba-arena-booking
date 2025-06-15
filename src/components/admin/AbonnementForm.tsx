
import { useState, useMemo, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import TerrainSelector from '@/components/TerrainSelector';

const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Génère les créneaux horaires dynamiques pour le football
const generateTimeSlotsForFoot = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
  const slots: string[] = [];
  let dt = new Date(2000, 0, 1, startHour, startMinute);
  const endDt = new Date(2000, 0, 1, endHour, endMinute);
  while (dt <= endDt) {
    slots.push(
      dt.getHours().toString().padStart(2, '0') +
      ':' +
      dt.getMinutes().toString().padStart(2, '0')
    );
    dt.setMinutes(dt.getMinutes() + 90);
  }
  return slots;
};

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [montant, setMontant] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [heure, setHeure] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Récupération des terrains actifs
  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();

  // Filtrage des terrains selon le type choisi
  const filteredTerrains = selectedType
    ? allTerrains.filter(t => t.type === selectedType)
    : [];

  // Reset du terrain sélectionné si on change de type
  useEffect(() => {
    setSelectedTerrainId(null);
    setHeure('');
  }, [selectedType]);

  // Trouver le terrain sélectionné
  const selectedTerrain = allTerrains.find(t => t.id === selectedTerrainId);

  // Déterminer s'il s'agit de foot à 6, 7 ou 8
  const isFoot6 = selectedTerrain?.type === 'foot' && selectedTerrain.nom.includes('6');
  const isFoot7or8 = selectedTerrain?.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8'));

  // Générer les créneaux horaires selon le terrain
  const timeSlotsForSelectedTerrain = useMemo(() => {
    if (!selectedTerrain) return [];
    if (isFoot6) {
      return generateTimeSlotsForFoot(9, 0, 22, 30);
    }
    if (isFoot7or8) {
      return generateTimeSlotsForFoot(10, 0, 23, 30);
    }
    return defaultTimeSlots;
  }, [selectedTerrain, isFoot6, isFoot7or8]);

  // Validation
  const prixNum = Number(montant);
  const isValid =
    selectedType &&
    selectedTerrainId &&
    !!montant &&
    !isNaN(prixNum) && prixNum > 0 &&
    !!dateDebut &&
    !!dateFin &&
    !!heure &&
    !!clientNom.trim() &&
    !!clientTel.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValid) {
      setFormError('Merci de remplir correctement tous les champs obligatoires.');
      import('sonner').then(({ toast }) => {
        toast.error('Merci de remplir correctement tous les champs obligatoires.');
      });
      return;
    }

    createAbonnement.mutate(
      {
        abonnement_type_id: 0, // À modifier selon votre logique back (ex : map type to abonnement_type_id)
        terrain_id: selectedTerrainId!,
        date_debut: dateDebut,
        date_fin: dateFin,
        jour_semaine: undefined,
        heure_fixe: heure,
        duree_seance: undefined,
        client_nom: clientNom.trim(),
        client_email: '', // Champ vide car plus demandé
        client_tel: clientTel.trim(),
        statut: 'actif',
      },
      {
        onSuccess: () => {
          setFormError(null);
          onSuccess();
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <h2 className="text-xl font-semibold mb-4">Créer un Abonnement</h2>
      {formError && <div className="bg-red-100 text-red-700 rounded p-2 text-sm">{formError}</div>}

      {/* Choix du type */}
      <ReservationTypeSelector selectedType={selectedType} setSelectedType={setSelectedType} />

      {/* Choix du terrain */}
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

      {/* Montant */}
      <div>
        <Label htmlFor="montant">Montant (DT) *</Label>
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

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dateDebut">Date de début *</Label>
          <Input
            id="dateDebut"
            type="date"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="dateFin">Date de fin *</Label>
          <Input
            id="dateFin"
            type="date"
            value={dateFin}
            onChange={e => setDateFin(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Heure */}
      {selectedTerrainId && (
        <div>
          <Label htmlFor="heure">Heure de la séance *</Label>
          <select
            id="heure"
            value={heure}
            className="w-full py-2 px-3 border rounded"
            onChange={e => setHeure(e.target.value)}
            required
          >
            <option value="">Sélectionnez une heure</option>
            {timeSlotsForSelectedTerrain.map(ts => (
              <option value={ts} key={ts}>{ts}</option>
            ))}
          </select>
        </div>
      )}

      {/* Infos client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div>
          <Label htmlFor="clientNom">Nom du client *</Label>
          <Input
            id="clientNom"
            type="text"
            value={clientNom}
            onChange={e => setClientNom(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientTel">Téléphone du client *</Label>
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
