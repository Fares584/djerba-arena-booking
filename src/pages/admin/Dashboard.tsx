
import { useEffect, useState } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { CalendarCheck, Users, ChartBar } from 'lucide-react';

const Dashboard = () => {
  // Exclure les réservations d'abonnement des statistiques
  const { data: reservations } = useReservations({ excludeSubscriptions: true });
  const { data: terrains } = useTerrains();
  
  const [reservationStats, setReservationStats] = useState({
    total: 0,
    confirmees: 0,
    enAttente: 0,
    annulees: 0
  });
  
  const [typeStats, setTypeStats] = useState<{ name: string; count: number }[]>([]);
  
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
            <CalendarCheck className="h-5 w-5 text-sport-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationStats.total}</div>
            <p className="text-xs text-muted-foreground">Réservations au total</p>
          </CardContent>
        </Card>
        
        <Card>
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
        
        <Card>
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
        
        <Card>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Terrains par Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer 
              config={{
                foot: { color: '#10b981' },
                tennis: { color: '#3b82f6' },
                padel: { color: '#f59e0b' },
              }}
              className="aspect-auto h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div>
                              <span className="font-medium">{payload[0].name}: </span>
                              <span>{payload[0].value} terrains</span>
                            </div>
                          </ChartTooltipContent>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
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
    </div>
  );
};

export default Dashboard;
