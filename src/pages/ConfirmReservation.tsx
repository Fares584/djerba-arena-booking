
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ConfirmReservation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [clientName, setClientName] = useState('');
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
          setClientName(data.nom_client || '');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirmation en cours...'}
            {status === 'success' && 'Réservation confirmée !'}
            {status === 'error' && 'Erreur de confirmation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-sport-green" />
            </div>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              {clientName && (
                <p className="text-lg font-medium">
                  Merci {clientName} !
                </p>
              )}
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">
                Vous pouvez maintenant fermer cette page.
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">
                Si le problème persiste, veuillez nous contacter.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmReservation;
