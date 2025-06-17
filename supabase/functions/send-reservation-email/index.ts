
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
    const { reservation_id, email, nom_client, terrain_nom, date, heure, duree, confirmation_token } = await req.json();

    // Initialiser le client Supabase avec la clé de service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // URL de confirmation
    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/supabase', '')}/confirm-reservation?token=${confirmation_token}`;

    // Créer le contenu de l'email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Confirmation de votre réservation</h2>
        
        <p>Bonjour <strong>${nom_client}</strong>,</p>
        
        <p>Votre réservation a été créée avec succès !</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Détails de votre réservation :</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>Terrain :</strong> ${terrain_nom}</li>
            <li style="padding: 5px 0;"><strong>Date :</strong> ${new Date(date).toLocaleDateString('fr-FR')}</li>
            <li style="padding: 5px 0;"><strong>Heure :</strong> ${heure}</li>
            <li style="padding: 5px 0;"><strong>Durée :</strong> ${duree}h</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Confirmer ma réservation
          </a>
        </div>
        
        <p style="color: #d97706; background-color: #fef3c7; padding: 10px; border-radius: 4px;">
          <strong>Important :</strong> Veuillez confirmer votre réservation en cliquant sur le bouton ci-dessus dans les 15 minutes, sinon elle sera automatiquement annulée.
        </p>
        
        <p>Merci de nous faire confiance !</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Sport Center - Votre centre sportif de confiance
        </p>
      </div>
    `;

    // Envoyer l'email via l'API admin de Supabase
    const { error } = await supabase.auth.admin.generateLink({
      type: 'email',
      email: email,
      options: {
        data: {
          email_type: 'reservation_confirmation',
          subject: 'Confirmation de votre réservation - Sport Center',
          html_content: emailContent
        }
      }
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }

    console.log('Email de confirmation envoyé avec succès pour la réservation:', reservation_id);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Email envoyé avec succès' }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erreur dans send-reservation-email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
