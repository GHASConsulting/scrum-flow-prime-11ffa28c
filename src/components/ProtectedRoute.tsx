import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, deveAlterarSenha } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);
  useEffect(() => {
    // Redirecionar para alteração de senha se necessário
    // Não redirecionar se já estiver na página de alteração de senha
    if (!loading && user && deveAlterarSenha === true && location.pathname !== "/alterar-senha") {
      navigate("/alterar-senha");
    }
  }, [user, loading, deveAlterarSenha, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Mostra loading enquanto redireciona para evitar 404
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
