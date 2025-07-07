// ✅ Fichier complet : AbonnementForm.tsx (corrigé)

import { useState, useMemo, useEffect } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useCreateAbonnement } from '@/hooks/useAbonnements';
import { useReservations } from '@/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import TerrainSelector from '@/components/TerrainSelector';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { useAbonnements } from '@/hooks/useAbonnements';

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

const footDuration = 1.5;
const otherSportDurations = [
  { value: 1, label: '1 heure' },
  { value: 2, label: '2 heures' },
  { value: 3, label: '3 heures' },
];

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [heure, setHeure] = useState('');
  const [clientNom, setClientNom] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedJourSemaine, setSelectedJourSemaine] = useState<number | null>(null);
  const [dureeSeance, setDureeSeance] = useState<number>(1);

  const { data: allTerrains = [] } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();
  const { data: reservations = [] } = useReservations();
  const { data: abonnements = [] } = useAbonnements();

  const filteredTerrains = selectedType
    ? allTerrains.filter(t => t.type === selectedType)
    : [];

  useEffect(() => {
    setSelectedTerrainId(null);
    setHeure('');
  }, [selectedType]);

  const selectedTerrain = allTerrains.find(t => t.id === selectedTerrainId);
  const isFoot6 = selectedTerrain?.type === 'foot' && selectedTerrain.nom.includes('6');
  const isFoot7or8 = selectedTerrain?.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8'));

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

const isTimeSlotAvailable = (time: string) => {
  if (!selectedTerrainId || !time || selectedJourSemaine === null) return false;

  const [hour, minute] = time.split(':').map(Number);
  const startTime = hour + minute / 60;
  const endTime = startTime + dureeSeance;

  const reservationConflict = reservations.some((res) => {
    if (res.terrain_id !== selectedTerrainId) return false;
    if (res.statut === 'annulee') return false;
    if (res.date < dateDebut || res.date > dateFin) return false;

    const [resHour, resMin] = res.heure.split(':').map(Number);
    const resStart = resHour + resMin / 60;
    const resEnd = resStart + res.duree;

    return !(endTime <= resStart || startTime >= resEnd);
  });

  const abonnementConflict = abonnements.some((abo) => {
    if (abo.terrain_id !== selectedTerrainId) return false;
    if (abo.statut !== 'actif') return false;
    if (Number(abo.jour_semaine) !== Number(selectedJourSemaine)) return false;
    if (abo.date_fin && abo.date_fin < dateDebut) return false;
    if (abo.date_debut && abo.date_debut > dateFin) return false;

    const [aboHour, aboMin] = abo.heure_fixe.split(':').map(Number);
    const aboStart = aboHour + aboMin / 60;
    const aboEnd = aboStart + abo.duree_seance;

    return !(endTime <= aboStart || startTime >= aboEnd);
  });

  return !reservationConflict && !abonnementConflict;
};

    const reservationConflict = reservations.some(
      (res) =>
        res.terrain_id === selectedTerrainId &&
        res.heure === time &&
        (!dateDebut || res.date >= dateDebut) &&
        (!dateFin || res.date <= dateFin) &&
        res.statut !== 'annulee'
    );

    const abonnementConflict = abonnements.some((abo) => {
      const jourAbo = Number(abo.jour_semaine);
      const jourSelectionne = Number(selectedJourSemaine);

      const conflict =
        abo.terrain_id === selectedTerrainId &&
        abo.heure_fixe === time &&
        abo.statut === 'actif' &&
        jourAbo === jourSelectionne &&
        (!dateDebut || !abo.date_fin || abo.date_fin >= dateDebut) &&
        (!dateFin || !abo.date_debut || abo.date_debut <= dateFin);

      if (conflict) {
        console.log('🔴 Conflit détecté avec abonnement:', abo);
      }

      return conflict;
    });

    return !reservationConflict && !abonnementConflict;
  };

  useEffect(() => {
    if (selectedType === 'foot') {
      setDureeSeance(footDuration);
    } else if (selectedType) {
      setDureeSeance(1);
    }
  }, [selectedType]);

  const isValid =
    selectedType &&
    selectedTerrainId &&
    !!dateDebut &&
    !!dateFin &&
    !!heure &&
    selectedJourSemaine !== null &&
    !!clientNom.trim() &&
    !!clientTel.trim() &&
    dureeSeance > 0;

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

    createAbonnement.mutate(
      {
        terrain_id: selectedTerrainId!,
        date_debut: dateDebut,
        date_fin: dateFin,
        jour_semaine: selectedJourSemaine,
        heure_fixe: heure,
        duree_seance: dureeSeance,
        client_nom: clientNom.trim(),
        client_email: '',
        client_tel: clientTel.trim(),
        statut: 'actif'
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

      <ReservationTypeSelector selectedType={selectedType} setSelectedType={setSelectedType} />

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

      <div>
        <Label htmlFor="jourSemaine">Jour de la semaine *</Label>
        <select
          id="jourSemaine"
          className="w-full border rounded-md p-2 h-9 mt-1"
          value={selectedJourSemaine !== null ? selectedJourSemaine : ''}
          onChange={e => setSelectedJourSemaine(Number(e.target.value))}
          required
        >
          <option value="" disabled>Sélectionnez un jour</option>
          {weekDays.map(day => (
            <option key={day.value} value={day.value}>{day.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="dureeSeance">Durée de la séance *</Label>
        {selectedType === 'foot' ? (
          <Input
            id="dureeSeance"
            value="1h30"
            readOnly
            disabled
            className="w-full border rounded-md p-2 h-9 mt-1 bg-gray-100 text-gray-800"
          />
        ) : (
          <select
            id="dureeSeance"
            className="w-full border rounded-md p-2 h-9 mt-1"
            value={dureeSeance}
            onChange={e => setDureeSeance(Number(e.target.value))}
            required
          >
            {otherSportDurations.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>

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
