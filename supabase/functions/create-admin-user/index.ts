import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Create admin user function called');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, password, nome, role } = await req.json();
    console.log('Creating user with email:', email, 'role:', role);

    // Criar usuário no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || 'Usuário' }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    console.log('User created:', authData.user?.id);

    const userId = authData.user!.id;
    const userRole = role || 'operador';

    // Verificar se o perfil já existe (trigger pode ter criado)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Se não existe perfil, criar manualmente
    if (!existingProfile) {
      console.log('Creating profile for user:', userId);
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          nome: nome || 'Usuário',
          email: email,
          deve_alterar_senha: true
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Não falhar se o perfil já existe por race condition
        if (!profileError.message.includes('duplicate')) {
          throw profileError;
        }
      }
    }

    // Adicionar role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: userRole
      });

    if (roleError) {
      console.error('Error adding role:', roleError);
      throw roleError;
    }

    console.log('User role added successfully:', userRole);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user?.id,
        email: authData.user?.email 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
