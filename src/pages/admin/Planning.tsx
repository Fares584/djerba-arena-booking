import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Calendar, User, Phone, Mail, MapPin, Clock, Info, Crown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Reservation, Terrain } from '@/lib/supabase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReservationCard from '@/components/admin/ReservationCard';
import EditReservationForm from '@/components/admin/EditReservationForm';
import QuickReservationForm from '@/components/admin/QuickReservationForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Fonction pour générer les créneaux personnalisés Foot - pas de 30 minutes
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
    dt.setMinutes(dt.getMinutes() + 30);
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
  if (terrain.type === 'foot') {
    // Tous les terrains de foot : de 17:00 à 23:30 avec pas de 30 minutes
    return generateTimeSlotsForFoot(17, 0, 23, 30);
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

// Fonction pour vérifier si un créneau est occupé par une réservation (en tenant compte de la durée)
function isTimeSlotOccupied(terrain: Terrain, day: Date, timeSlot: string, reservations: Reservation[]): Reservation | null {
  if (!reservations) return null;
  
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
      return reservation;
    }
  }
  
  return null;
}

// Fonction simplifiée pour l'affichage des réservations (sans rowspan)
function getReservationForTimeSlot(terrain: Terrain, day: Date, timeSlot: string, reservations: Reservation[]): {
  reservation: Reservation | null;
  isStart: boolean;
  position: 'start' | 'middle' | 'end' | 'single';
} {
  if (!reservations) return { reservation: null, isStart: false, position: 'single' };
  
  const formattedDate = format(day, 'yyyy-MM-dd');
  const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
  const slotTimeInMinutes = slotHour * 60 + slotMinute;
  
  for (const reservation of reservations) {
    if (reservation.terrain_id !== terrain.id || reservation.date !== formattedDate) {
      continue;
    }
    
    const [resHour, resMinute] = reservation.heure.split(':').map(Number);
    const resStartTimeInMinutes = resHour * 60 + resMinute;
    const durationInMinutes = reservation.duree * 60;
    const resEndTimeInMinutes = resStartTimeInMinutes + durationInMinutes;
    
    if (slotTimeInMinutes >= resStartTimeInMinutes && slotTimeInMinutes < resEndTimeInMinutes) {
      const isStart = slotTimeInMinutes === resStartTimeInMinutes;
      
      // Déterminer la position dans la réservation multi-créneaux
      let position: 'start' | 'middle' | 'end' | 'single' = 'single';
      if (reservation.duree > 1) {
        if (isStart) {
          position = 'start';
        } else {
          // Vérifier si c'est la fin
          const timeSlots = getTimeSlotsForTerrain(terrain, day);
          const currentIndex = timeSlots.indexOf(timeSlot);
          const nextSlot = timeSlots[currentIndex + 1];
          
          if (nextSlot) {
            const [nextHour, nextMinute] = nextSlot.split(':').map(Number);
            const nextSlotTimeInMinutes = nextHour * 60 + nextMinute;
            if (nextSlotTimeInMinutes >= resEndTimeInMinutes) {
              position = 'end';
            } else {
              position = 'middle';
            }
          } else {
            position = 'end';
          }
        }
      }
      
      return { reservation, isStart, position };
    }
  }
  
  return { reservation: null, isStart: false, position: 'single' };
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Nouveau state pour le formulaire de réservation rapide
  const [quickReservationData, setQuickReservationData] = useState<{
    terrainId: number;
    terrainName: string;
    date: string;
    time: string;
    duration: number;
  } | null>(null);
  const [isQuickReservationOpen, setIsQuickReservationOpen] = useState(false);
  
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  // Récupérer toutes les réservations (y compris les abonnements)
  const { data: reservations, isLoading: reservationsLoading, refetch } = useReservations({
    terrain_id: selectedTerrain || undefined
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

  const handleStatusChange = async (id: number, newStatus: 'confirmee' | 'annulee') => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ statut: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(
        newStatus === 'confirmee'
          ? 'Réservation confirmée avec succès'
          : 'Réservation annulée avec succès'
      );
      
      refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsEditDialogOpen(true);
    setIsDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingReservation(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Réservation supprimée avec succès');
      
      refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Erreur lors de la suppression de la réservation');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTerrainName = (terrainId: number) => {
    if (!terrains) return 'Inconnu';
    const terrain = terrains.find(t => t.id === terrainId);
    return terrain ? terrain.nom : 'Inconnu';
  };

  const getCellClassName = (reservation?: Reservation, isAvailable: boolean = true, position: 'start' | 'middle' | 'end' | 'single' = 'single') => {
    if (!isAvailable) {
      return 'bg-gray-100 border border-gray-200 relative opacity-60';
    }
    
    if (!reservation) return 'bg-white hover:bg-blue-50 border border-gray-200 cursor-pointer group transition-all duration-200 hover:border-blue-300 hover:shadow-sm relative';
    
    // Classes de base pour les réservations
    const isSubscription = !!reservation.abonnement_id;
    let baseClasses = 'cursor-pointer border-2 relative ';
    
    // Bordures selon la position dans une réservation multi-créneaux
    if (reservation.duree > 1) {
      switch (position) {
        case 'start':
          baseClasses += 'border-b-0 ';
          break;
        case 'middle':
          baseClasses += 'border-t-0 border-b-0 ';
          break;
        case 'end':
          baseClasses += 'border-t-0 ';
          break;
        default:
          break;
      }
    }
    
    if (isSubscription) {
      switch (reservation.statut) {
        case 'confirmee':
          return baseClasses + 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900 border-purple-300 hover:from-purple-200 hover:to-purple-300 shadow-sm';
        case 'en_attente':
          return baseClasses + 'bg-gradient-to-br from-purple-50 to-yellow-100 text-purple-800 border-purple-200 hover:from-purple-100 hover:to-yellow-200';
        case 'annulee':
          return baseClasses + 'bg-gradient-to-br from-red-100 to-purple-100 text-red-800 border-red-300 hover:from-red-200 hover:to-purple-200';
        default:
          return baseClasses + 'bg-gradient-to-br from-purple-50 to-white text-purple-800 border-purple-200';
      }
    } else {
      switch (reservation.statut) {
        case 'confirmee':
          return baseClasses + 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
        case 'en_attente':
          return baseClasses + 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
        case 'annulee':
          return baseClasses + 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
        default:
          return baseClasses + 'bg-white hover:bg-gray-50 border-gray-200';
      }
    }
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDialogOpen(true);
  };

  // Nouveau handler pour créer une réservation rapide
  const handleEmptyCellClick = (terrain: Terrain, day: Date, timeSlot: string) => {
    const duration = terrain.type === 'foot' ? 1.5 : 1;
    
    setQuickReservationData({
      terrainId: terrain.id,
      terrainName: terrain.nom,
      date: format(day, 'yyyy-MM-dd'),
      time: timeSlot,
      duration: duration
    });
    setIsQuickReservationOpen(true);
  };

  const handleQuickReservationSuccess = () => {
    refetch();
    setQuickReservationData(null);
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

  // Fonction pour vérifier si le jour sélectionné est un samedi et s'il y a des terrains Foot à 6
  const shouldShowSaturdayAlert = () => {
    const isSaturday = selectedDay.getDay() === 6;
    const hasFoot6 = filteredTerrains?.some(terrain => 
      terrain.type === 'foot' && terrain.nom && terrain.nom.includes('6')
    );
    return isSaturday && hasFoot6;
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
        
        {/* Légende pour différencier les types de réservations */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Réservation normale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 rounded"></div>
            <Crown className="h-3 w-3 text-purple-600" />
            <span>Abonnement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Case libre (cliquer pour réserver)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded opacity-60"></div>
            <X className="h-3 w-3 text-gray-400" />
            <span>Non disponible</span>
          </div>
        </div>
      </div>

      {/* Légende mobile */}
      <div className="md:hidden mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium mb-2">Légende :</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 rounded"></div>
            <Crown className="h-3 w-3 text-purple-600" />
            <span>Abonnement</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Libre (cliquer)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded opacity-60"></div>
            <X className="h-3 w-3 text-gray-400" />
            <span>Non dispo</span>
          </div>
        </div>
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {format(selectedDay, 'EEEE dd/MM', { locale: fr })}
              </span>
              {selectedDay.getDay() === 6 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                  🕐 Samedi
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Alerte spéciale pour les samedis avec terrains Foot à 6 (Mobile uniquement) */}
        {shouldShowSaturdayAlert() && (
          <div className="md:hidden mb-4">
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Horaires spéciaux samedi :</strong> Les terrains Foot à 6 ouvrent à 10h00 au lieu de 9h00
              </AlertDescription>
            </Alert>
          </div>
        )}
        
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
                className={`p-2 rounded text-xs font-medium relative ${
                  format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
                    ? 'bg-sport-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div>{format(day, 'EEE', { locale: fr })}</div>
                <div>{format(day, 'dd')}</div>
                {day.getDay() === 6 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {terrains && filteredTerrains && filteredTerrains.length > 0 ? (
          filteredTerrains.map(terrain => {
            const headerColor = getHeaderColorByType(terrain.type);
            const isFoot6 = terrain.type === 'foot' && terrain.nom && terrain.nom.includes('6');
            const isSaturday = selectedDay.getDay() === 6;

            return (
              <Card key={terrain.id} className="mb-8">
                <CardHeader className={`${headerColor} text-white py-3`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg lg:text-xl">
                      {terrain.nom} - {terrain.type === 'foot' ? 'Football' : terrain.type === 'tennis' ? 'Tennis' : 'Padel'}
                    </CardTitle>
                    {/* Badge horaires spéciaux pour mobile */}
                    {isFoot6 && isSaturday && (
                      <Badge className="md:hidden bg-orange-500 hover:bg-orange-600 text-xs">
                        10h-23h30
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop & Tablet View - Table améliorée */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table className="border-collapse">
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="w-[100px] font-medium text-center border-r border-gray-200">
                            Heure
                          </TableHead>
                          {weekDays.map((day, index) => (
                            <TableHead key={index} className="text-center font-medium border-r border-gray-200 min-w-[120px]">
                              <div>{format(day, 'EEE', { locale: fr })}</div>
                              <div className="text-xs">{format(day, 'dd/MM')}</div>
                              {day.getDay() === 6 && isFoot6 && (
                                <div className="text-orange-600 text-xs font-bold mt-1">Ouv. 10h</div>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const allTimeSlots = new Set<string>();
                          weekDays.forEach(day => {
                            const daySlots = getTimeSlotsForTerrain(terrain, day);
                            daySlots.forEach(slot => allTimeSlots.add(slot));
                          });
                          
                          const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
                            const [aHour, aMin] = a.split(':').map(Number);
                            const [bHour, bMin] = b.split(':').map(Number);
                            return (aHour * 60 + aMin) - (bHour * 60 + bMin);
                          });

                          return sortedTimeSlots.map((timeSlot) => (
                            <TableRow key={timeSlot} className="border-b border-gray-200">
                              <TableCell className="font-medium text-center bg-gray-50 border-r border-gray-200">
                                {timeSlot}
                              </TableCell>
                              
                              {weekDays.map((day, dayIndex) => {
                                const dayTimeSlots = getTimeSlotsForTerrain(terrain, day);
                                const isTimeSlotAvailable = dayTimeSlots.includes(timeSlot);
                                
                                if (!isTimeSlotAvailable) {
                                  return (
                                    <TableCell 
                                      key={dayIndex}
                                      className="text-center bg-gray-50 border-r border-gray-200 h-16"
                                    >
                                      <div className="flex items-center justify-center opacity-40">
                                        <X className="h-3 w-3 text-gray-400" />
                                      </div>
                                    </TableCell>
                                  );
                                }
                                
                                const reservationInfo = getReservationForTimeSlot(terrain, day, timeSlot, reservations || []);
                                
                                return (
                                  <TableCell 
                                    key={dayIndex}
                                    className={`text-center border-r border-gray-200 h-16 p-1 ${getCellClassName(reservationInfo.reservation, isTimeSlotAvailable, reservationInfo.position)}`}
                                    onClick={() => reservationInfo.reservation 
                                      ? handleReservationClick(reservationInfo.reservation)
                                      : handleEmptyCellClick(terrain, day, timeSlot)
                                    }
                                  >
                                    {reservationInfo.reservation ? (
                                      <div className="text-xs relative h-full flex flex-col justify-center">
                                        {reservationInfo.reservation.abonnement_id && reservationInfo.position === 'start' && (
                                          <div className="absolute -top-1 -right-1">
                                            <Crown className="h-3 w-3 text-purple-600" />
                                          </div>
                                        )}
                                        {reservationInfo.position === 'start' ? (
                                          <>
                                            <div className="font-medium truncate" title={reservationInfo.reservation.nom_client}>
                                              {reservationInfo.reservation.nom_client}
                                            </div>
                                            <div className="text-gray-600 truncate text-xs" title={reservationInfo.reservation.tel}>
                                              {reservationInfo.reservation.tel}
                                            </div>
                                            <div className="text-xs opacity-75">{reservationInfo.reservation.duree}h</div>
                                          </>
                                        ) : (
                                          <div className="text-xs opacity-60">
                                            ⋮
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="h-full flex items-center justify-center group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                                        <Plus className="h-4 w-4 text-blue-400" />
                                      </div>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ));
                        })()}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View - Cards */}
                  <div className="md:hidden p-4">
                    <div className="space-y-3">
                      {(() => {
                        // Appliquer la même logique d'exception du samedi pour mobile en passant selectedDay
                        const timeSlots = getTimeSlotsForTerrain(terrain, selectedDay);
                        
                        return timeSlots.map((timeSlot) => {
                          // Utiliser la nouvelle fonction pour vérifier l'occupation
                          const occupation = getReservationForTimeSlot(terrain, selectedDay, timeSlot, reservations || []);
                          
                          // Ne pas afficher les créneaux qui ne sont pas le début d'une réservation multi-heures
                          if (occupation.reservation && occupation.position !== 'start') {
                            return null;
                          }

                          // Identifier si c'est un créneau spécial samedi (10h pour Foot à 6)
                          const isSpecialSaturdaySlot = isFoot6 && isSaturday && timeSlot === '10:00';
                          
                          return (
                            <div 
                              key={timeSlot}
                              className={`p-3 rounded-lg relative group transition-all duration-200 ${getCellClassName(occupation.reservation, true, occupation.position)} ${
                                isSpecialSaturdaySlot ? 'ring-2 ring-orange-300 bg-gradient-to-r from-orange-50 to-white' : ''
                              }`}
                              onClick={() => occupation.reservation 
                                ? handleReservationClick(occupation.reservation)
                                : handleEmptyCellClick(terrain, selectedDay, timeSlot)
                              }
                            >
                              {/* Badge abonnement pour mobile */}
                              {occupation.reservation?.abonnement_id && occupation.position === 'start' && (
                                <div className="absolute -top-2 -right-2 flex items-center">
                                  <Badge className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Crown className="h-3 w-3" />
                                    Abonnement
                                  </Badge>
                                </div>
                              )}
                              
                              {/* Indicateur spécial pour le premier créneau du samedi */}
                              {isSpecialSaturdaySlot && !occupation.reservation?.abonnement_id && (
                                <div className="absolute -top-2 -right-2 flex items-center">
                                  <Badge className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                                    🌅 Ouverture
                                  </Badge>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {timeSlot}
                                  {isSpecialSaturdaySlot && (
                                    <span className="text-orange-600 text-xs font-bold">
                                      ✨ Spécial
                                    </span>
                                  )}
                                </div>
                                {occupation.reservation ? (
                                  <div className="text-right">
                                    <div className="font-medium text-sm flex items-center gap-1">
                                      {occupation.reservation.nom_client}
                                      {occupation.reservation.abonnement_id && (
                                        <Crown className="h-3 w-3 text-purple-600" />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600">{occupation.reservation.tel}</div>
                                    <div className="text-xs opacity-75">{occupation.reservation.duree}h</div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      {isSpecialSaturdaySlot ? 'Réserver - Ouverture' : 'Réserver'}
                                    </span>
                                  </div>
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

      {/* Dialog pour afficher le card de réservation complet avec actions */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-6 w-6" />
              Réservation #{selectedReservation?.id}
              {selectedReservation?.abonnement_id && (
                <Badge className="bg-purple-500 text-white flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  Abonnement
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="p-0">
              <ReservationCard
                reservation={selectedReservation}
                terrainName={getTerrainName(selectedReservation.terrain_id)}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isUpdating={isUpdating}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Reservation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl h-[90vh] w-[95vw] sm:w-full flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier la Réservation #{editingReservation?.id}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {editingReservation && (
              <EditReservationForm 
                reservation={editingReservation}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Reservation Dialog */}
      {quickReservationData && (
        <QuickReservationForm
          isOpen={isQuickReservationOpen}
          onClose={() => {
            setIsQuickReservationOpen(false);
            setQuickReservationData(null);
          }}
          terrainId={quickReservationData.terrainId}
          terrainName={quickReservationData.terrainName}
          date={quickReservationData.date}
          time={quickReservationData.time}
          duration={quickReservationData.duration}
          onSuccess={handleQuickReservationSuccess}
        />
      )}
    </div>
  );
};

export default Planning;
