import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Backlog from "./pages/Backlog";
import SprintPlanning from "./pages/SprintPlanning";
import Daily from "./pages/Daily";
import HistoricoDaily from "./pages/HistoricoDaily";
import Retrospectiva from "./pages/Retrospectiva";
import Riscos from "./pages/Riscos";
import Auth from "./pages/Auth";
import AlterarSenha from "./pages/AlterarSenha";
import Administracao from "./pages/Administracao";
import CadastrosSistema from "./pages/CadastrosSistema";
import RoadmapGeral from "./pages/RoadmapGeral";
import RoadmapProdutos from "./pages/RoadmapProdutos";
import RoadmapGHAS from "./pages/RoadmapGHAS";
import RoadmapInovemed from "./pages/RoadmapInovemed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/alterar-senha" element={<ProtectedRoute><AlterarSenha /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/backlog" element={<ProtectedRoute><Backlog /></ProtectedRoute>} />
          <Route path="/sprint-planning" element={<ProtectedRoute><SprintPlanning /></ProtectedRoute>} />
          <Route path="/daily" element={<ProtectedRoute><Daily /></ProtectedRoute>} />
          <Route path="/daily/historico" element={<ProtectedRoute><HistoricoDaily /></ProtectedRoute>} />
          <Route path="/retrospectiva" element={<ProtectedRoute><Retrospectiva /></ProtectedRoute>} />
          <Route path="/riscos" element={<ProtectedRoute><Riscos /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><RoadmapGeral /></ProtectedRoute>} />
          <Route path="/roadmap/produtos" element={<ProtectedRoute><RoadmapProdutos /></ProtectedRoute>} />
          <Route path="/roadmap/ghas" element={<ProtectedRoute><RoadmapGHAS /></ProtectedRoute>} />
          <Route path="/roadmap/inovemed" element={<ProtectedRoute><RoadmapInovemed /></ProtectedRoute>} />
          <Route path="/administracao" element={<ProtectedRoute><Administracao /></ProtectedRoute>} />
          <Route path="/cadastros" element={<ProtectedRoute><CadastrosSistema /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
