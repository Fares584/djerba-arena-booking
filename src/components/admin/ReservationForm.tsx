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

interface ReservationFormProps {
  onSuccess: () => void;
}

// Fonction pour générer les créneaux horaires pour le football
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
    if (isFoot6) {
      // Vérifier si c'est un samedi (jour 6 de la semaine)
      const selectedDate = formData.date ? new Date(formData.date + 'T00:00:00') : null;
      const isSaturday = selectedDate && selectedDate.getDay() === 6;
      
      if (isSaturday) {
        // Samedi : de 10:00 à 23:30 pour Foot à 6
        return generateTimeSlotsForFoot(10, 0, 23, 30);
      } else {
        // Autres jours : de 09:00 à 22:30 pour Foot à 6
        return generateTimeSlotsForFoot(9, 0, 22, 30);
      }
    }
    if (isFoot7or8) {
      // Foot à 7/8 : de 10:00 à 23:30
      return generateTimeSlotsForFoot(10, 0, 23, 30);
    }
    // Autres terrains : créneaux classiques
    return [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
  }, [isFoot6, isFoot7or8, formData.date]);

  // Obtenir l'heure de début de nuit globale
  const getGlobalNightStartTime = (): string => {
    return nightTimeSetting?.setting_value || '19:00';
  };

  // Vérifier si un créneau horaire est disponible
  const isTimeSlotAvailable = (time: string) => {
    if (!formData.terrain_id || !time || !formData.date) return false;

    const reservationConflict = reservations.some(
      (res) =>
        res.terrain_id === formData.terrain_id &&
        res.heure === time &&
        res.date === formData.date &&
        res.statut !== 'annulee'
    );

    // Vérifier les conflits d'abonnements avec la nouvelle logique
    const selectedDate = new Date(formData.date);
    const selectedDayOfWeek = selectedDate.getDay();
    const selectedMonth = selectedDate.getMonth() + 1;
    const selectedYear = selectedDate.getFullYear();

    const abonnementConflict = abonnements.some(
      (abo) =>
        abo.terrain_id === formData.terrain_id &&
        abo.heure_fixe === time &&
        abo.statut === 'actif' &&
        abo.jour_semaine === selectedDayOfWeek &&
        abo.mois_abonnement === selectedMonth &&
        abo.annee_abonnement === selectedYear
    );

    return !reservationConflict && !abonnementConflict;
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
    const phoneError = validateTunisianPhone(formData.tel);

    if (nameError || phoneError) {
      if (nameError) toast.error(`Nom: ${nameError}`);
      if (phoneError) toast.error(`Téléphone: ${phoneError}`);
      return;
    }
    
    if (!formData.terrain_id || !formData.date || !formData.heure || !formData.nom_client || !formData.tel) {
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
            <Label htmlFor="tel">Téléphone</Label>
            <Input
              id="tel"
              value={formData.tel}
              onChange={(e) => handleChange('tel', e.target.value)}
              placeholder="Ex: 12345678 ou +21612345678"
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              Numéro tunisien (8 chiffres)
            </p>
          </div>
        </div>
      )}

      {/* Date et heure - affiché après informations client */}
      {formData.nom_client && formData.tel && (
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
