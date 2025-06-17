
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('=== FONCTION CONFIRM-RESERVATION DÉMARRÉE ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== TRAITEMENT DE LA REQUÊTE ===');
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Body reçu:', requestBody);
    } catch (jsonError) {
      console.error('Erreur parsing JSON:', jsonError);
      return new Response(
        JSON.stringify({ success: false, error: 'Body JSON invalide' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }

    const { token } = requestBody;
    console.log('Token extrait:', token);

    if (!token) {
      console.error('Token manquant');
      return new Response(
        JSON.stringify({ success: false, error: 'Token de confirmation manquant' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }

    // Vérifier les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('=== CONFIGURATION SUPABASE ===');
    console.log('SUPABASE_URL présente:', !!supabaseUrl);
    console.log('SERVICE_KEY présente:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables d\'environnement manquantes');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuration serveur manquante',
          debug: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey
          }
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    // Initialiser le client Supabase
    console.log('=== INITIALISATION CLIENT SUPABASE ===');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Client Supabase créé');

    // Rechercher la réservation
    console.log('=== RECHERCHE RÉSERVATION ===');
    console.log('Recherche avec token:', token);
    
    const { data: reservation, error: findError } = await supabase
      .from('reservations')
      .select(`
        *,
        terrain:terrains(nom)
      `)
      .eq('confirmation_token', token)
      .eq('statut', 'en_attente')
      .single();

    console.log('Résultat recherche:', { reservation, findError });

    if (findError) {
      console.error('Erreur lors de la recherche:', findError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erreur lors de la recherche de la réservation',
          debug: {
            supabaseError: findError.message,
            token: token
          }
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    if (!reservation) {
      console.error('Réservation non trouvée pour le token:', token);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token invalide ou réservation déjà confirmée',
          debug: {
            token: token,
            foundReservation: false
          }
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 404 
        }
      );
    }

    console.log('=== RÉSERVATION TROUVÉE ===');
    console.log('ID réservation:', reservation.id);
    console.log('Statut actuel:', reservation.statut);
    console.log('Créée le:', reservation.created_at);

    // Vérifier l'expiration (15 minutes)
    const createdAt = new Date(reservation.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    console.log('=== VÉRIFICATION EXPIRATION ===');
    console.log('Âge en minutes:', diffMinutes);
    console.log('Limite:', 15);

    if (diffMinutes > 15) {
      console.log('Réservation expirée, annulation...');
      
      const { error: cancelError } = await supabase
        .from('reservations')
        .update({ statut: 'annulee' })
        .eq('id', reservation.id);

      if (cancelError) {
        console.error('Erreur lors de l\'annulation:', cancelError);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'La réservation a expiré (plus de 15 minutes)',
          debug: {
            ageMinutes: diffMinutes,
            expired: true
          }
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 410 
        }
      );
    }

    // Confirmer la réservation
    console.log('=== CONFIRMATION RÉSERVATION ===');
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ 
        statut: 'confirmee',
        confirmed_by_user: true 
      })
      .eq('id', reservation.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erreur lors de la confirmation',
          debug: {
            updateError: updateError.message
          }
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    console.log('=== CONFIRMATION RÉUSSIE ===');
    console.log('Réservation confirmée:', reservation.id);

    const response = {
      success: true,
      message: 'Réservation confirmée avec succès',
      nom_client: reservation.nom_client,
      terrain_nom: reservation.terrain?.nom || 'Terrain inconnu',
      date: reservation.date,
      heure: reservation.heure,
      duree: reservation.duree,
      debug: {
        reservationId: reservation.id,
        confirmedAt: new Date().toISOString()
      }
    };

    console.log('Réponse finale:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('=== ERREUR GLOBALE ===');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur serveur interne',
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
