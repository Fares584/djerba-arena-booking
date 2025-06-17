
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
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const token = searchParams.get('token');

  const addDebug = (msg: string, data?: any) => {
    console.log(msg, data);
    setDebugInfo(prev => [...prev, { msg, data, time: new Date().toISOString() }]);
  };

  const confirmReservation = async () => {
    if (!token) {
      addDebug('❌ Pas de token dans l\'URL');
      setStatus('error');
      setMessage('Token de confirmation manquant dans l\'URL');
      return;
    }

    addDebug('🚀 Début de la confirmation', { token });
    
    try {
      addDebug('📡 Appel de la fonction Edge confirm-reservation...');
      
      const { data, error } = await supabase.functions.invoke('confirm-reservation', {
        body: { token }
      });

      addDebug('📨 Réponse reçue', { data, error });

      if (error) {
        addDebug('❌ Erreur de la fonction Edge', error);
        setStatus('error');
        setMessage(`Erreur: ${error.message}`);
        return;
      }

      if (data?.success) {
        addDebug('✅ Confirmation réussie', data);
        setStatus('success');
        setReservationData(data);
        setMessage('Votre réservation a été confirmée avec succès !');
      } else {
        addDebug('❌ Échec de la confirmation', data);
        setStatus('error');
        setMessage(data?.error || 'Erreur lors de la confirmation');
      }
    } catch (error: any) {
      addDebug('💥 Erreur catch', error);
      setStatus('error');
      setMessage('Une erreur inattendue s\'est produite');
    }
  };

  useEffect(() => {
    addDebug('🔧 Component monté', { url: window.location.href, token });
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
            </>
          )}

          {/* Informations de débogage */}
          <details className="text-left bg-gray-50 p-3 rounded-lg">
            <summary className="text-sm text-gray-600 cursor-pointer">Informations de débogage</summary>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">Token: {token || 'non fourni'}</p>
              <p className="text-xs text-gray-500">URL: {window.location.href}</p>
              <div className="max-h-40 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-xs text-gray-500 border-b pb-1 mb-1">
                    <strong>{info.time}:</strong> {info.msg}
                    {info.data && <pre className="mt-1 text-xs">{JSON.stringify(info.data, null, 2)}</pre>}
                  </div>
                ))}
              </div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmReservation;
