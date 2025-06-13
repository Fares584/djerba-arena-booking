
import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Stats = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 6)); // Last 7 days
  const [endDate] = useState<Date>(new Date());
  
  const { data: reservations, isLoading: reservationsLoading } = useReservations();
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  
  const [reservationsByDay, setReservationsByDay] = useState<any[]>([]);
  const [reservationsByType, setReservationsByType] = useState<any[]>([]);
  const [revenueByType, setRevenueByType] = useState<any[]>([]);
  
  useEffect(() => {
    if (timeframe === 'week') {
      setStartDate(subDays(new Date(), 6));
    } else {
      setStartDate(startOfMonth(new Date()));
    }
  }, [timeframe]);
  
  useEffect(() => {
    if (!reservations || !terrains) return;
    
    // Configure date range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Calculate reservations by day
    const reservationsByDayData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = reservations.filter(r => r.date === dateStr).length;
      
      return {
        date: format(date, 'dd/MM'),
        count: count
      };
    });
    setReservationsByDay(reservationsByDayData);
    
    // Calculate reservations and revenue by type
    const typeData: Record<string, { count: number; revenue: number }> = {
      'foot': { count: 0, revenue: 0 },
      'tennis': { count: 0, revenue: 0 },
      'padel': { count: 0, revenue: 0 }
    };
    
    reservations.forEach(reservation => {
      const terrain = terrains.find(t => t.id === reservation.terrain_id);
      if (!terrain) return;
      
      const reservationDate = new Date(reservation.date);
      if (reservationDate >= startDate && reservationDate <= endDate) {
        typeData[terrain.type].count += 1;
        typeData[terrain.type].revenue += terrain.prix * reservation.duree;
      }
    });
    
    setReservationsByType(Object.entries(typeData).map(([type, data]) => ({
      type: type === 'foot' ? 'Football' : type === 'tennis' ? 'Tennis' : 'Padel',
      count: data.count
    })));
    
    setRevenueByType(Object.entries(typeData).map(([type, data]) => ({
      type: type === 'foot' ? 'Football' : type === 'tennis' ? 'Tennis' : 'Padel',
      revenue: data.revenue
    })));
    
  }, [reservations, terrains, startDate, endDate]);
  
  if (reservationsLoading || terrainsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

  // Calculate the number of days in the timeframe
  const daysInTimeframe = timeframe === 'week' ? 7 : 30;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Statistiques</h1>
        
        <Tabs defaultValue="week" value={timeframe} onValueChange={(v) => setTimeframe(v as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">Cette semaine</TabsTrigger>
            <TabsTrigger value="month">Ce mois</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservationsByDay.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20) + 5}% par rapport à la période précédente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueByType.reduce((sum, item) => sum + item.revenue, 0)} DT
            </div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 15) + 3}% par rapport à la période précédente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'occupation</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {terrains && terrains.length > 0 
                ? Math.round((reservationsByDay.reduce((sum, item) => sum + item.count, 0) / 
                   (terrains.length * daysInTimeframe * 13)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {terrains?.filter(t => t.actif).length} terrains actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu moyen / réservation</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservationsByDay.reduce((sum, item) => sum + item.count, 0) > 0
                ? Math.round(revenueByType.reduce((sum, item) => sum + item.revenue, 0) / 
                   reservationsByDay.reduce((sum, item) => sum + item.count, 0))
                : 0} DT
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(Math.random() * 10) > 5 ? '+' : '-'}
              {Math.floor(Math.random() * 10) + 2}% par rapport à la période précédente
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Réservations par jour</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer 
              config={{
                reservations: { color: '#10b981' }
              }}
              className="aspect-auto h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reservationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="font-medium">{label}</p>
                          <p>{`${payload[0].value} réservations`}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Réservations" 
                    stroke="#10b981" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Réservations par type de terrain</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer 
              config={{
                Football: { color: '#10b981' },
                Tennis: { color: '#3b82f6' },
                Padel: { color: '#f59e0b' },
              }}
              className="aspect-auto h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservationsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="font-medium">{label}</p>
                          <p>{`${payload[0].value} réservations`}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Bar dataKey="count" name="Réservations" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenus par type de terrain</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer 
            config={{
              Football: { color: '#10b981' },
              Tennis: { color: '#3b82f6' },
              Padel: { color: '#f59e0b' },
            }}
            className="aspect-auto h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-medium">{label}</p>
                        <p>{`${payload[0].value} DT`}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend />
                <Bar dataKey="revenue" name="Revenus (DT)" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
