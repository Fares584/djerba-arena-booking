
import { useState, useEffect, useMemo } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAbonnementTypes } from '@/hooks/useAbonnementTypes';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { format, addMonths, addDays } from 'date-fns';
import TerrainSelector from '@/components/TerrainSelector';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { useReservations } from '@/hooks/useReservations';

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

// Créneaux horaires standards
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [prix, setPrix] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [jourSemaine, setJourSemaine] = useState<number | null>(null);
  const [selectedHeure, setSelectedHeure] = useState<string>('');
  const [clientNom, setClientNom] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTel, setClientTel] = useState('');

  // Récupérer tous les terrains et types d’abonnement actifs
  const { data: terrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const { data: abonnementTypes = [], isLoading: typesLoading } = useAbonnementTypes({ actif: true });
  const createAbonnement = useCreateAbonnement();

  // Pour la récursivité, on charge toutes les réservations de ce terrain pour la période (mois) concernée
  const selectedTerrain = terrains.find(t => t.id === selectedTerrainId);

  // Calcule la première date correspondante au jour de la semaine (répétition hebdomadaire)
  function getRecurringDates(debut: string, fin: string, dayOfWeek: number): string[] {
    if (!debut || !fin || dayOfWeek == null) return [];
    let dates: string[] = [];
    let current = new Date(debut);
    // Avancer jusqu'au premier jour correspondant
    while (current.getDay() !== dayOfWeek) {
      current = addDays(current, 1);
    }
    while (current <= new Date(fin)) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current = addDays(current, 7);
    }
    return dates;
  }

  // Trouver l'abonnementType mensuel correspondant au terrain choisi (foot, tennis, padel)
  let abonnementTypeId: number | null = null;
  if (selectedTerrain && abonnementTypes.length > 0) {
    const terrainType = selectedTerrain.type?.toLowerCase();
    const typeName =
      terrainType === 'foot'
        ? 'abonnement mensuel foot'
        : terrainType === 'tennis'
        ? 'abonnement mensuel tennis'
        : terrainType === 'padel'
        ? 'abonnement mensuel padel'
        : '';
    const typeObj = abonnementTypes.find((t) => t.nom.toLowerCase() === typeName);
    abonnementTypeId = typeObj ? typeObj.id : null;
  }

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

  // Get toutes les réservations existantes sur ce terrain pour les jours (récurrence) qui nous intéressent
  // On charge les réservations pour la période du mois
  const recurringDates = useMemo(() => {
    if (!dateDebut || !dateFin || jourSemaine == null) return [];
    return getRecurringDates(dateDebut, dateFin, jourSemaine);
  }, [dateDebut, dateFin, jourSemaine]);

  // Filtre performant : on charge les réservations de ce terrain pendant la période du mois sélectionné
  const { data: reservations = [] } = useReservations({
    terrain_id: selectedTerrainId ?? undefined,
    // On ne filtre pas par date pour tout avoir sur le mois et pouvoir checker la disponibilité pour chaque date
  });

  // Détermine si un créneau horaire est disponible pour TOUTES les occurrences de l'abonnement sur le mois
  function isTimeSlotFullyAvailable(time: string): boolean {
    if (!selectedTerrainId || !recurringDates.length) return true;
    // Pour chaque date concernée, vérifier que ce créneau n'est PAS déjà réservé
    for (const date of recurringDates) {
      const overlap = reservations.find(
        (r) =>
          r.terrain_id === selectedTerrainId &&
          r.date === date &&
          r.heure === time &&
          (r.statut === 'en_attente' || r.statut === 'confirmee')
      );
      if (overlap) return false;
    }
    return true;
  }

  // Création de l’abonnement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !abonnementTypeId ||
      !selectedTerrainId ||
      !prix ||
      !dateDebut ||
      !dateFin ||
      jourSemaine === null ||
      !selectedHeure ||
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
        heure_fixe: selectedHeure, // Toujours format HH:mm
        duree_seance: 1,
        client_nom: clientNom,
        client_email: clientEmail,
        client_tel: clientTel,
        statut: 'actif',
        // Le prix est uniquement affiché, il n'est pas stocké explicitement dans abonnements.
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
          <TimeSlotSelector
            timeSlots={timeSlots}
            selectedTime={selectedHeure}
            isTimeSlotAvailable={isTimeSlotFullyAvailable}
            onTimeSelect={setSelectedHeure}
            loading={false}
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
