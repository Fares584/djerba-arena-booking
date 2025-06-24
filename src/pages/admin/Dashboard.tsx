import { useRequireRole } from '@/hooks/useRequireRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MapPin, TrendingUp } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { useAbonnements } from '@/hooks/useAbonnements';
import { useTerrains } from '@/hooks/useTerrains';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { role, loading } = useRequireRole(['admin']);
  
  const { data: reservations = [] } = useReservations();
  const { data: abonnements = [] } = useAbonnements();
  const { data: terrains = [] } = useTerrains();

  const today = new Date();
  const todayReservations = reservations.filter(r => 
    r.statut === 'confirmee' && isToday(new Date(r.date))
  );
  const tomorrowReservations = reservations.filter(r => 
    r.statut === 'confirmee' && isTomorrow(new Date(r.date))
  );
  const activeAbonnements = abonnements.filter(a => a.statut === 'actif');
  const activeTerrains = terrains.filter(t => t.actif);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Accès non autorisé</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations Demain</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tomorrowReservations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAbonnements.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terrains Actifs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTerrains.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Réservations Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            {todayReservations.length === 0 ? (
              <p className="text-gray-500">Aucune réservation confirmée aujourd'hui</p>
            ) : (
              <div className="space-y-2">
                {todayReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{reservation.nom_client}</p>
                      <p className="text-sm text-gray-600">{reservation.heure} - {terrains.find(t => t.id === reservation.terrain_id)?.nom}</p>
                    </div>
                  </div>
                ))}
                {todayReservations.length > 5 && (
                  <p className="text-sm text-gray-500">... et {todayReservations.length - 5} autres</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réservations Demain</CardTitle>
          </CardHeader>
          <CardContent>
            {tomorrowReservations.length === 0 ? (
              <p className="text-gray-500">Aucune réservation confirmée demain</p>
            ) : (
              <div className="space-y-2">
                {tomorrowReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{reservation.nom_client}</p>
                      <p className="text-sm text-gray-600">{reservation.heure} - {terrains.find(t => t.id === reservation.terrain_id)?.nom}</p>
                    </div>
                  </div>
                ))}
                {tomorrowReservations.length > 5 && (
                  <p className="text-sm text-gray-500">... et {tomorrowReservations.length - 5} autres</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
