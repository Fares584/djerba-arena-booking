import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useAppSetting } from '@/hooks/useAppSettings';
import { useCreateReservation } from '@/hooks/useReservations';
import { useReservationSecurity } from '@/hooks/useReservationSecurity';
import { useReservations } from '@/hooks/useReservations';
import { useAbonnements } from '@/hooks/useAbonnements';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isNightTime, calculatePrice } from '@/lib/supabase';
import { validateName, validateTunisianPhone } from '@/lib/validation';
import { toast } from 'sonner';
import ReservationTypeSelector from '@/components/reservation/ReservationTypeSelector';
import TerrainSelector from '@/components/TerrainSelector';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { getDominantStartModulo, timeToMinutes } from '@/lib/antiFragmentation';

interface ReservationFormProps {
  onSuccess: () => void;
}

// Fonction pour générer les créneaux horaires pour le football - pas de 30 minutes
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

const ReservationForm = ({ onSuccess }: ReservationFormProps) => {
  // Ajout du state pour le type de sport
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    nom_client: '',
    tel: '',
    terrain_id: null as number | null,
    date: '',
    heure: '',
    duree: '1',
    remarque: ''
  });

  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const { data: reservations = [] } = useReservations();
  const { data: abonnements = [] } = useAbonnements();
  const { data: nightTimeSetting } = useAppSetting('heure_debut_nuit_globale');
  const createReservation = useCreateReservation({ isAdminCreation: true });
  const { checkReservationLimits } = useReservationSecurity();

  // Filtrage des terrains selon le type sélectionné
  const filteredTerrains = selectedType 
    ? allTerrains.filter(t => t.type === selectedType)
    : [];

  // Réinitialiser le terrain sélectionné quand le type change
  useEffect(() => {
    setFormData(prev => ({ ...prev, terrain_id: null, heure: '' }));
  }, [selectedType]);

  // Trouver le terrain sélectionné
  const selectedTerrain = allTerrains.find(t => t.id === formData.terrain_id);

  // Déterminer le type de terrain
  const isFoot6 = !!(selectedTerrain && selectedTerrain.type === 'foot' && selectedTerrain.nom.includes('6'));
  const isFoot7or8 = !!(selectedTerrain && selectedTerrain.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8')));

  // Générer les créneaux horaires selon le type de terrain
  const timeSlotsForSelectedTerrain = useMemo(() => {
    if (selectedTerrain?.type === 'foot') {
      // Tous les terrains de foot : de 16:00 à 23:30 avec pas de 30 minutes
      return generateTimeSlotsForFoot(16, 0, 23, 30);
    }
    // Autres terrains : créneaux classiques
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      '21:00', '21:30', '22:00', '22:30', '23:00'
    ];
  }, [selectedTerrain]);

  // Obtenir l'heure de début de nuit globale
  const getGlobalNightStartTime = (): string => {
    return nightTimeSetting?.setting_value || '19:00';
  };

  // Vérifier si un créneau horaire est disponible avec logique de chevauchement et anti-fragmentation
  const isTimeSlotAvailable = (time: string) => {
    if (!formData.terrain_id || !time || !formData.date) return false;

    // Convertir l'heure en nombre décimal (19:30 -> 19.5)
    const timeToDecimal = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    };

    const startHour = timeToDecimal(time);
    const duration = selectedTerrain?.type === 'foot' ? 1.5 : parseFloat(formData.duree || '1');
    const endHour = startHour + duration;

    // 1. Vérifier les conflits directs avec les réservations existantes
    const reservationConflict = reservations.some((res) => {
      if (res.terrain_id !== formData.terrain_id || res.date !== formData.date || res.statut === 'annulee') {
        return false;
      }
      
      const resStartHour = timeToDecimal(res.heure);
      const resEndHour = resStartHour + res.duree;
      
      // Vérifier le chevauchement : deux créneaux se chevauchent si startA < endB && startB < endA
      return startHour < resEndHour && resStartHour < endHour;
    });

    if (reservationConflict) return false;

    // 2. Vérifier les conflits d'abonnements avec logique de chevauchement
    const selectedDate = new Date(formData.date);
    const selectedDayOfWeek = selectedDate.getDay();
    const selectedMonth = selectedDate.getMonth() + 1;
    const selectedYear = selectedDate.getFullYear();

    const abonnementConflict = abonnements.some((abo) => {
      if (
        abo.terrain_id !== formData.terrain_id ||
        abo.statut !== 'actif' ||
        abo.jour_semaine !== selectedDayOfWeek ||
        abo.mois_abonnement !== selectedMonth ||
        abo.annee_abonnement !== selectedYear ||
        !abo.heure_fixe
      ) {
        return false;
      }
      
      const aboStartHour = timeToDecimal(abo.heure_fixe);
      const aboDuration = abo.duree || 1.5;
      const aboEndHour = aboStartHour + aboDuration;
      
      // Vérifier le chevauchement : deux créneaux se chevauchent si startA < endB && startB < endA
      return startHour < aboEndHour && aboStartHour < endHour;
    });

    if (abonnementConflict) return false;

    // 3. Anti-fragmentation FOOT (pas de 30min):
    // Si des réservations/abonnements existent déjà, on garde uniquement la "famille" de créneaux
    // alignée (même modulo 90min) afin d'éviter un trou EXACT de 30 minutes.
    if (selectedTerrain?.type === 'foot') {
      const durationMinutes = 90;

      const occupiedStarts = [
        ...reservations
          .filter(
            (res) =>
              res.terrain_id === formData.terrain_id &&
              res.date === formData.date &&
              res.statut !== 'annulee'
          )
          .map((res) => res.heure),
        ...abonnements
          .filter(
            (abo) =>
              abo.terrain_id === formData.terrain_id &&
              abo.statut === 'actif' &&
              abo.jour_semaine === selectedDayOfWeek &&
              abo.mois_abonnement === selectedMonth &&
              abo.annee_abonnement === selectedYear &&
              !!abo.heure_fixe
          )
          .map((abo) => abo.heure_fixe!),
      ];

      const anchor = getDominantStartModulo(occupiedStarts, durationMinutes);
      if (anchor !== null) {
        const startMinutes = timeToMinutes(time);
        if (startMinutes % durationMinutes !== anchor) return false;
      }
    }

    return true;
  };

  // Obtenir la durée effective
  const getEffectiveDuration = (): string => {
    if (selectedTerrain?.type === 'foot') {
      return '1.5';
    }
    return formData.duree;
  };

  // Calculer le prix total
  const calculateTotalPrice = (): number => {
    if (!formData.terrain_id || !formData.heure || !allTerrains) return 0;
    
    const terrain = allTerrains.find(t => t.id === formData.terrain_id);
    if (!terrain) return 0;
    
    const effectiveDuration = getEffectiveDuration();
    const globalNightStartTime = getGlobalNightStartTime();
    
    // Pour les terrains de football, utiliser le tarif fixe pour 1h30
    if (terrain.type === 'foot') {
      return calculatePrice(terrain, formData.heure, globalNightStartTime);
    }
    
    // Pour les autres terrains, calculer proportionnellement par heure
    const duration = parseFloat(effectiveDuration);
    const wholeHours = Math.floor(duration);
    const fractionalHour = duration - wholeHours;
    let totalPrice = 0;
    
    // Calculer le prix pour les heures entières
    for (let i = 0; i < wholeHours; i++) {
      const currentHour = parseInt(formData.heure.split(':')[0]) + i;
      const timeString = `${currentHour.toString().padStart(2, '0')}:00`;
      const hourPrice = calculatePrice(terrain, timeString, globalNightStartTime);
      totalPrice += hourPrice;
    }
    
    // Ajouter le prix proportionnel pour la fraction d'heure restante
    if (fractionalHour > 0) {
      const currentHour = parseInt(formData.heure.split(':')[0]) + wholeHours;
      const timeString = `${currentHour.toString().padStart(2, '0')}:00`;
      const hourPrice = calculatePrice(terrain, timeString, globalNightStartTime);
      totalPrice += hourPrice * fractionalHour;
    }
    
    return totalPrice;
  };

  // Mettre à jour la durée automatiquement pour les terrains de football
  useEffect(() => {
    if (selectedTerrain?.type === 'foot') {
      setFormData(prev => ({ ...prev, duree: '1.5' }));
    }
  }, [selectedTerrain]);

  // Réinitialiser l'heure quand la date change pour les terrains foot 6
  useEffect(() => {
    if (isFoot6) {
      setFormData(prev => ({ ...prev, heure: '' }));
    }
  }, [formData.date, isFoot6]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs
    const nameError = validateName(formData.nom_client);
    let phoneError = null;
    
    // Valider le téléphone seulement s'il est fourni
    if (formData.tel.trim()) {
      phoneError = validateTunisianPhone(formData.tel);
    }

    if (nameError || phoneError) {
      if (nameError) toast.error(`Nom: ${nameError}`);
      if (phoneError) toast.error(`Téléphone: ${phoneError}`);
      return;
    }
    
    if (!formData.terrain_id || !formData.date || !formData.heure || !formData.nom_client) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    console.log('🔧 ADMIN FORM: Création de réservation admin - pas de vérification sécurité nécessaire');
    
    const effectiveDuration = getEffectiveDuration();
    
    // Générer un email automatique pour les réservations admin
    const adminEmail = `admin.reservation.${Date.now()}@planetsports.com`;
    
    createReservation.mutate({
      nom_client: formData.nom_client,
      tel: formData.tel,
      email: adminEmail,
      terrain_id: formData.terrain_id,
      date: formData.date,
      heure: formData.heure,
      duree: parseFloat(effectiveDuration),
      statut: 'en_attente',
      remarque: formData.remarque || undefined
    }, {
      onSuccess: () => {
        console.log('✅ ADMIN FORM: Réservation créée avec succès');
        onSuccess();
      }
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* Choix du type de sport */}
      <ReservationTypeSelector selectedType={selectedType} setSelectedType={setSelectedType} />

      {/* Choix du terrain - affiché après sélection du type */}
      {selectedType && (
        <div>
          <Label>Choisissez le terrain</Label>
          <TerrainSelector
            terrains={filteredTerrains}
            selectedTerrainId={formData.terrain_id}
            onTerrainSelect={(terrainId) => handleChange('terrain_id', terrainId)}
            isAdminContext={true}
          />
        </div>
      )}

      {/* Informations client - affiché après sélection du terrain */}
      {formData.terrain_id && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nom_client">Nom du client</Label>
            <Input
              id="nom_client"
              value={formData.nom_client}
              onChange={(e) => handleChange('nom_client', e.target.value)}
              maxLength={40}
              placeholder="Nom et prénom (lettres uniquement)"
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.nom_client.length}/40 caractères (lettres uniquement)
            </p>
          </div>

          <div>
            <Label htmlFor="tel">Téléphone (optionnel)</Label>
            <Input
              id="tel"
              value={formData.tel}
              onChange={(e) => handleChange('tel', e.target.value)}
              placeholder="Ex: 12345678 ou +21612345678"
            />
            <p className="text-gray-500 text-xs mt-1">
              Numéro tunisien (8 chiffres) - optionnel
            </p>
          </div>
        </div>
      )}

      {/* Date et heure - affiché après informations client */}
      {formData.nom_client && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="heure">Heure</Label>
            <TimeSlotSelector
              timeSlots={timeSlotsForSelectedTerrain}
              selectedTime={formData.heure}
              isTimeSlotAvailable={isTimeSlotAvailable}
              onTimeSelect={(time) => handleChange('heure', time)}
              loading={false}
              useSelect={selectedTerrain?.type !== 'foot'}
            />
          </div>
        </div>
      )}

      {/* Durée - affiché après sélection de l'heure */}
      {formData.heure && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duree">Durée</Label>
            {selectedTerrain?.type === 'foot' ? (
              <div className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 text-sm flex items-center h-9">
                1h30 (fixe pour football)
              </div>
            ) : (
              <Select 
                value={formData.duree} 
                onValueChange={(value) => handleChange('duree', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 heure</SelectItem>
                  <SelectItem value="1.5">1h30</SelectItem>
                  <SelectItem value="2">2 heures</SelectItem>
                  <SelectItem value="2.5">2h30</SelectItem>
                  <SelectItem value="3">3 heures</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Espace vide pour équilibrer la grille */}
          <div></div>
        </div>
      )}

      {/* Remarques - affiché après durée */}
      {formData.heure && (
        <div>
          <Label htmlFor="remarque">Remarques</Label>
          <Textarea
            id="remarque"
            value={formData.remarque}
            onChange={(e) => handleChange('remarque', e.target.value)}
            className="h-20"
          />
        </div>
      )}

      {/* Affichage des informations de créneau et prix */}
      {formData.heure && selectedTerrain && (
        <div className="p-3 bg-gray-50 rounded-md border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Créneau: {formData.heure} {isNightTime(formData.heure, getGlobalNightStartTime()) ? '🌙 (Nuit)' : '☀️ (Jour)'}
                {selectedTerrain.type === 'foot' && (
                  <span className="text-blue-600 ml-2">(Durée fixe: 1h30)</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">
                {selectedTerrain.type === 'foot' ? (
                  `Tarif fixe 1h30 (${isNightTime(formData.heure, getGlobalNightStartTime()) ? 'nuit' : 'jour'})`
                ) : (
                  `${isNightTime(formData.heure, getGlobalNightStartTime()) ? `Tarif nuit (dès ${getGlobalNightStartTime()})` : 'Tarif jour'} - ${getEffectiveDuration()}h`
                )}
              </p>
              <p className="text-lg font-bold text-sport-green">
                {calculateTotalPrice()} DT
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={createReservation.isPending || !formData.heure}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {createReservation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            'Créer la réservation'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReservationForm;
