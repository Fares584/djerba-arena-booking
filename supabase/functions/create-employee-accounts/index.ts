
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Créer les comptes employés
    const employees = [
      { email: 'ahmed@planetsports.com', password: 'Ahmed123!' },
      { email: 'wassim@planetsports.com', password: 'Wassim123!' },
      { email: 'khalil@planetsports.com', password: 'Khalil123!' }
    ];

    const results = [];

    for (const employee of employees) {
      // Créer l'utilisateur
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: employee.email,
        password: employee.password,
        email_confirm: true
      });

      if (userError) {
        console.error(`Error creating user ${employee.email}:`, userError);
        results.push({ email: employee.email, error: userError.message });
        continue;
      }

      // Ajouter le rôle employee
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'employee'
        });

      if (roleError) {
        console.error(`Error adding role for ${employee.email}:`, roleError);
        results.push({ 
          email: employee.email, 
          user_created: true, 
          role_error: roleError.message 
        });
      } else {
        results.push({ 
          email: employee.email, 
          password: employee.password,
          user_created: true, 
          role_assigned: true 
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
