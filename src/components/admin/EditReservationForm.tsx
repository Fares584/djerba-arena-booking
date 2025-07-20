import { useState, useEffect, useMemo } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useReservations } from '@/hooks/useReservations';
import { useAbonnements } from '@/hooks/useAbonnements';
import { useAppSetting } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Reservation } from '@/lib/supabase';
import { isNightTime } from '@/lib/supabase';
import TimeSlotSelector from '@/components/TimeSlotSelector';

interface EditReservationFormProps {
  reservation: Reservation;
  onSuccess: () => void;
  onCancel: () => void;
}

// Fonction pour générer les créneaux horaires pour le football (identique à ReservationForm)
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

const EditReservationForm = ({ reservation, onSuccess, onCancel }: EditReservationFormProps) => {
  const [formData, setFormData] = useState({
    nom_client: reservation.nom_client || '',
    tel: reservation.tel || '',
    terrain_id: reservation.terrain_id,
    date: reservation.date || '',
    heure: reservation.heure || '',
    duree: reservation.duree?.toString() || '1',
    statut: reservation.statut || 'en_attente',
    remarque: reservation.remarque || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: terrains } = useTerrains();
  const { data: reservations = [] } = useReservations();
  const { data: abonnements = [] } = useAbonnements();
  const { data: nightTimeSetting } = useAppSetting('heure_debut_nuit_globale');

  // Trouver le terrain sélectionné
  const selectedTerrain = terrains?.find(t => t.id === formData.terrain_id);

  // Déterminer le type de terrain (identique à ReservationForm)
  const isFoot6 = !!(selectedTerrain && selectedTerrain.type === 'foot' && selectedTerrain.nom.includes('6'));
  const isFoot7or8 = !!(selectedTerrain && selectedTerrain.type === 'foot' && (selectedTerrain.nom.includes('7') || selectedTerrain.nom.includes('8')));

  // Générer les créneaux horaires selon le type de terrain (identique à ReservationForm)
  const timeSlotsForSelectedTerrain = useMemo(() => {
    if (isFoot6) {
      // Vérifier si c'est un samedi (jour 6 de la semaine)
      const selectedDate = formData.date ? new Date(formData.date) : null;
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
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];
  }, [isFoot6, isFoot7or8, formData.date]);

  // Obtenir l'heure de début de nuit globale
  const getGlobalNightStartTime = (): string => {
    return nightTimeSetting?.setting_value || '19:00';
  };

  // Vérifier si un créneau horaire est disponible
  const isTimeSlotAvailable = (time: string) => {
    if (!formData.terrain_id || !time || !formData.date) return false;

    // Exclure la réservation actuelle de la vérification
    const reservationConflict = reservations.some(
      (res) =>
        res.id !== reservation.id && // Ne pas considérer la réservation actuelle
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
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          nom_client: formData.nom_client,
          tel: formData.tel,
          terrain_id: formData.terrain_id,
          date: formData.date,
          heure: formData.heure,
          duree: parseFloat(formData.duree),
          statut: formData.statut as Reservation['statut'],
          remarque: formData.remarque || null
        })
        .eq('id', reservation.id);

      if (error) throw error;

      toast.success('Réservation mise à jour avec succès');
      onSuccess();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Erreur lors de la mise à jour de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations client */}
        <div>
          <Label htmlFor="nom_client">Nom du client</Label>
          <Input
            id="nom_client"
            value={formData.nom_client}
            onChange={(e) => handleChange('nom_client', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="tel">Téléphone</Label>
          <Input
            id="tel"
            value={formData.tel}
            onChange={(e) => handleChange('tel', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="terrain_id">Terrain</Label>
          <Select 
            value={formData.terrain_id.toString()} 
            onValueChange={(value) => handleChange('terrain_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un terrain" />
            </SelectTrigger>
            <SelectContent>
              {terrains?.map((terrain) => (
                <SelectItem key={terrain.id} value={terrain.id.toString()}>
                  {terrain.nom} - {terrain.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date et heure */}
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

        {/* Durée avec nouvelles options pour tennis/padel */}
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

        {/* Statut */}
        <div>
          <Label htmlFor="statut">Statut</Label>
          <Select 
            value={formData.statut} 
            onValueChange={(value) => handleChange('statut', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="confirmee">Confirmée</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Espace vide pour équilibrer la grille */}
        <div></div>
      </div>

      {/* Remarques */}
      <div>
        <Label htmlFor="remarque">Remarques</Label>
        <Textarea
          id="remarque"
          value={formData.remarque}
          onChange={(e) => handleChange('remarque', e.target.value)}
          className="h-20"
        />
      </div>

      {/* Affichage des informations de créneau */}
      {formData.heure && selectedTerrain && (
        <div className="p-3 bg-gray-50 rounded-md border">
          <p className="text-sm text-gray-600">
            Créneau: {formData.heure} {isNightTime(formData.heure, getGlobalNightStartTime()) ? '🌙 (Nuit)' : '☀️ (Jour)'}
            {selectedTerrain.type === 'foot' && (
              <span className="text-blue-600 ml-2">(Durée fixe: 1h30)</span>
            )}
          </p>
        </div>
      )}

      {/* Boutons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-sport-green hover:bg-sport-dark"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            'Mettre à jour'
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditReservationForm;
