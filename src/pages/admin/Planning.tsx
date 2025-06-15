import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Fonction pour calculer les slots selon le type du terrain
function getTimeSlotsForTerrain(terrain: Terrain): string[] {
  if (terrain.type === 'foot' && terrain.nom && terrain.nom.includes('6')) {
    // Foot à 6 : de 09:00 à 22:30, toutes les 1h30
    return generateTimeSlotsForFoot(9, 0, 22, 30);
  }
  if (terrain.type === 'foot' && terrain.nom && (terrain.nom.includes('7') || terrain.nom.includes('8'))) {
    // Foot à 7/8 : de 10:00 à 23:30, toutes les 1h30
    return generateTimeSlotsForFoot(10, 0, 23, 30);
  }
  // Autres terrains (tennis, padel…) : créneaux horaires standards
  return defaultTimeSlots;
}

const Planning = () => {
  // Add authentication check
  const { user, loading: authLoading } = useRequireAuth('/login');
  
  const [selectedTerrain, setSelectedTerrain] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date())); // Start with today
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  
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

  const getReservationsForSlot = (terrain: Terrain, day: Date, timeSlot: string) => {
    if (!reservations) return [];
    
    const formattedDate = format(day, 'yyyy-MM-dd');
    
    return reservations.filter(res => 
      res.terrain_id === terrain.id && 
      res.date === formattedDate && 
      res.heure === timeSlot
    );
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
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="w-full md:w-64">
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
          
          {/* Desktop Week Navigation */}
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
        
        {/* Desktop Week Header */}
        <div className="hidden md:block text-center mb-4">
          <h2 className="text-xl font-medium">
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
            // Récupère dynamiquement la liste de créneaux selon le terrain
            const timeSlots = getTimeSlotsForTerrain(terrain);

            return (
              <Card key={terrain.id} className="mb-8">
                <CardHeader className="bg-sport-dark text-white py-3">
                  <CardTitle className="text-base md:text-lg">{terrain.nom} - {terrain.type === 'foot' ? 'Football' : terrain.type === 'tennis' ? 'Tennis' : 'Padel'}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop View - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-8 bg-gray-100">
                        <div className="p-2 border-b border-r border-gray-200 font-medium">Heure</div>
                        {weekDays.map((day, index) => (
                          <div key={index} className="p-2 border-b border-r border-gray-200 text-center font-medium">
                            <div>{format(day, 'EEE', { locale: fr })}</div>
                            <div>{format(day, 'dd/MM')}</div>
                          </div>
                        ))}
                      </div>
                      
                      {timeSlots.map((timeSlot) => (
                        <div key={timeSlot} className="grid grid-cols-8">
                          <div className="p-2 border-b border-r border-gray-200 font-medium">
                            {timeSlot}
                          </div>
                          
                          {weekDays.map((day, dayIndex) => {
                            const reservationsForSlot = getReservationsForSlot(terrain, day, timeSlot);
                            const reservation = reservationsForSlot[0];
                            
                            return (
                              <div 
                                key={dayIndex}
                                className={`p-2 border-b border-r ${getCellClassName(reservation)}`}
                              >
                                {reservation ? (
                                  <div className="text-xs">
                                    <div className="font-medium">{reservation.nom_client}</div>
                                    <div>{reservation.duree}h</div>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile View - Cards */}
                  <div className="md:hidden p-4">
                    <div className="space-y-3">
                      {timeSlots.map((timeSlot) => {
                        const reservationsForSlot = getReservationsForSlot(terrain, selectedDay, timeSlot);
                        const reservation = reservationsForSlot[0];
                        
                        return (
                          <div 
                            key={timeSlot}
                            className={`p-3 rounded-lg ${getCellClassName(reservation)}`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-sm">{timeSlot}</div>
                              {reservation ? (
                                <div className="text-right">
                                  <div className="font-medium text-sm">{reservation.nom_client}</div>
                                  <div className="text-xs opacity-75">{reservation.duree}h</div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">Libre</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
    </div>
  );
};

export default Planning;
