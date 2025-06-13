
import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Stats = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 6));
  const [endDate] = useState<Date>(new Date());
  
  const { data: reservations, isLoading: reservationsLoading } = useReservations();
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    averageRevenue: 0,
    footballReservations: 0,
    tennisReservations: 0,
    padelReservations: 0,
    footballRevenue: 0,
    tennisRevenue: 0,
    padelRevenue: 0
  });
  
  useEffect(() => {
    if (timeframe === 'week') {
      setStartDate(subDays(new Date(), 6));
    } else {
      setStartDate(startOfMonth(new Date()));
    }
  }, [timeframe]);
  
  useEffect(() => {
    if (!reservations || !terrains) return;
    
    const filteredReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return reservationDate >= startDate && reservationDate <= endDate;
    });

    const typeStats = {
      foot: { count: 0, revenue: 0 },
      tennis: { count: 0, revenue: 0 },
      padel: { count: 0, revenue: 0 }
    };

    let totalRevenue = 0;

    filteredReservations.forEach(reservation => {
      const terrain = terrains.find(t => t.id === reservation.terrain_id);
      if (!terrain) return;

      const revenue = terrain.prix * reservation.duree;
      totalRevenue += revenue;
      
      typeStats[terrain.type].count += 1;
      typeStats[terrain.type].revenue += revenue;
    });

    const daysInTimeframe = timeframe === 'week' ? 7 : 30;
    const occupancyRate = terrains.length > 0 
      ? Math.round((filteredReservations.length / (terrains.length * daysInTimeframe * 13)) * 100)
      : 0;

    const averageRevenue = filteredReservations.length > 0 
      ? Math.round(totalRevenue / filteredReservations.length)
      : 0;

    setStats({
      totalReservations: filteredReservations.length,
      totalRevenue: totalRevenue,
      occupancyRate: occupancyRate,
      averageRevenue: averageRevenue,
      footballReservations: typeStats.foot.count,
      tennisReservations: typeStats.tennis.count,
      padelReservations: typeStats.padel.count,
      footballRevenue: typeStats.foot.revenue,
      tennisRevenue: typeStats.tennis.revenue,
      padelRevenue: typeStats.padel.revenue
    });
    
  }, [reservations, terrains, startDate, endDate, timeframe]);
  
  if (reservationsLoading || terrainsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              Période sélectionnée
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue} DT</div>
            <p className="text-xs text-muted-foreground">
              Revenus générés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'occupation</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
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
            <div className="text-2xl font-bold">{stats.averageRevenue} DT</div>
            <p className="text-xs text-muted-foreground">
              Par réservation
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Réservations par type de terrain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Football:</span>
                <div className="text-right">
                  <div className="font-medium">{stats.footballReservations} réservations</div>
                  <div className="text-sm text-muted-foreground">{stats.footballRevenue} DT</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Tennis:</span>
                <div className="text-right">
                  <div className="font-medium">{stats.tennisReservations} réservations</div>
                  <div className="text-sm text-muted-foreground">{stats.tennisRevenue} DT</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Padel:</span>
                <div className="text-right">
                  <div className="font-medium">{stats.padelReservations} réservations</div>
                  <div className="text-sm text-muted-foreground">{stats.padelRevenue} DT</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Football:</span>
                <span className="font-medium text-green-600">
                  {((stats.footballRevenue / stats.totalRevenue) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tennis:</span>
                <span className="font-medium text-blue-600">
                  {((stats.tennisRevenue / stats.totalRevenue) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Padel:</span>
                <span className="font-medium text-yellow-600">
                  {((stats.padelRevenue / stats.totalRevenue) * 100 || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
