import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Calendar, User, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Reservation, Terrain } from '@/lib/supabase';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// Utilitaire pour générer les créneaux personnalisés Foot
function generateTimeSlotsForFoot(startHour: number, startMinute: number, endHour: number, endMinute: number) {
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
}

// Met à jour la liste des créneaux horaires standards pour tennis et padel :
const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00', '23:00'
];

// Fonction pour calculer les slots selon le type du terrain et la date
function getTimeSlotsForTerrain(terrain: Terrain, date?: Date): string[] {
  if (terrain.type === 'foot' && terrain.nom && terrain.nom.includes('6')) {
    // Vérifier si c'est un samedi (jour 6 de la semaine)
    const isSaturday = date && date.getDay() === 6;
    
    if (isSaturday) {
      // Samedi : de 10:00 à 23:30 pour Foot à 6
      return generateTimeSlotsForFoot(10, 0, 23, 30);
    } else {
      // Autres jours : de 09:00 à 22:30 pour Foot à 6
      return generateTimeSlotsForFoot(9, 0, 22, 30);
    }
  }
  if (terrain.type === 'foot' && terrain.nom && (terrain.nom.includes('7') || terrain.nom.includes('8'))) {
    // Foot à 7/8 : de 10:00 à 23:30, toutes les 1h30
    return generateTimeSlotsForFoot(10, 0, 23, 30);
  }
  // Autres terrains (tennis, padel…) : créneaux horaires standards
  return defaultTimeSlots;
}

// Fonction pour obtenir la couleur d'en-tête selon le type de terrain
function getHeaderColorByType(type: string): string {
  switch (type) {
    case 'padel':
      return 'bg-blue-600';
    case 'tennis':
      return 'bg-red-700';
    case 'foot':
      return 'bg-green-600';
    default:
      return 'bg-sport-dark';
  }
}

// Fonction pour vérifier si un créneau est occupé par une réservation et retourner les informations d'occupation
function getTimeSlotOccupation(terrain: Terrain, day: Date, timeSlot: string, reservations: Reservation[]): {
  reservation: Reservation | null;
  isStart: boolean;
  shouldShow: boolean;
} {
  if (!reservations) return { reservation: null, isStart: false, shouldShow: true };
  
  const formattedDate = format(day, 'yyyy-MM-dd');
  
  // Convertir le timeSlot en minutes depuis minuit pour les calculs
  const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
  const slotTimeInMinutes = slotHour * 60 + slotMinute;
  
  // Chercher une réservation qui occupe ce créneau
  for (const reservation of reservations) {
    if (reservation.terrain_id !== terrain.id || reservation.date !== formattedDate) {
      continue;
    }
    
    // Convertir l'heure de début de la réservation en minutes
    const [resHour, resMinute] = reservation.heure.split(':').map(Number);
    const resStartTimeInMinutes = resHour * 60 + resMinute;
    
    // Calculer l'heure de fin en ajoutant la durée (en heures)
    const durationInMinutes = reservation.duree * 60;
    const resEndTimeInMinutes = resStartTimeInMinutes + durationInMinutes;
    
    // Vérifier si le créneau actuel est dans la plage de la réservation
    if (slotTimeInMinutes >= resStartTimeInMinutes && slotTimeInMinutes < resEndTimeInMinutes) {
      const isStart = slotTimeInMinutes === resStartTimeInMinutes;
      // Montrer seulement la première cellule pour les réservations multi-heures
      const shouldShow = isStart;
      return { reservation, isStart, shouldShow };
    }
  }
  
  return { reservation: null, isStart: false, shouldShow: true };
}

// Fonction pour calculer le rowspan d'une réservation
function getReservationRowSpan(reservation: Reservation, terrain: Terrain, day: Date): number {
  const timeSlots = getTimeSlotsForTerrain(terrain, day);
  const [resHour, resMinute] = reservation.heure.split(':').map(Number);
  const resStartTimeInMinutes = resHour * 60 + resMinute;
  
  let rowSpan = 0;
  
  for (const slot of timeSlots) {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotTimeInMinutes = slotHour * 60 + slotMinute;
    const durationInMinutes = reservation.duree * 60;
    const resEndTimeInMinutes = resStartTimeInMinutes + durationInMinutes;
    
    if (slotTimeInMinutes >= resStartTimeInMinutes && slotTimeInMinutes < resEndTimeInMinutes) {
      rowSpan++;
    }
  }
  
  return Math.max(1, rowSpan);
}

// Nouvelle fonction pour vérifier si un créneau est disponible pour un terrain spécifique
function isTimeSlotAvailableForTerrain(terrain: Terrain, day: Date, timeSlot: string): boolean {
  const availableSlots = getTimeSlotsForTerrain(terrain, day);
  return availableSlots.includes(timeSlot);
}

const Planning = () => {
  // Add authentication check
  const { user, loading: authLoading } = useRequireAuth('/login');
  
  const [selectedTerrain, setSelectedTerrain] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date())); // Start with today
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  // Correction ici : Récupérer toutes les réservations (ne PAS exclure les réservations d'abonnement)
  const { data: reservations, isLoading: reservationsLoading } = useReservations({
    terrain_id: selectedTerrain || undefined
    // On ne met PAS excludeSubscriptions:true !
  });

  // Generate array of dates for the week (today + 7 days)
  useEffect(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
    setWeekDays(days);
    setSelectedDay(days[0]); // Set first day as default for mobile
  }, [startDate]);

  const goToPreviousWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  const goToNextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  const goToCurrentWeek = () => {
    setStartDate(startOfDay(new Date()));
  };

  const goToPreviousDay = () => {
    const currentIndex = weekDays.findIndex(day => 
      format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
    );
    if (currentIndex > 0) {
      setSelectedDay(weekDays[currentIndex - 1]);
    } else {
      // Go to previous week, last day
      const newStartDate = addDays(startDate, -7);
      setStartDate(newStartDate);
      setSelectedDay(addDays(newStartDate, 6));
    }
  };

  const goToNextDay = () => {
    const currentIndex = weekDays.findIndex(day => 
      format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
    );
    if (currentIndex < weekDays.length - 1) {
      setSelectedDay(weekDays[currentIndex + 1]);
    } else {
      // Go to next week, first day
      const newStartDate = addDays(startDate, 7);
      setStartDate(newStartDate);
      setSelectedDay(newStartDate);
    }
  };

  const getCellClassName = (reservation?: Reservation) => {
    if (!reservation) return 'bg-white hover:bg-gray-50 border border-gray-200';
    
    switch (reservation.statut) {
      case 'confirmee':
        return 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200';
      case 'annulee':
        return 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200';
      default:
        return 'bg-white hover:bg-gray-50 border border-gray-200';
    }
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDialogOpen(true);
  };

  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'confirmee':
        return 'default';
      case 'en_attente':
        return 'secondary';
      case 'annulee':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'confirmee':
        return 'Confirmée';
      case 'en_attente':
        return 'En attente';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  };

  if (authLoading || terrainsLoading || reservationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

  // Make sure we're not showing empty state when we have terrains
  const filteredTerrains = selectedTerrain && terrains 
    ? terrains.filter(t => t.id === selectedTerrain) 
    : terrains;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Planning des Terrains</h1>
      </div>
      
      <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="w-full lg:w-64">
            <Select 
              value={selectedTerrain ? selectedTerrain.toString() : "all"}
              onValueChange={(value) => setSelectedTerrain(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les terrains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les terrains</SelectItem>
                {terrains?.map((terrain) => (
                  <SelectItem key={terrain.id} value={terrain.id.toString()}>
                    {terrain.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Desktop & Tablet Week Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Day Navigation */}
          <div className="flex md:hidden items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              {format(selectedDay, 'EEEE dd/MM', { locale: fr })}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Desktop & Tablet Week Header */}
        <div className="hidden md:block text-center mb-4">
          <h2 className="text-lg lg:text-xl font-medium">
            Du {format(startDate, 'dd MMMM', { locale: fr })} au {format(weekDays[6] || addDays(startDate, 6), 'dd MMMM yyyy', { locale: fr })}
          </h2>
        </div>

        {/* Mobile Day Selector */}
        <div className="md:hidden mb-4">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(day)}
                className={`p-2 rounded text-xs font-medium ${
                  format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
                    ? 'bg-sport-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div>{format(day, 'EEE', { locale: fr })}</div>
                <div>{format(day, 'dd')}</div>
              </button>
            ))}
          </div>
        </div>
        
        {terrains && filteredTerrains && filteredTerrains.length > 0 ? (
          filteredTerrains.map(terrain => {
            const headerColor = getHeaderColorByType(terrain.type);

            return (
              <Card key={terrain.id} className="mb-8">
                <CardHeader className={`${headerColor} text-white py-3`}>
                  <CardTitle className="text-base md:text-lg lg:text-xl">
                    {terrain.nom} - {terrain.type === 'foot' ? 'Football' : terrain.type === 'tennis' ? 'Tennis' : 'Padel'}
                    {terrain.type === 'foot' && terrain.nom && terrain.nom.includes('6') && (
                      <span className="text-sm ml-2 opacity-90">
                        (Lun-Ven: 09:00-22:30, Sam: 10:00-23:30)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop & Tablet View - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <div className="min-w-[600px] lg:min-w-[800px]">
                      <div className="grid grid-cols-8 bg-gray-100">
                        <div className="p-2 lg:p-3 border-b border-r border-gray-200 font-medium text-sm lg:text-base">Heure</div>
                        {weekDays.map((day, index) => (
                          <div key={index} className="p-2 lg:p-3 border-b border-r border-gray-200 text-center font-medium text-xs lg:text-sm">
                            <div>{format(day, 'EEE', { locale: fr })}</div>
                            <div>{format(day, 'dd/MM')}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Créer une structure de table avec gestion des rowspan */}
                      <table className="w-full border-collapse">
                        <tbody>
                          {/* Générer les créneaux pour ce terrain spécifique */}
                          {(() => {
                            // Utiliser les créneaux spécifiques au terrain pour le premier jour comme référence
                            const referenceTimeSlots = getTimeSlotsForTerrain(terrain, weekDays[0]);

                            return referenceTimeSlots.map((timeSlot) => (
                              <tr key={timeSlot}>
                                <td className="p-2 lg:p-3 border-b border-r border-gray-200 font-medium text-sm lg:text-base w-[12.5%]">
                                  {timeSlot}
                                </td>
                                
                                {weekDays.map((day, dayIndex) => {
                                  // Vérifier si ce créneau est disponible pour ce terrain ce jour-là
                                  const isAvailable = isTimeSlotAvailableForTerrain(terrain, day, timeSlot);
                                  
                                  if (!isAvailable) {
                                    return (
                                      <td 
                                        key={dayIndex}
                                        className="p-1 lg:p-2 border-b border-r bg-gray-200 text-gray-500 w-[12.5%]"
                                      >
                                        <div className="text-xs text-center">Non disponible</div>
                                      </td>
                                    );
                                  }
                                  
                                  // Utiliser la fonction pour vérifier l'occupation
                                  const occupation = getTimeSlotOccupation(terrain, day, timeSlot, reservations || []);
                                  
                                  // Ne pas afficher les cellules qui ne sont pas le début d'une réservation multi-heures
                                  if (occupation.reservation && !occupation.shouldShow) {
                                    return null;
                                  }
                                  
                                  const rowSpan = occupation.reservation && occupation.isStart 
                                    ? getReservationRowSpan(occupation.reservation, terrain, day)
                                    : 1;
                                  
                                  return (
                                    <td 
                                      key={dayIndex}
                                      className={`p-1 lg:p-2 border-b border-r w-[12.5%] ${getCellClassName(occupation.reservation)} ${
                                        occupation.reservation ? 'cursor-pointer hover:opacity-80' : ''
                                      }`}
                                      rowSpan={rowSpan}
                                      onClick={() => occupation.reservation && handleReservationClick(occupation.reservation)}
                                    >
                                      {occupation.reservation ? (
                                        <div className="text-xs">
                                          <div className="font-medium truncate" title={occupation.reservation.nom_client}>
                                            {occupation.reservation.nom_client}
                                          </div>
                                          <div className="text-gray-600 truncate" title={occupation.reservation.tel}>
                                            {occupation.reservation.tel}
                                          </div>
                                          <div className="text-xs opacity-75">{occupation.reservation.duree}h</div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-center text-green-600">Libre</div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile View - Cards */}
                  <div className="md:hidden p-4">
                    <div className="space-y-3">
                      {(() => {
                        const timeSlots = getTimeSlotsForTerrain(terrain, selectedDay);
                        
                        return timeSlots.map((timeSlot) => {
                          // Utiliser la fonction pour vérifier l'occupation
                          const occupation = getTimeSlotOccupation(terrain, selectedDay, timeSlot, reservations || []);
                          
                          // Ne pas afficher les créneaux qui ne sont pas le début d'une réservation multi-heures
                          if (occupation.reservation && !occupation.shouldShow) {
                            return null;
                          }
                          
                          return (
                            <div 
                              key={timeSlot}
                              className={`p-3 rounded-lg ${getCellClassName(occupation.reservation)} ${
                                occupation.reservation ? 'cursor-pointer hover:opacity-80' : ''
                              }`}
                              onClick={() => occupation.reservation && handleReservationClick(occupation.reservation)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-sm">
                                  {timeSlot}
                                  {occupation.reservation && occupation.reservation.duree > 1 && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      - {String(parseInt(timeSlot.split(':')[0]) + occupation.reservation.duree).padStart(2, '0')}:{timeSlot.split(':')[1]}
                                    </span>
                                  )}
                                </div>
                                {occupation.reservation ? (
                                  <div className="text-right">
                                    <div className="font-medium text-sm">{occupation.reservation.nom_client}</div>
                                    <div className="text-xs text-gray-600">{occupation.reservation.tel}</div>
                                    <div className="text-xs opacity-75">{occupation.reservation.duree}h</div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-green-600">Libre</div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-10">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun terrain</h3>
            <p className="mt-1 text-gray-500">Il n'y a pas encore de terrains à afficher.</p>
          </div>
        )}
      </div>

      {/* Dialog pour afficher les détails de la réservation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Détails de la réservation
            </DialogTitle>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4">
              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Statut:</span>
                <Badge variant={getStatusBadgeVariant(selectedReservation.statut)}>
                  {getStatusLabel(selectedReservation.statut)}
                </Badge>
              </div>

              {/* Informations client */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Informations client</h4>
                
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{selectedReservation.nom_client}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Téléphone</div>
                    <div className="font-medium">{selectedReservation.tel}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{selectedReservation.email}</div>
                  </div>
                </div>
              </div>

              {/* Informations réservation */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Détails de la réservation</h4>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Terrain</div>
                    <div className="font-medium">
                      {terrains?.find(t => t.id === selectedReservation.terrain_id)?.nom || 'Terrain inconnu'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-medium">
                      {format(new Date(selectedReservation.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Heure et durée</div>
                    <div className="font-medium">
                      {selectedReservation.heure} - {selectedReservation.duree}h
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarque si présente */}
              {selectedReservation.remarque && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Remarque</h4>
                  <p className="text-sm text-gray-700">{selectedReservation.remarque}</p>
                </div>
              )}

              {/* Informations d'abonnement si présente */}
              {selectedReservation.abonnement_id && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Abonnement</h4>
                  <p className="text-sm text-blue-700">
                    Cette réservation fait partie de l'abonnement #{selectedReservation.abonnement_id}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planning;
