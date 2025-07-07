import { useState, useEffect, useMemo } from 'react';
import { useTerrains } from '@/hooks/useTerrains';
import { useUpdateAbonnement, useAbonnements } from '@/hooks/useAbonnements';
import { useReservations } from '@/hooks/useReservations';
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

interface EditAbonnementFormProps {
  abonnement: Abonnement;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditAbonnementForm = ({ abonnement, onSuccess, onCancel }: EditAbonnementFormProps) => {
  // Ajout state choix type
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(abonnement.terrain_id || null);
  const [dateDebut, setDateDebut] = useState(abonnement.date_debut);
  const [dateFin, setDateFin] = useState(abonnement.date_fin);
  const [heure, setHeure] = useState(abonnement.heure_fixe || '');
  const [clientNom, setClientNom] = useState(abonnement.client_nom);
  const [clientTel, setClientTel] = useState(abonnement.client_tel);
  const [statut, setStatut] = useState<Abonnement['statut']>(abonnement.statut);
  const [selectedJourSemaine, setSelectedJourSemaine] = useState<number | null>(abonnement.jour_semaine || null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: allTerrains = [], isLoading: terrainsLoading } = useTerrains({ actif: true });
  const updateAbonnement = useUpdateAbonnement();
  const { data: reservations = [] } = useReservations();
  const { data: abonnements = [] } = useAbonnements();

  // Sélection automatique du type à partir du terrain_id au montage
  useEffect(() => {
    if (abonnement.terrain_id) {
      const foundTerrain = allTerrains.find(t => t.id === abonnement.terrain_id);
      if (foundTerrain) setSelectedType(foundTerrain.type);
    }
  }, [abonnement.terrain_id, allTerrains]);

  // Filtrage terrains selon type
  const filteredTerrains = selectedType
    ? allTerrains.filter(t => t.type === selectedType)
    : [];

  useEffect(() => {
    setSelectedTerrainId(null);
    setHeure('');
  }, [selectedType]);

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

  // CORRECTION: Utiliser selectedJourSemaine au lieu de calculer depuis dateDebut
  const isTimeSlotAvailable = (time: string) => {
    if (!selectedTerrainId || !time || selectedJourSemaine === null) return false;
    
    console.log('Vérification disponibilité (edit):', {
      time,
      terrainId: selectedTerrainId,
      selectedJourSemaine,
      dateDebut,
      abonnementId: abonnement.id
    });

    const reservationConflict = reservations.some(
      (res) =>
        res.terrain_id === selectedTerrainId &&
        res.heure === time &&
        (
          (!dateDebut || res.date >= dateDebut) &&
          (!dateFin || res.date <= dateFin)
        ) &&
        res.statut !== 'annulee'
    );

    // CORRECTION: utiliser selectedJourSemaine directement et exclure l'abonnement en cours de modification
    const abonnementConflict = abonnements.some(
      (abo) => {
        const conflict = abo.id !== abonnement.id && // ne pas se bloquer soi-même
          abo.terrain_id === selectedTerrainId &&
          abo.heure_fixe === time &&
          abo.statut === 'actif' &&
          abo.jour_semaine === selectedJourSemaine && // CORRECTION: utiliser selectedJourSemaine directement
          (
            (!dateDebut || !abo.date_fin || abo.date_fin >= dateDebut) &&
            (!dateFin || !abo.date_debut || abo.date_debut <= dateFin)
          );
        
        if (conflict) {
          console.log('Conflit détecté avec abonnement (edit):', abo);
        }
        
        return conflict;
      }
    );
    
    return !reservationConflict && !abonnementConflict;
  };

  const isValid =
    selectedType &&
    selectedTerrainId &&
    !!dateDebut &&
    !!dateFin &&
    !!heure &&
    selectedJourSemaine !== null &&
    !!clientNom.trim() &&
    !!clientTel.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValid) {
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
          date_debut: dateDebut,
          date_fin: dateFin,
          jour_semaine: selectedJourSemaine!,
          heure_fixe: heure,
          client_nom: clientNom.trim(),
          client_tel: clientTel.trim(),
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

      {/* Dates */}
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

      {/* Jour de la semaine - MANUEL uniquement */}
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
          <option value={0}>Dimanche</option>
          <option value={1}>Lundi</option>
          <option value={2}>Mardi</option>
          <option value={3}>Mercredi</option>
          <option value={4}>Jeudi</option>
          <option value={5}>Vendredi</option>
          <option value={6}>Samedi</option>
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
