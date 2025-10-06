import { useEffect, useState } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { CalendarCheck, Users, ChartBar, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reservation } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // Récupérer toutes les réservations (y compris celles d'aujourd'hui) pour les statistiques du dashboard
  const { data: reservations } = useReservations({ excludeSubscriptions: true, showAllCurrent: true });
  const { data: terrains } = useTerrains();
  
  const [reservationStats, setReservationStats] = useState({
    total: 0,
    confirmees: 0,
    enAttente: 0,
    annulees: 0
  });
  
  const [typeStats, setTypeStats] = useState<{ name: string; count: number }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<Reservation[]>([]);
  const [dialogTitle, setDialogTitle] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (reservations) {
      setReservationStats({
        total: reservations.length,
        confirmees: reservations.filter(r => r.statut === 'confirmee').length,
        enAttente: reservations.filter(r => r.statut === 'en_attente').length,
        annulees: reservations.filter(r => r.statut === 'annulee').length
      });
    }
    
    if (terrains) {
      const types = terrains.reduce((acc, terrain) => {
        if (!acc[terrain.type]) {
          acc[terrain.type] = 0;
        }
        acc[terrain.type]++;
        return acc;
      }, {} as Record<string, number>);
      
      setTypeStats(Object.entries(types).map(([name, count]) => ({ 
        name: name === 'foot' ? 'Football' : name === 'tennis' ? 'Tennis' : 'Padel', 
        count 
      })));
    }
    
  }, [reservations, terrains]);

  const handleCardClick = (type: 'total' | 'confirmees' | 'enAttente' | 'annulees') => {
    if (!reservations) return;
    
    let filteredReservations: Reservation[] = [];
    let title = '';
    
    switch (type) {
      case 'total':
        filteredReservations = reservations;
        title = 'Toutes les Réservations';
        break;
      case 'confirmees':
        filteredReservations = reservations.filter(r => r.statut === 'confirmee');
        title = 'Réservations Confirmées';
        break;
      case 'enAttente':
        filteredReservations = reservations.filter(r => r.statut === 'en_attente');
        title = 'Réservations en Attente';
        break;
      case 'annulees':
        filteredReservations = reservations.filter(r => r.statut === 'annulee');
        title = 'Réservations Annulées';
        break;
    }
    
    setSelectedReservations(filteredReservations);
    setDialogTitle(title);
    setIsDialogOpen(true);
  };

  const handleClientClick = (clientName: string) => {
    // Naviguer vers la page des réservations avec le nom du client comme paramètre de recherche
    navigate(`/admin/reservations?search=${encodeURIComponent(clientName)}`);
  };

  const getTerrainName = (terrainId: number) => {
    if (!terrains) return 'Inconnu';
    const terrain = terrains.find(t => t.id === terrainId);
    return terrain ? terrain.nom : 'Inconnu';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmee':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'annulee':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmee':
        return 'Confirmée';
      case 'en_attente':
        return 'En attente';
      case 'annulee':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('total')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
            <CalendarCheck className="h-5 w-5 text-sport-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationStats.total}</div>
            <p className="text-xs text-muted-foreground">Réservations au total</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('confirmees')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations Confirmées</CardTitle>
            <CalendarCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationStats.confirmees}</div>
            <p className="text-xs text-muted-foreground">
              {reservationStats.total > 0 
                ? `${Math.round((reservationStats.confirmees / reservationStats.total) * 100)}% du total`
                : '0% du total'}
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('enAttente')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations en Attente</CardTitle>
            <CalendarCheck className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationStats.enAttente}</div>
            <p className="text-xs text-muted-foreground">
              {reservationStats.total > 0 
                ? `${Math.round((reservationStats.enAttente / reservationStats.total) * 100)}% du total`
                : '0% du total'}
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('annulees')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations Annulées</CardTitle>
            <CalendarCheck className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationStats.annulees}</div>
            <p className="text-xs text-muted-foreground">
              {reservationStats.total > 0 
                ? `${Math.round((reservationStats.annulees / reservationStats.total) * 100)}% du total`
                : '0% du total'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques des Réservations</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center mb-4">
              <ChartBar className="h-16 w-16 mx-auto text-sport-green mb-2" />
              <p className="text-sm text-gray-500">Nombre total de réservations: {reservationStats.total}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Confirmées</span>
                  <span className="text-sm font-medium">{reservationStats.confirmees}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${reservationStats.total > 0 ? (reservationStats.confirmees / reservationStats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">En attente</span>
                  <span className="text-sm font-medium">{reservationStats.enAttente}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${reservationStats.total > 0 ? (reservationStats.enAttente / reservationStats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Annulées</span>
                  <span className="text-sm font-medium">{reservationStats.annulees}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${reservationStats.total > 0 ? (reservationStats.annulees / reservationStats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for showing reservation details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle} ({selectedReservations.length})</DialogTitle>
          </DialogHeader>
          
          {selectedReservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedReservations.map((reservation) => (
                <Card key={reservation.id} className="border border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <button
                          onClick={() => handleClientClick(reservation.nom_client)}
                          className="text-lg font-semibold hover:underline text-primary cursor-pointer text-left"
                          title={`Voir les réservations de ${reservation.nom_client}`}
                        >
                          {reservation.nom_client}
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">Réservation #{reservation.id}</p>
                      </div>
                      <Badge className={getStatusClass(reservation.statut)}>
                        {getStatusLabel(reservation.statut)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Téléphone</span>
                        <span className="text-sm font-medium">{reservation.tel}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Terrain</span>
                        <span className="text-sm font-medium">{getTerrainName(reservation.terrain_id)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span className="text-sm font-medium">
                          {format(new Date(reservation.date), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Heure</span>
                        <span className="text-sm font-medium">{reservation.heure}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-muted-foreground">Durée</span>
                        <span className="text-sm font-medium">{reservation.duree}h</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClientClick(reservation.nom_client)}
                      className="w-full mt-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Voir toutes les réservations
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune réservation trouvée pour cette catégorie.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
