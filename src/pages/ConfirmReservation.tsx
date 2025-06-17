
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Calendar, Clock, MapPin } from 'lucide-react';

const ConfirmReservation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [reservationData, setReservationData] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmation manquant');
      return;
    }

    const confirmReservation = async () => {
      try {
        console.log('Tentative de confirmation avec le token:', token);
        
        const { data, error } = await supabase.functions.invoke('confirm-reservation', {
          body: { token }
        });

        if (error) {
          console.error('Erreur lors de la confirmation:', error);
          setStatus('error');
          setMessage(error.message || 'Erreur lors de la confirmation');
          return;
        }

        if (data?.success) {
          setStatus('success');
          setReservationData(data);
          setMessage('Votre réservation a été confirmée avec succès !');
        } else {
          setStatus('error');
          setMessage(data?.error || 'Erreur lors de la confirmation');
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
        setStatus('error');
        setMessage('Une erreur inattendue s\'est produite');
      }
    };

    confirmReservation();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && (
              <span className="text-blue-600">Confirmation en cours...</span>
            )}
            {status === 'success' && (
              <span className="text-green-600">Réservation confirmée !</span>
            )}
            {status === 'error' && (
              <span className="text-red-600">Erreur de confirmation</span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              {reservationData?.nom_client && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-lg font-semibold text-green-800 mb-2">
                    Merci {reservationData.nom_client} !
                  </p>
                  <p className="text-green-700">{message}</p>
                </div>
              )}
              
              {reservationData && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                  <h3 className="font-semibold text-gray-800 mb-3 text-center">Détails de votre réservation</h3>
                  <div className="space-y-2">
                    {reservationData.terrain_nom && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Terrain:</span>
                        <span className="font-medium">{reservationData.terrain_nom}</span>
                      </div>
                    )}
                    {reservationData.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(reservationData.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {reservationData.heure && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Heure:</span>
                        <span className="font-medium">{reservationData.heure}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                ✅ Votre réservation est maintenant confirmée dans notre système.
                <br />
                Vous pouvez maintenant fermer cette page.
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-700 font-medium">{message}</p>
              </div>
              
              <p className="text-sm text-gray-500">
                Si le problème persiste, veuillez nous contacter directement.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmReservation;
