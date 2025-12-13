import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "administrador" | "operador" | null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [deveAlterarSenha, setDeveAlterarSenha] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setUserName(null);
          setDeveAlterarSenha(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Buscar role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        setUserRole(null);
      } else {
        setUserRole(roleData?.role as UserRole);
      }

      // Buscar profile para verificar se deve alterar senha e nome
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("deve_alterar_senha, nome")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setDeveAlterarSenha(false);
        setUserName(null);
      } else {
        setDeveAlterarSenha(profileData?.deve_alterar_senha ?? false);
        setUserName(profileData?.nome ?? null);
      }
    } catch (error) {
      console.error("Error:", error);
      setUserRole(null);
      setUserName(null);
      setDeveAlterarSenha(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, userRole, userName, deveAlterarSenha, loading, signOut };
};
