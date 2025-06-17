
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('Function confirm-reservation called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing confirm-reservation request');
    const { token } = await req.json();

    console.log('Tentative de confirmation avec le token:', token);

    if (!token) {
      console.error('Token manquant dans la requête');
      return new Response(
        JSON.stringify({ success: false, error: 'Token manquant' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }

    // Initialiser le client Supabase avec la clé de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase URL:', supabaseUrl ? 'configurée' : 'manquante');
    console.log('Service key:', supabaseServiceKey ? 'configurée' : 'manquante');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Configuration Supabase manquante');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration serveur manquante' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rechercher la réservation par token avec les infos du terrain
    console.log('Recherche de la réservation avec le token:', token);
    const { data: reservation, error: findError } = await supabase
      .from('reservations')
      .select(`
        *,
        terrain:terrains(nom)
      `)
      .eq('confirmation_token', token)
      .eq('statut', 'en_attente')
      .single();

    if (findError || !reservation) {
      console.error('Réservation non trouvée ou déjà confirmée:', findError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token invalide ou réservation déjà confirmée' 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 404 
        }
      );
    }

    console.log('Réservation trouvée:', reservation.id);

    // Vérifier si la réservation n'est pas expirée (15 minutes)
    const createdAt = new Date(reservation.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    console.log('Âge de la réservation en minutes:', diffMinutes);

    if (diffMinutes > 15) {
      console.log('Réservation expirée, annulation...');
      // Annuler la réservation expirée
      await supabase
        .from('reservations')
        .update({ statut: 'annulee' })
        .eq('id', reservation.id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'La réservation a expiré (plus de 15 minutes)' 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 410 
        }
      );
    }

    // Confirmer la réservation
    console.log('Confirmation de la réservation:', reservation.id);
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
          error: 'Erreur lors de la confirmation' 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    console.log('Réservation confirmée avec succès:', reservation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Réservation confirmée avec succès',
        nom_client: reservation.nom_client,
        terrain_nom: reservation.terrain?.nom || 'Terrain inconnu',
        date: reservation.date,
        heure: reservation.heure,
        duree: reservation.duree
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erreur dans confirm-reservation:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur lors de la confirmation',
        details: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
