
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfirmReservation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [reservationData, setReservationData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const token = searchParams.get('token');

  console.log('ConfirmReservation component mounted');
  console.log('Token from URL:', token);
  console.log('Full URL:', window.location.href);

  const confirmReservation = async () => {
    if (!token) {
      console.error('No token found in URL');
      setStatus('error');
      setMessage('Token de confirmation manquant dans l\'URL');
      setDebugInfo('Token manquant dans l\'URL');
      return;
    }

    try {
      console.log('Tentative de confirmation avec le token:', token);
      setDebugInfo('Tentative de confirmation...');
      
      // Vérifier d'abord si Supabase est accessible
      console.log('Test de connexion Supabase...');
      const { data: testData, error: testError } = await supabase.from('terrains').select('count').limit(1);
      console.log('Test Supabase:', { testData, testError });
      
      if (testError) {
        console.error('Erreur de connexion Supabase:', testError);
        setStatus('error');
        setMessage('Erreur de connexion à la base de données');
        setDebugInfo(`Erreur Supabase: ${testError.message}`);
        return;
      }

      console.log('Appel de la fonction Edge confirm-reservation...');
      setDebugInfo('Appel de la fonction Edge...');
      
      const { data, error } = await supabase.functions.invoke('confirm-reservation', {
        body: { token }
      });

      console.log('Réponse complète de la fonction:', { data, error });
      setDebugInfo(`Réponse reçue: ${JSON.stringify({ data, error }, null, 2)}`);

      if (error) {
        console.error('Erreur lors de l\'appel de la fonction:', error);
        setStatus('error');
        setMessage(`Erreur de la fonction: ${error.message}`);
        setDebugInfo(`Erreur fonction: ${JSON.stringify(error, null, 2)}`);
        return;
      }

      if (data?.success) {
        console.log('Confirmation réussie:', data);
        setStatus('success');
        setReservationData(data);
        setMessage('Votre réservation a été confirmée avec succès !');
        setDebugInfo('Succès !');
      } else {
        console.error('Échec de la confirmation:', data);
        setStatus('error');
        setMessage(data?.error || 'Erreur lors de la confirmation');
        setDebugInfo(`Échec: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      console.error('Erreur inattendue:', error);
      setStatus('error');
      setMessage('Une erreur inattendue s\'est produite');
      setDebugInfo(`Erreur catch: ${error.message}\nStack: ${error.stack}`);
    }
  };

  useEffect(() => {
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
              </p>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Retour à l'accueil
              </Button>
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
              
              <div className="text-left bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Informations de débogage :</p>
                <p className="text-xs text-gray-500 break-all">Token: {token || 'non fourni'}</p>
                <p className="text-xs text-gray-500 break-all">URL: {window.location.href}</p>
                <p className="text-xs text-gray-500 break-all">Debug: {debugInfo}</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={confirmReservation}
                  variant="outline"
                  className="w-full"
                >
                  Réessayer
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
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
