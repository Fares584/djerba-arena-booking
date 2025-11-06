import { useState, useMemo, useRef, useEffect } from 'react';
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

interface AbonnementFormProps {
  onSuccess: () => void;
}

const AbonnementForm = ({ onSuccess }: AbonnementFormProps) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear] = useState<number>(currentYear);
  const [selectedJourSemaine, setSelectedJourSemaine] = useState<number | null>(null);
  const [heure, setHeure] = useState('');
  const [duration, setDuration] = useState('1.5');
  const [clientNom, setClientNom] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Refs for auto-scrolling
  const formContainerRef = useRef<HTMLFormElement>(null);
  const monthSectionRef = useRef<HTMLDivElement>(null);
  const dayOfWeekSectionRef = useRef<HTMLDivElement>(null);
  const timeSectionRef = useRef<HTMLDivElement>(null);
  const clientSectionRef = useRef<HTMLDivElement>(null);

  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const createAbonnement = useCreateAbonnement();
  const { data: reservations = [] } = useReservations();
  const { data: abonnements = [] } = useAbonnements();

  // Auto-scroll function modifiée pour utiliser le conteneur du dialogue
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      if (ref.current && formContainerRef.current) {
        const dialogContent = formContainerRef.current.closest('[role="dialog"]');
        if (dialogContent) {
          const element = ref.current;
          const containerRect = dialogContent.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          // Calculer la position relative dans le conteneur du dialogue
          const relativeTop = elementRect.top - containerRect.top;
          const offset = 20; // Petit offset pour éviter que l'élément soit collé au bord
          
          dialogContent.scrollTo({
            top: dialogContent.scrollTop + relativeTop - offset,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  };

  // Auto-scroll when terrain is selected
  useEffect(() => {
    if (selectedTerrainId) {
      scrollToSection(monthSectionRef);
    }
  }, [selectedTerrainId]);

  // Auto-scroll when day of week is selected
  useEffect(() => {
    if (selectedJourSemaine !== null) {
      scrollToSection(timeSectionRef);
    }
  }, [selectedJourSemaine]);

  // Auto-scroll when time is selected
  useEffect(() => {
    if (heure) {
      scrollToSection(clientSectionRef);
    }
  }, [heure]);

  // Filtrage des terrains selon le type choisi
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
    console.log('Génération des créneaux - Terrain:', selectedTerrain?.nom);
    console.log('Jour sélectionné:', selectedJourSemaine);
    console.log('Est samedi:', selectedJourSemaine === 6);
    console.log('Est foot 6:', isFoot6);
    console.log('Est foot 7/8:', isFoot7or8);
    
    if (!selectedTerrain) return [];
    
    if (selectedTerrain.type === 'foot') {
      // Tous les terrains de foot : de 17:00 à 23:30 avec pas de 30 minutes
      console.log('Créneaux foot - 17h00-23h30');
      return generateTimeSlotsForFoot(17, 0, 23, 30);
    }
    
    console.log('Créneaux par défaut');
    return defaultTimeSlots;
  }, [selectedTerrain, selectedJourSemaine, isFoot, isFoot6, isFoot7or8]);

  // Reset de l'heure quand les créneaux changent
  const previousTimeSlotsRef = useMemo(() => {
    if (timeSlotsForSelectedTerrain.length > 0 && !timeSlotsForSelectedTerrain.includes(heure)) {
      setHeure('');
    }
    return timeSlotsForSelectedTerrain;
  }, [timeSlotsForSelectedTerrain, heure]);

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedTerrainId || !time || selectedJourSemaine === null) return false;

    // Anti-fragmentation seulement pour les terrains de foot
    const applyAntiFrag = selectedTerrain?.type === 'foot';

    // Convertir l'heure en nombre décimal (19:30 -> 19.5)
    const timeToDecimal = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    };

    const startHour = timeToDecimal(time);
    const effectiveDuration = parseFloat(duration);
    const endHour = startHour + effectiveDuration;

    // 1. Vérifier les conflits directs avec les réservations existantes pour ce mois
    const reservationConflict = reservations.some(res => {
      const resDate = new Date(res.date);
      const resMonth = resDate.getMonth() + 1;
      const resYear = resDate.getFullYear();
      const resDay = resDate.getDay();
      
      if (res.terrain_id !== selectedTerrainId ||
          resMonth !== selectedMonth ||
          resYear !== selectedYear ||
          resDay !== selectedJourSemaine ||
          res.statut === 'annulee') {
        return false;
      }

      const resStartHour = timeToDecimal(res.heure);
      const resEndHour = resStartHour + res.duree;
      
      // Vérifier le chevauchement
      return startHour < resEndHour && resStartHour < endHour;
    });

    if (reservationConflict) return false;

    // 2. Vérifier les conflits avec les abonnements existants
    const abonnementConflict = abonnements.some(abo => {
      if (abo.terrain_id !== selectedTerrainId ||
          abo.mois_abonnement !== selectedMonth ||
          abo.annee_abonnement !== selectedYear ||
          abo.jour_semaine !== selectedJourSemaine ||
          abo.statut !== 'actif' ||
          !abo.heure_fixe) {
        return false;
      }

      const aboStartHour = timeToDecimal(abo.heure_fixe);
      const aboDuration = abo.duree || 1.5;
      const aboEndHour = aboStartHour + aboDuration;
      
      // Vérifier le chevauchement
      return startHour < aboEndHour && aboStartHour < endHour;
    });

    if (abonnementConflict) return false;

    // 3. Anti-fragmentation (seulement pour les terrains de foot)
    if (applyAntiFrag) {
      // Combiner toutes les réservations et abonnements pour ce jour
      const allOccupiedSlots = [
        ...reservations
          .filter(res => {
            const resDate = new Date(res.date);
            const resMonth = resDate.getMonth() + 1;
            const resYear = resDate.getFullYear();
            const resDay = resDate.getDay();
            return res.terrain_id === selectedTerrainId &&
              resMonth === selectedMonth &&
              resYear === selectedYear &&
              resDay === selectedJourSemaine &&
              res.statut !== 'annulee';
          })
          .map(res => ({
            start: timeToDecimal(res.heure),
            end: timeToDecimal(res.heure) + res.duree
          })),
        ...abonnements
          .filter(abo => 
            abo.terrain_id === selectedTerrainId &&
            abo.mois_abonnement === selectedMonth &&
            abo.annee_abonnement === selectedYear &&
            abo.jour_semaine === selectedJourSemaine &&
            abo.statut === 'actif' &&
            abo.heure_fixe
          )
          .map(abo => ({
            start: timeToDecimal(abo.heure_fixe!),
            end: timeToDecimal(abo.heure_fixe!) + (abo.duree || 1.5)
          }))
      ].sort((a, b) => a.start - b.start);

      // Anti-fragmentation améliorée: trouver le prochain créneau DISPONIBLE dans la liste
      const nextAvailableSlot = timeSlotsForSelectedTerrain.find(slot => {
        const slotTime = timeToDecimal(slot);
        
        // Le créneau doit être après la fin de notre réservation
        if (slotTime <= endHour) return false;
        
        // Vérifier si ce créneau est libre (pas occupé par une réservation/abonnement)
        const isSlotFree = !allOccupiedSlots.some(occupied => {
          return occupied.start < slotTime + effectiveDuration && occupied.end > slotTime;
        });
        
        return isSlotFree;
      });
      
      // Si on trouve un prochain créneau disponible
      if (nextAvailableSlot) {
        const nextSlotTime = timeToDecimal(nextAvailableSlot);
        const gap = nextSlotTime - endHour;
        
        // Si le gap est exactement de 30 minutes (0.5 heures), bloquer ce créneau
        if (gap === 0.5) {
          return false;
        }
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

    createAbonnement.mutate(
      {
        terrain_id: selectedTerrainId!,
        mois_abonnement: selectedMonth,
        annee_abonnement: selectedYear,
        jour_semaine: selectedJourSemaine,
        heure_fixe: heure,
        duree: parseFloat(duration),
        client_nom: clientNom.trim(),
        client_tel: clientTel.trim() || null,
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
    <form ref={formContainerRef} onSubmit={handleSubmit} className="space-y-6 py-4">
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

      {/* Sélection du mois d'abonnement */}
      {selectedTerrainId && (
        <div ref={monthSectionRef}>
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
      )}

      {/* Jour de la semaine */}
      {selectedTerrainId && (
        <div ref={dayOfWeekSectionRef}>
          <Label htmlFor="jourSemaine">Jour de la semaine *</Label>
          <select
            id="jourSemaine"
            className="w-full border rounded-md p-2 h-9 mt-1"
            value={selectedJourSemaine !== null ? selectedJourSemaine : ""}
            onChange={e => {
              const newVal = e.target.value === "" ? null : Number(e.target.value);
              console.log('Changement jour semaine:', newVal);
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
      )}

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
      {selectedTerrainId && selectedJourSemaine !== null && (
        <div ref={timeSectionRef}>
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
      {heure && (
        <div ref={clientSectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
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
      )}

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
