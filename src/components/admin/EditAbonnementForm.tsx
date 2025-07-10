import { useState, useMemo, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useUpdateAbonnement } from '@/hooks/useAbonnements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import TerrainSelector from '@/components/TerrainSelector';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { Abonnement } from '@/lib/supabase';

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
    dt.setMinutes(dt.getMinutes() + 90);
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
  const [clientNom, setClientNom] = useState(abonnement.client_nom);
  const [clientTel, setClientTel] = useState(abonnement.client_tel || '');
  const [statut, setStatut] = useState<Abonnement['statut']>(abonnement.statut);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const updateAbonnement = useUpdateAbonnement();

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

  // Déterminer s'il s'agit de foot à 6, 7 ou 8
  const isFoot6 = selectedTerrain?.type === 'foot' && selectedTerrain.nom.includes('6');
  const isFoot7or8 = selectedTerrain?.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8'));

  // Générer les créneaux horaires
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

  // Pour l'édition, on permet tous les créneaux
  const isTimeSlotAvailable = (time: string) => {
    return true; // En édition, on permet de changer l'heure
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

      {/* Heure */}
      {selectedTerrainId && (
        <div>
          <Label htmlFor="heure">Heure de la séance *</Label>
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
          <option value="annule">Annulé</option>
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
