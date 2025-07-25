import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTerrains } from '@/hooks/useTerrains';
import { useCreateReservation } from '@/hooks/useReservations';
import { useAvailability } from '@/hooks/useAvailability';
import { useAppSetting } from '@/hooks/useAppSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, Clock, User, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import TerrainSelector from '@/components/TerrainSelector';
import { calculatePrice, isNightTime } from '@/lib/supabase';
import ReservationDatePicker from "@/components/ReservationDatePicker";
import ReservationSuccessDialog from "@/components/ReservationSuccessDialog";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import ReservationSummary from "@/components/ReservationSummary";
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import ReservationFieldSelector from '@/components/reservation/ReservationFieldSelector';
import ReservationDateTimeSelector from '@/components/reservation/ReservationDateTimeSelector';
import ReservationDurationSelector from '@/components/reservation/ReservationDurationSelector';
import ReservationCustomerInfo from '@/components/reservation/ReservationCustomerInfo';
import { validateName, validateTunisianPhone, validateEmail } from '@/lib/validation';

// Créneaux horaires par défaut (pour terrains autres que foot à 7 ou 8)
const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Options de durée étendues pour tennis et padel
const extendedDurationOptions = [
  { value: '1', label: '1 heure' },
  { value: '1.5', label: '1h30' },
  { value: '2', label: '2 heures' },
  { value: '2.5', label: '2h30' },
  { value: '3', label: '3 heures' },
];

const Reservation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form state
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // -------- 1. Declare hooks first, so allTerrains exists! -----------
  const { data: allTerrains, isLoading: terrainsLoading } = useTerrains({ actif: true });
  const { data: nightTimeSetting } = useAppSetting('heure_debut_nuit_globale');
  const createReservation = useCreateReservation({
    onSuccess: () => {
      setShowSuccessDialog(true);
    },
  });

  // ------ Gestion chaînée de la sélection initiale du terrain ----------
  const [urlFieldId, setUrlFieldId] = useState<number | null>(null);
  const initialTerrainSelectedRef = useRef(false);

  // Récupère l'id terrain passé dans l'URL à l'arrivée
  useEffect(() => {
    const fieldId = searchParams.get('fieldId');
    if (fieldId) {
      setUrlFieldId(Number(fieldId));
    }
  }, [searchParams]);

  // Si URL fieldId détecté → trouve le terrain dans la liste une fois chargée
  useEffect(() => {
    if (!allTerrains || !urlFieldId) return;
    const t = allTerrains.find(tr => tr.id === urlFieldId);
    if (t && selectedType !== t.type) {
      setSelectedType(t.type);
      // On attend que le type soit bien assigné avant de continuer
    }
  }, [allTerrains, urlFieldId]);

  // Dès que le type est défini, synchronise la sélection du terrain une seule fois
  useEffect(() => {
    if (
      !allTerrains ||
      !urlFieldId ||
      !selectedType ||
      initialTerrainSelectedRef.current
    )
      return;
    const t = allTerrains.find(
      (tr) => tr.id === urlFieldId && tr.type === selectedType
    );
    if (t) {
      setSelectedTerrainId(t.id);
      initialTerrainSelectedRef.current = true;
    }
  }, [allTerrains, selectedType, urlFieldId]);

  // Si l'utilisateur choisit manuellement un type, on réinitialise le terrain (sauf pour sélection auto au mount)
  useEffect(() => {
    if (!initialTerrainSelectedRef.current) {
      setSelectedTerrainId(null);
    }
  }, [selectedType]);

  // Hooks
  const { data: availability, isLoading: availabilityLoading } = useAvailability({
    terrainId: selectedTerrainId,
    date: selectedDate,
    enabled: !!(selectedTerrainId && selectedDate)
  });

  // Check if selected time slot is available
  const isTimeSlotAvailable = (time: string): boolean => {
    if (!availability || !selectedTerrainId) return true;
    
    const effectiveDuration = parseFloat(getEffectiveDuration());
    const timeHour = parseInt(time.split(':')[0]);
    const timeMinutes = parseInt(time.split(':')[1]);
    const startTime = timeHour + timeMinutes / 60;
    const endTime = startTime + effectiveDuration;
    
    return !availability.some(reservation => {
      const resHour = parseInt(reservation.heure.split(':')[0]);
      const resMinutes = parseInt(reservation.heure.split(':')[1]);
      const resStart = resHour + resMinutes / 60;
      const resEnd = resStart + reservation.duree;
      
      return !(endTime <= resStart || startTime >= resEnd);
    });
  };

  // Calcul du prix total avec gestion correcte pour les terrains de foot
  const calculateTotalPrice = (): number => {
    if (!selectedTerrain || !selectedTime) return 0;

    const effectiveDuration = parseFloat(getEffectiveDuration());
    const globalNightStartTime = nightTimeSetting?.setting_value || '17:00';

    // Pour les terrains de football : tarif fixe pour 1h30, pas de calcul par heure
    if (selectedTerrain.type === 'foot') {
      return calculatePrice(selectedTerrain, selectedTime, globalNightStartTime);
    }

    // Pour les autres terrains (tennis, padel) : calcul par heure
    let total = 0;
    let timeHour = parseInt(selectedTime.split(':')[0], 10);
    let timeMinute = parseInt(selectedTime.split(':')[1], 10);

    for (let i = 0; i < effectiveDuration; i++) {
      const slotTime = 
        timeHour.toString().padStart(2, '0') + ':' + 
        timeMinute.toString().padStart(2, '0');
      total += calculatePrice(selectedTerrain, slotTime, globalNightStartTime);

      // Avance de 1h pour chaque unité d'heure supplémentaire
      let newDate = new Date(2000, 0, 1, timeHour, timeMinute);
      newDate.setHours(newDate.getHours() + 1);
      timeHour = newDate.getHours();
      timeMinute = newDate.getMinutes();
    }
    return total;
  };

  // Memoized/computed values related to terrain selection and slot calculation
  const filteredTerrains = allTerrains?.filter(terrain => 
    selectedType === '' || terrain.type === selectedType
  ) || [];

  const selectedTerrain = allTerrains?.find(t => t.id === selectedTerrainId);

  // Helper: détermine si le terrain sélectionné est Foot à 6, 7 ou 8
  const isFoot6 = !!(selectedTerrain && selectedTerrain.type === 'foot' && selectedTerrain.nom.includes('6'));
  const isFoot7or8 = !!(selectedTerrain && selectedTerrain.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8')));

  // Get effective duration - ALWAYS 1.5 for football
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5'; // Football always 1.5 hours
    }
    return duration;
  };

  // Fonction générique pour générer les slots pour foot à 6, 7 et 8
  // Pour foot à 6 : 9:00 à 22:30 (sauf samedi: 10:00 à 23:30), pour foot à 7/8 : 10:00 à 23:30, pas de 1h30
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

  // Détermine dynamiquement les créneaux horaires selon le type de terrain sélectionné
  const timeSlotsForSelectedTerrain = React.useMemo(() => {
    if (isFoot6) {
      // Vérifier si c'est un samedi (jour 6 de la semaine)
      const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
      const isSaturday = selectedDateObj && selectedDateObj.getDay() === 6;
      
      if (isSaturday) {
        // Samedi : de 10:00 à 23:30 pour Foot à 6
        return generateTimeSlotsForFoot(10, 0, 23, 30);
      } else {
        // Autres jours : de 09:00 à 22:30 pour Foot à 6
        return generateTimeSlotsForFoot(9, 0, 22, 30);
      }
    }
    if (isFoot7or8) {
      // Foot à 7/8 : de 10:00 à 23:30 (inchangé)
      return generateTimeSlotsForFoot(10, 0, 23, 30);
    }
    // Pour les autres terrains, on retourne les créneaux standards
    return defaultTimeSlots;
  }, [isFoot6, isFoot7or8, selectedDate]);

  // Update duration when terrain changes
  useEffect(() => {
    if (selectedTerrain?.type === 'foot') {
      setDuration('1.5');
    }
  }, [selectedTerrain]);

  // Reset selected time when date changes for foot 6 terrain
  useEffect(() => {
    if (isFoot6) {
      setSelectedTime('');
    }
  }, [selectedDate, isFoot6]);

  const today = new Date().toISOString().split('T')[0];

  // --- Modification de handleSubmit avec validation ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs
    const nameError = validateName(customerName);
    const phoneError = validateTunisianPhone(customerPhone);
    const emailError = validateEmail(customerEmail);

    if (nameError || phoneError || emailError) {
      if (nameError) toast.error(`Nom: ${nameError}`);
      if (phoneError) toast.error(`Téléphone: ${phoneError}`);
      if (emailError) toast.error(`Email: ${emailError}`);
      return;
    }

    // Ensure required fields are filled
    if (
      !selectedTerrainId ||
      !selectedDate ||
      !selectedTime ||
      !customerName ||
      !customerPhone ||
      !customerEmail
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Check slot availability
    if (!isTimeSlotAvailable(selectedTime)) {
      toast.error("Ce créneau horaire n'est pas disponible.");
      return;
    }

    const effectiveDuration = parseFloat(getEffectiveDuration());

    // Créer la réservation avec statut "en_attente"
    createReservation.mutate({
      nom_client: customerName,
      tel: customerPhone,
      email: customerEmail,
      terrain_id: selectedTerrainId,
      date: selectedDate,
      heure: selectedTime,
      duree: effectiveDuration,
      statut: "en_attente", // Statut en attente
    });
  };

  // Quand l'utilisateur clique sur "OK", fermer la popup et rediriger vers l'accueil
  const handleDialogOk = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

  return (
    <>
      <Navbar />
      
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Réserver un Terrain</h1>
          <p className="text-xl max-w-2xl">
            Réservez facilement votre terrain préféré en quelques étapes simples.
          </p>
        </div>
      </div>

      <section className="section-padding bg-sport-gray">
        <div className="container-custom max-w-4xl">
          {/* Alert Message */}
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 space-y-3">
              <div>
                <strong>Important :</strong> Veuillez vérifier attentivement votre nom et votre numéro de téléphone avant d'envoyer le formulaire. 
                En cas de numéro incorrect ou manquant, nous ne pourrons pas vous contacter pour la confirmation et votre réservation sera automatiquement annulée.
              </div>
              <div className="border-t border-orange-300 pt-3">
                <strong>Annulation :</strong> En cas d'annulation, veuillez nous contacter <strong>au moins 48h à l'avance</strong> au : 
                <span className="font-bold ml-1">📞 29 612 809</span>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Type Selection */}
            <ReservationTypeSelector
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
            {/* Terrain Selection */}
            {selectedType && (
              <ReservationFieldSelector
                selectedType={selectedType}
                terrainsLoading={terrainsLoading}
                filteredTerrains={filteredTerrains}
                selectedTerrainId={selectedTerrainId}
                setSelectedTerrainId={setSelectedTerrainId}
              />
            )}
            {/* Date and Time Selection */}
            {selectedTerrainId && (
              <ReservationDateTimeSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                timeSlots={timeSlotsForSelectedTerrain}
                isTimeSlotAvailable={isTimeSlotAvailable}
                availabilityLoading={availabilityLoading}
                selectedTerrainId={selectedTerrainId}
              />
            )}
            {/* Duration Selection - Only for non-football terrains */}
            {selectedTerrain && selectedTerrain.type !== 'foot' && (
              <ReservationDurationSelector
                selectedTerrain={selectedTerrain}
                duration={duration}
                setDuration={setDuration}
                durationOptions={extendedDurationOptions}
              />
            )}
            {/* Duration Display for Football */}
            {selectedTerrain && selectedTerrain.type === 'foot' && (
              <div className="mb-8">
                <Label className="text-lg font-semibold mb-2 block">
                  Durée de la réservation
                </Label>
                <div className="w-full border rounded-md p-3 bg-gray-100 text-gray-700 flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  1h30 (durée fixe pour le football)
                </div>
              </div>
            )}
            {/* Customer Information */}
            <ReservationCustomerInfo
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
            />
            {/* Price Summary */}
            {selectedTerrain && selectedTime && (
              <ReservationSummary
                terrain={selectedTerrain}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                duration={getEffectiveDuration()}
                totalPrice={calculateTotalPrice()}
              />
            )}
            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={createReservation.isPending || !selectedTerrainId}
                className="w-full sm:w-auto bg-sport-green hover:bg-sport-dark text-white px-8 py-3 text-lg"
              >
                {createReservation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer'
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <ReservationSuccessDialog
        open={showSuccessDialog}
        onOk={handleDialogOk}
      />

      <Footer />
    </>
  );
};

export default Reservation;
