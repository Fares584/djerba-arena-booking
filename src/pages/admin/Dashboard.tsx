
import { useReservations } from '@/hooks/useReservations';
import { useTerrains } from '@/hooks/useTerrains';
import { useAbonnements } from '@/hooks/useAbonnements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, MapPin, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { data: reservations } = useReservations();
  const { data: terrains } = useTerrains();
  const { data: abonnements } = useAbonnements();

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations?.filter(r => r.date === today) || [];
  const activeTerrains = terrains?.filter(t => t.actif) || [];
  const activeAbonnements = abonnements?.filter(a => a.statut === 'actif') || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations aujourd'hui</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
            <p className="text-xs text-muted-foreground">
              Réservations en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terrains actifs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTerrains.length}</div>
            <p className="text-xs text-muted-foreground">
              Sur {terrains?.length || 0} terrains total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAbonnements.length}</div>
            <p className="text-xs text-muted-foreground">
              Clients abonnés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total réservations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Toutes les réservations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Résumé des terrains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Terrains de football:</span>
                <span className="font-medium">
                  {terrains?.filter(t => t.type === 'foot' && t.actif).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Terrains de tennis:</span>
                <span className="font-medium">
                  {terrains?.filter(t => t.type === 'tennis' && t.actif).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Terrains de padel:</span>
                <span className="font-medium">
                  {terrains?.filter(t => t.type === 'padel' && t.actif).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État des abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Actifs:</span>
                <span className="font-medium text-green-600">
                  {abonnements?.filter(a => a.statut === 'actif').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expirés:</span>
                <span className="font-medium text-red-600">
                  {abonnements?.filter(a => a.statut === 'expire').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Annulés:</span>
                <span className="font-medium text-gray-600">
                  {abonnements?.filter(a => a.statut === 'annule').length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
