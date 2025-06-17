
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    console.log('Tentative de confirmation avec le token:', token);

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token manquant' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }

    // Initialiser le client Supabase avec la clé de service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rechercher la réservation par token avec les infos du terrain
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

    // Vérifier si la réservation n'est pas expirée (15 minutes)
    const createdAt = new Date(reservation.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
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
