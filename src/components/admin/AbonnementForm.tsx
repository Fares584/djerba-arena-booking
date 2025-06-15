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

// Nouvelle fonction utilitaire pour lister les créneaux à partir d'une heure de début, de fin et d'un pas (en minutes)
function generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
  const result: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    result.push(
      [h.toString().padStart(2, "0"), m.toString().padStart(2, "0")].join(":")
    );
    m += intervalMinutes;
    while (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return result;
}

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

const getTimeSlotsForTerrain = (terrain: any | undefined): string[] => {
  if (!terrain) return timeSlots; // fallback: créneaux standards
  const nom = terrain.nom?.toLowerCase() || "";
  // Foot à 6
  if (terrain.type === "foot" && /6/.test(nom)) {
    return generateTimeSlots("09:00", "22:30", 90);
  }
  // Foot à 7 ou 8
  if (
    terrain.type === "foot" &&
    (/7/.test(nom) || /8/.test(nom))
  ) {
    return generateTimeSlots("10:00", "23:30", 90);
  }
  // Tennis ou padel : 09:00 à 23:00, intervalles standards d’1h
  if (
    (terrain.type === "tennis") ||
    (terrain.type === "padel")
  ) {
    return generateTimeSlots("09:00", "23:00", 60);
  }
  // Par défaut les autres terrains: créneaux standards
  return timeSlots;
};

const AbonnementForm = ({ onSuccess }) => {
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [prix, setPrix] = useState<string>(''); // Ensure type is string for .trim()
  const [dateDebut, setDateDebut] = useState<string>(''); // string
  const [dateFin, setDateFin] = useState<string>(''); // string
  const [jourSemaine, setJourSemaine] = useState<number | null>(null);
  const [selectedHeure, setSelectedHeure] = useState<string>(''); // string
  const [clientNom, setClientNom] = useState<string>(''); // string
  const [clientEmail, setClientEmail] = useState<string>(''); // string
  const [clientTel, setClientTel] = useState<string>(''); // string
  const [dureeSeance, setDureeSeance] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Récupérer tous les terrains et types d’abonnement actifs
  const { data: terrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const { data: abonnementTypes = [], isLoading: typesLoading } = useAbonnementTypes({ actif: true });
  const createAbonnement = useCreateAbonnement();

  // Pour la récursivité, on charge toutes les réservations de ce terrain pour la période (mois) concernée
  const selectedTerrain = terrains.find(t => t.id === selectedTerrainId);

  // Définir dynamiquement les slots selon le terrain sélectionné
  const dynamicTimeSlots = getTimeSlotsForTerrain(selectedTerrain);

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

  // Nouvelle logique : détection type de terrain
  const isTennisOrPadel =
    selectedTerrain &&
    (selectedTerrain.type === 'tennis' || selectedTerrain.type === 'padel');

  // Nouvelle logique de validation centralisée
  // On force jourSemaineNum à être un nombre ou null
  let jourSemaineNum: number | null = null;
  if (typeof jourSemaine === "number") {
    jourSemaineNum = jourSemaine;
  } else if (typeof jourSemaine === "string" && jourSemaine.trim() !== "" && !isNaN(Number(jourSemaine))) {
    jourSemaineNum = Number(jourSemaine);
  }

  const prixNum = Number(prix);
  const dureeSeanceNum = Number(dureeSeance);

  // AJOUT DEBUG : voir les valeurs dans la console
  console.log('DEBUG_FORM isValid check', {
    abonnementTypeId,
    selectedTerrainId,
    prixNum,
    prix,
    dateDebut,
    dateFin,
    jourSemaine,
    jourSemaineNum,
    selectedHeure,
    clientNom,
    clientEmail,
    clientTel,
    dureeSeanceNum,
    isTennisOrPadel,
  });

  const isValid =
    abonnementTypeId !== null &&
    selectedTerrainId !== null &&
    !!prix &&
    !isNaN(prixNum) &&
    prixNum > 0 &&
    !!dateDebut &&
    !!dateFin &&
    jourSemaineNum !== null &&
    !isNaN(jourSemaineNum) &&
    !!selectedHeure &&
    !!clientNom.trim() &&
    !!clientEmail.trim() &&
    !!clientTel.trim() &&
    (isTennisOrPadel ? dureeSeanceNum > 0 : true);

  // Montre l'état du isValid dans la page pour aider à débugger (suppprime si tout va bien)
  // Retire ce <div> si tu ne le veux pas en prod !
  // <div className="text-xs text-gray-500">isValid: {isValid ? 'oui' : 'non'}</div>

  // Création de l’abonnement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValid) {
      setFormError("Merci de remplir correctement tous les champs obligatoires.");
      // Affichage d'un toast (avec la lib shadcn/sonner déjà dispo)
      import('sonner').then(({ toast }) => {
        toast.error("Merci de remplir correctement tous les champs du formulaire.");
      });
      return;
    }

    createAbonnement.mutate(
      {
        abonnement_type_id: abonnementTypeId!,
        terrain_id: selectedTerrainId!,
        date_debut: dateDebut,
        date_fin: dateFin,
        jour_semaine: jourSemaineNum!,
        heure_fixe: selectedHeure,
        duree_seance: isTennisOrPadel ? dureeSeanceNum : 1,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Ajouter un Abonnement Mensuel</h2>
      {/* DEBUG ONLY - Retire ce block plus tard */}
      <div className="text-xs text-gray-500">isValid: {isValid ? 'oui' : 'non'}</div>
      {formError && (
        <div className="bg-red-100 text-red-700 rounded p-2 text-sm">{formError}</div>
      )}

      <div>
        <Label>Choisissez votre terrain</Label>
        {terrainsLoading ? (
          <div className="py-8 text-center text-gray-400">Chargement des terrains...</div>
        ) : (
          <TerrainSelector
            terrains={terrains}
            selectedTerrainId={selectedTerrainId}
            onTerrainSelect={newId => {
              setSelectedTerrainId(newId);
              setDureeSeance(1); // reset durée par défaut
            }}
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
            onChange={(e) => setDateFin(e.target.value)}
            required
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
            timeSlots={dynamicTimeSlots}
            selectedTime={selectedHeure}
            isTimeSlotAvailable={isTimeSlotFullyAvailable}
            onTimeSelect={setSelectedHeure}
            loading={false}
          />
        </div>
      </div>

      {/* Ajout: Champ durée UNIQUEMENT pour tennis/padel */}
      {isTennisOrPadel && (
        <div>
          <Label htmlFor="dureeSeance">Durée de la séance (heures)</Label>
          <select
            id="dureeSeance"
            value={dureeSeance}
            onChange={e => setDureeSeance(Number(e.target.value))}
            className="w-full py-2 px-3 border rounded"
            required
          >
            <option value={1}>1 heure</option>
            <option value={2}>2 heures</option>
            <option value={3}>3 heures</option>
          </select>
        </div>
      )}

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
          disabled={createAbonnement.isPending || !isValid || typesLoading}
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
