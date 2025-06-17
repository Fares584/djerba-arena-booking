
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('🚀 Fonction confirm-reservation démarrée');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Body reçu:', requestBody);
    
    const { token } = requestBody;
    
    if (!token) {
      console.error('❌ Token manquant');
      return new Response(
        JSON.stringify({ success: false, error: 'Token manquant' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400 
        }
      );
    }

    console.log('🔍 Token reçu:', token);

    // Configuration Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Configuration Supabase:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuration serveur incorrecte' 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Client Supabase créé');

    // Rechercher la réservation
    console.log('🔍 Recherche de la réservation...');
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
      console.error('❌ Erreur recherche:', findError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erreur lors de la recherche',
          details: findError.message 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    if (!reservation) {
      console.error('❌ Réservation non trouvée');
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

    console.log('✅ Réservation trouvée:', reservation.id);

    // Vérifier l'expiration (15 minutes)
    const createdAt = new Date(reservation.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    console.log('⏱️ Âge de la réservation:', diffMinutes, 'minutes');

    if (diffMinutes > 15) {
      console.log('⚠️ Réservation expirée, annulation...');
      
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
    console.log('✅ Confirmation de la réservation...');
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ 
        statut: 'confirmee',
        confirmed_by_user: true 
      })
      .eq('id', reservation.id);

    if (updateError) {
      console.error('❌ Erreur confirmation:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erreur lors de la confirmation',
          details: updateError.message 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }

    console.log('🎉 Réservation confirmée avec succès !');

    const response = {
      success: true,
      message: 'Réservation confirmée avec succès',
      nom_client: reservation.nom_client,
      terrain_nom: reservation.terrain?.nom || 'Terrain inconnu',
      date: reservation.date,
      heure: reservation.heure,
      duree: reservation.duree
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Erreur globale:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur serveur interne',
        details: error.message
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
