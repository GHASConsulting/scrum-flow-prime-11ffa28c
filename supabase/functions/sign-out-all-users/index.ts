import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get authorization header to verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the calling user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "administrador") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    let signedOutCount = 0;
    const errors: string[] = [];

    // Sign out each user by updating their aal_level to force re-authentication
    // This invalidates all sessions for each user
    for (const authUser of users.users) {
      try {
        // Update user to invalidate all their sessions
        // By updating the user, all their refresh tokens become invalid
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          authUser.id,
          { 
            // Changing app_metadata forces session invalidation
            app_metadata: { 
              ...authUser.app_metadata,
              sessions_invalidated_at: new Date().toISOString() 
            }
          }
        );
        
        if (error) {
          errors.push(`Failed to invalidate sessions for ${authUser.email}: ${error.message}`);
        } else {
          signedOutCount++;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push(`Error processing ${authUser.email}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sessões de ${signedOutCount} usuários foram invalidadas. Eles precisarão fazer login novamente.`,
        totalUsers: users.users.length,
        signedOutCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error signing out all users:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
