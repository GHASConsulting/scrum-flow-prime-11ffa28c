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

    const { email, password, nome, role, pessoa_id } = await req.json();
    console.log('Creating user with email:', email, 'role:', role, 'pessoa_id:', pessoa_id);

    let userId: string;

    // Tentar criar usuário no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || 'Usuário' }
    });

    if (authError) {
      // Se o usuário já existe, buscar o ID dele
      if (authError.code === 'email_exists') {
        console.log('User already exists, fetching existing user...');
        
        // Buscar usuário existente por email
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listing users:', listError);
          throw listError;
        }
        
        const existingUser = existingUsers.users.find(u => u.email === email);
        if (!existingUser) {
          throw new Error('Usuário existe mas não foi encontrado');
        }
        
        userId = existingUser.id;
        console.log('Found existing user:', userId);
      } else {
        console.error('Error creating user:', authError);
        throw authError;
      }
    } else {
      userId = authData.user!.id;
      console.log('User created:', userId);
    }

    const userRole = role || 'operador';

    // Verificar se o perfil já existe
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
      console.log('Profile created successfully');
    } else {
      console.log('Profile already exists for user:', userId);
    }

    // Verificar se o role já existe
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingRole) {
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
    } else {
      console.log('Role already exists for user:', userId);
    }

    // Vincular pessoa ao usuário (atualizar user_id na tabela pessoa)
    if (pessoa_id) {
      console.log('Linking pessoa to user:', pessoa_id, '->', userId);
      const { error: pessoaError } = await supabaseAdmin
        .from('pessoa')
        .update({ user_id: userId, deve_alterar_senha: true })
        .eq('id', pessoa_id);

      if (pessoaError) {
        console.error('Error linking pessoa to user:', pessoaError);
        throw pessoaError;
      }
      console.log('Pessoa linked successfully');
    }

    console.log('User created successfully:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        email 
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
