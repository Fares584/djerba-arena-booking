import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/useRequireRole';
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { useAbonnements } from '@/hooks/useAbonnements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Users, TrendingUp, Loader2 } from 'lucide-react';

const Dashboard = () => {
  // Seuls les admins peuvent accéder au dashboard
  const { user, loading } = useRequireRole(['admin']);
  
  const { data: reservations, isLoading: reservationsLoading } = useReservations();
  const { data: terrains, isLoading: terrainsLoading } = useTerrains();
  const { data: abonnements, isLoading: abonnementsLoading } = useAbonnements();

  if (loading || reservationsLoading || terrainsLoading || abonnementsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sport-green" />
      </div>
    );
  }

  const today = new Date();
  const todayReservations = reservations?.filter(r => r.date === format(today, 'yyyy-MM-dd')) || [];
  const confirmedReservations = reservations?.filter(r => r.statut === 'confirmee') || [];
  const activeAbonnements = abonnements?.filter(a => a.statut === 'actif') || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Tableau de Bord</h1>
        <div className="text-sm text-gray-600">
          {format(today, 'EEEE dd MMMM yyyy', { locale: fr })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
            <p className="text-xs text-muted-foreground">
              +{confirmedReservations.length} confirmées au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terrains Actifs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{terrains?.filter(t => t.actif).length || 0}</div>
            <p className="text-xs text-muted-foreground">
              sur {terrains?.length || 0} terrains au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAbonnements.length}</div>
            <p className="text-xs text-muted-foreground">
              abonnements en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Occupation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {terrains?.length && todayReservations.length 
                ? Math.round((todayReservations.length / (terrains.length * 15)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              occupation aujourd'hui
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Réservations Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations?.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{reservation.nom_client}</p>
                    <p className="text-sm text-gray-600">{reservation.tel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{format(new Date(reservation.date), 'dd/MM')}</p>
                    <p className="text-sm text-gray-600">{reservation.heure}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut des Terrains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {terrains?.map((terrain) => (
                <div key={terrain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{terrain.nom}</p>
                    <p className="text-sm text-gray-600 capitalize">{terrain.type}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    terrain.actif 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {terrain.actif ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
