
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const { token } =
      req.method === "POST"
        ? await req.json()
        : Object.fromEntries(url.searchParams.entries());

    if (!token) {
      return new Response(JSON.stringify({ error: "Token manquant" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // DEBUG: Logger ce qu'on cherche
    const { data: checkData, error: checkErr } = await supabase
      .from("reservations")
      .select("*")
      .eq("confirmation_token", token)
      .order("created_at", { ascending: false });

    if (checkErr) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la recherche de la réservation", details: checkErr }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!checkData || checkData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucune réservation trouvée avec ce token", token }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Trouver la réservation non encore confirmée
    const { data, error } = await supabase
      .from("reservations")
      .update({ confirmed_by_user: true, statut: "confirmee" })
      .eq("confirmation_token", token)
      .eq("confirmed_by_user", false)
      .select()
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la confirmation de la réservation", details: error }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          error: "Lien invalide ou déjà confirmé",
          token,
          rows_with_token: checkData,
          message: "Aucune réservation en attente avec ce token à confirmer.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ success: true, nom_client: data.nom_client }), {
      headers: corsHeaders
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
