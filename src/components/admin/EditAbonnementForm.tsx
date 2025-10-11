import { useState, useMemo, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useUpdateAbonnement } from '@/hooks/useAbonnements';
import { useAvailability } from '@/hooks/useAvailability';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import TerrainSelector from '@/components/TerrainSelector';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { Abonnement } from '@/lib/supabase';
import { format, addDays } from 'date-fns';

const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

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
    dt.setMinutes(dt.getMinutes() + 30);
  }
  return slots;
};

const weekDays = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

interface EditAbonnementFormProps {
  abonnement: Abonnement;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditAbonnementForm = ({ abonnement, onSuccess, onCancel }: EditAbonnementFormProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(abonnement.terrain_id || null);
  const [selectedMonth, setSelectedMonth] = useState<number>(abonnement.mois_abonnement);
  const [selectedYear] = useState<number>(abonnement.annee_abonnement);
  const [selectedJourSemaine, setSelectedJourSemaine] = useState<number | null>(abonnement.jour_semaine || null);
  const [heure, setHeure] = useState(abonnement.heure_fixe || '');
  const [duration, setDuration] = useState(String(abonnement.duree || 1.5));
  const [clientNom, setClientNom] = useState(abonnement.client_nom);
  const [clientTel, setClientTel] = useState(abonnement.client_tel || '');
  const [statut, setStatut] = useState<Abonnement['statut']>(abonnement.statut);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const updateAbonnement = useUpdateAbonnement();

  // Calculer une date exemple pour vérifier la disponibilité des créneaux
  const exampleDate = useMemo(() => {
    if (selectedJourSemaine === null) return null;
    
    // Trouver le prochain jour correspondant au jour de la semaine sélectionné
    const today = new Date();
    const currentDay = today.getDay();
    let daysToAdd = selectedJourSemaine - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;
    
    return format(addDays(today, daysToAdd), 'yyyy-MM-dd');
  }, [selectedJourSemaine]);

  // Récupérer les réservations pour le terrain et la date exemple
  const { data: reservations = [] } = useAvailability({
    terrainId: selectedTerrainId,
    date: exampleDate,
    enabled: !!selectedTerrainId && !!exampleDate
  });

  // Sélection automatique du type à partir du terrain_id au montage
  useEffect(() => {
    if (abonnement.terrain_id && allTerrains.length > 0) {
      const foundTerrain = allTerrains.find(t => t.id === abonnement.terrain_id);
      if (foundTerrain) {
        setSelectedType(foundTerrain.type);
      }
    }
  }, [abonnement.terrain_id, allTerrains]);

  // Filtrage terrains selon type
  const filteredTerrains = selectedType
    ? allTerrains.filter(t => t.type === selectedType)
    : [];

  // Trouver le terrain sélectionné
  const selectedTerrain = allTerrains.find(t => t.id === selectedTerrainId);

  // Déterminer s'il s'agit de foot à 6, 7 ou 8 avec une logique plus robuste
  const isFoot = selectedTerrain?.type === 'foot';
  const isFoot6 = isFoot && (selectedTerrain?.nom.toLowerCase().includes('6') || selectedTerrain?.nom.toLowerCase().includes('six'));
  const isFoot7or8 = isFoot && (selectedTerrain?.nom.toLowerCase().includes('7') || selectedTerrain?.nom.toLowerCase().includes('8') || selectedTerrain?.nom.toLowerCase().includes('sept') || selectedTerrain?.nom.toLowerCase().includes('huit'));

  // Générer les créneaux horaires selon le terrain et le jour de la semaine
  const timeSlotsForSelectedTerrain = useMemo(() => {
    console.log('Edit - Génération des créneaux - Terrain:', selectedTerrain?.nom);
    console.log('Edit - Jour sélectionné:', selectedJourSemaine);
    console.log('Edit - Est samedi:', selectedJourSemaine === 6);
    console.log('Edit - Est foot 6:', isFoot6);
    console.log('Edit - Est foot 7/8:', isFoot7or8);
    
    if (!selectedTerrain) return [];
    
    if (selectedTerrain.type === 'foot') {
      // Tous les terrains de foot : de 17:00 à 23:30 avec pas de 30 minutes
      console.log('Edit - Créneaux foot - 17h00-23h30');
      return generateTimeSlotsForFoot(17, 0, 23, 30);
    }
    
    console.log('Edit - Créneaux par défaut');
    return defaultTimeSlots;
  }, [selectedTerrain, selectedJourSemaine, isFoot, isFoot6, isFoot7or8]);

  // Reset de l'heure quand les créneaux changent et que l'heure actuelle n'est plus disponible
  useEffect(() => {
    if (timeSlotsForSelectedTerrain.length > 0 && heure && !timeSlotsForSelectedTerrain.includes(heure)) {
      console.log('Reset heure car non disponible dans les nouveaux créneaux');
      setHeure('');
    }
  }, [timeSlotsForSelectedTerrain, heure]);

  // Vérifier la disponibilité des créneaux en excluant les réservations de l'abonnement actuel
  const isTimeSlotAvailable = (time: string) => {
    if (!selectedTerrainId || !exampleDate) return true;

    // Filtrer les réservations pour exclure celles de l'abonnement en cours de modification
    const otherReservations = reservations.filter(r => 
      r.abonnement_id !== abonnement.id && 
      (r.statut === 'en_attente' || r.statut === 'confirmee')
    );

    // Convertir l'heure en minutes pour une comparaison plus précise
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const durationInMinutes = parseFloat(duration) * 60; // Utiliser la durée sélectionnée
    const endTimeInMinutes = startTimeInMinutes + durationInMinutes;

    for (const reservation of otherReservations) {
      const [resHour, resMinute] = reservation.heure.split(':').map(Number);
      const resStartTimeInMinutes = resHour * 60 + resMinute;
      const resDurationInMinutes = reservation.duree * 60;
      const resEndTimeInMinutes = resStartTimeInMinutes + resDurationInMinutes;

      // Vérifier les chevauchements avec une logique plus précise
      const hasOverlap = (
        (startTimeInMinutes < resEndTimeInMinutes) && 
        (endTimeInMinutes > resStartTimeInMinutes)
      );

      if (hasOverlap) {
        return false;
      }
    }

    return true;
  };

  const isValid =
    selectedType &&
    selectedTerrainId &&
    selectedMonth &&
    selectedJourSemaine !== null &&
    !!heure &&
    !!clientNom.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValid || selectedJourSemaine === null) {
      setFormError('Merci de remplir correctement tous les champs obligatoires.');
      import('sonner').then(({ toast }) => {
        toast.error('Merci de remplir correctement tous les champs obligatoires.');
      });
      return;
    }

    updateAbonnement.mutate(
      {
        id: abonnement.id,
        updates: {
          terrain_id: selectedTerrainId!,
          mois_abonnement: selectedMonth,
          annee_abonnement: selectedYear,
          jour_semaine: selectedJourSemaine,
          heure_fixe: heure,
          duree: parseFloat(duration),
          client_nom: clientNom.trim(),
          client_tel: clientTel.trim() || null,
          statut: statut
        }
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
      <h2 className="text-xl font-semibold mb-4">Modifier l'Abonnement</h2>
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

      {/* Sélection du mois d'abonnement */}
      <div>
        <Label htmlFor="moisAbonnement">Mois d'abonnement *</Label>
        <select
          id="moisAbonnement"
          className="w-full border rounded-md p-2 h-9 mt-1"
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          required
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>
              {month.label} {selectedYear}
            </option>
          ))}
        </select>
      </div>

      {/* Jour de la semaine */}
      <div>
        <Label htmlFor="jourSemaine">Jour de la semaine *</Label>
        <select
          id="jourSemaine"
          className="w-full border rounded-md p-2 h-9 mt-1"
          value={selectedJourSemaine !== null ? selectedJourSemaine : ""}
          onChange={e => {
            const newVal = e.target.value === "" ? null : Number(e.target.value);
            console.log('Edit - Changement jour semaine:', newVal);
            setSelectedJourSemaine(newVal);
          }}
          required
        >
          <option value="" disabled>Sélectionnez un jour</option>
          {weekDays.map(day => (
            <option key={day.value} value={day.value}>{day.label}</option>
          ))}
        </select>
      </div>

      {/* Durée pour tennis/padel */}
      {selectedTerrainId && selectedTerrain?.type !== 'foot' && (
        <div>
          <Label htmlFor="duration">Durée de la séance *</Label>
          <select
            id="duration"
            className="w-full border rounded-md p-2 h-9 mt-1"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            required
          >
            <option value="1">1 heure</option>
            <option value="1.5">1h30</option>
            <option value="2">2 heures</option>
            <option value="2.5">2h30</option>
            <option value="3">3 heures</option>
          </select>
        </div>
      )}

      {/* Heure */}
      {selectedTerrainId && (
        <div>
          <Label htmlFor="heure">Heure de la séance *</Label>
          <div className="mt-1 mb-2 text-sm text-gray-600">
            Créneaux disponibles: {timeSlotsForSelectedTerrain.length} 
            {selectedJourSemaine === 6 && isFoot && " (Exception samedi appliquée)"}
          </div>
          <TimeSlotSelector
            timeSlots={timeSlotsForSelectedTerrain}
            selectedTime={heure}
            isTimeSlotAvailable={isTimeSlotAvailable}
            onTimeSelect={setHeure}
            loading={false}
          />
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
          <Label htmlFor="clientTel">Téléphone du client</Label>
          <Input
            id="clientTel"
            type="tel"
            value={clientTel}
            onChange={e => setClientTel(e.target.value)}
          />
        </div>
      </div>

      {/* Statut */}
      <div>
        <Label htmlFor="statut" className="text-sm">Statut</Label>
        <select
          id="statut"
          value={statut}
          onChange={e => setStatut(e.target.value as Abonnement['statut'])}
          className="w-full border rounded-md p-2 h-9"
        >
          <option value="actif">Actif</option>
          <option value="expire">Expiré</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
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
          disabled={updateAbonnement.isPending || !isValid}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {updateAbonnement.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Modification...
            </>
          ) : "Valider les modifications"}
        </Button>
      </div>
    </form>
  );
};

export default EditAbonnementForm;
