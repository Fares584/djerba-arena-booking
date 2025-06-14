
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

    // Find the reservation with that token and not already confirmed
    const { data, error } = await supabase
      .from("reservations")
      .update({ confirmed_by_user: true, statut: "confirmee" })
      .eq("confirmation_token", token)
      .eq("confirmed_by_user", false)
      .select()
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Lien invalide ou déjà confirmé" }),
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
