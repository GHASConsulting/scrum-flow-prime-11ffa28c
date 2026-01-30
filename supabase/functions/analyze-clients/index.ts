import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ClientStatus {
  id: string;
  nome: string;
  responsavel: string;
  geral: string;
  metodologia: string;
  prioridades: string;
  produtividade: string;
  riscos: string;
}

interface AnalysisRequest {
  clientes: ClientStatus[];
  periodo?: {
    inicio: string;
    fim: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientes, periodo }: AnalysisRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Preparar dados para análise
    const clientesCriticos = clientes.filter(c => c.geral !== 'verde');
    const totalClientes = clientes.length;
    const clientesVermelhos = clientes.filter(c => c.geral === 'vermelho').length;
    const clientesAmarelos = clientes.filter(c => c.geral === 'amarelo').length;
    const clientesVerdes = clientes.filter(c => c.geral === 'verde').length;
    const clientesCinza = clientes.filter(c => c.geral === 'cinza').length;

    // Estatísticas por indicador
    const stats = {
      metodologia: {
        vermelho: clientes.filter(c => c.metodologia === 'vermelho').length,
        amarelo: clientes.filter(c => c.metodologia === 'amarelo').length,
        verde: clientes.filter(c => c.metodologia === 'verde').length,
      },
      prioridades: {
        vermelho: clientes.filter(c => c.prioridades === 'vermelho').length,
        amarelo: clientes.filter(c => c.prioridades === 'amarelo').length,
        verde: clientes.filter(c => c.prioridades === 'verde').length,
      },
      produtividade: {
        vermelho: clientes.filter(c => c.produtividade === 'vermelho').length,
        amarelo: clientes.filter(c => c.produtividade === 'amarelo').length,
        verde: clientes.filter(c => c.produtividade === 'verde').length,
      },
      riscos: {
        vermelho: clientes.filter(c => c.riscos === 'vermelho').length,
        amarelo: clientes.filter(c => c.riscos === 'amarelo').length,
        verde: clientes.filter(c => c.riscos === 'verde').length,
      },
    };

    // Agrupar por responsável
    const porResponsavel: Record<string, ClientStatus[]> = {};
    clientes.forEach(c => {
      const resp = c.responsavel || 'Sem responsável';
      if (!porResponsavel[resp]) porResponsavel[resp] = [];
      porResponsavel[resp].push(c);
    });

    const periodoTexto = periodo?.inicio && periodo?.fim 
      ? `Período: ${periodo.inicio} a ${periodo.fim}` 
      : 'Período: Histórico completo';

    const prompt = `Você é um consultor de gestão de projetos e clientes. Analise os seguintes dados de indicadores de clientes e gere um relatório executivo detalhado.

${periodoTexto}

## DADOS DOS CLIENTES

### Resumo Geral:
- Total de clientes: ${totalClientes}
- Clientes críticos (vermelho): ${clientesVermelhos}
- Clientes em atenção (amarelo): ${clientesAmarelos}
- Clientes saudáveis (verde): ${clientesVerdes}
- Clientes sem dados (cinza): ${clientesCinza}

### Estatísticas por Indicador:

**Metodologia** (avalia o progresso de tarefas em sprints):
- Vermelho: ${stats.metodologia.vermelho} clientes
- Amarelo: ${stats.metodologia.amarelo} clientes
- Verde: ${stats.metodologia.verde} clientes

**Prioridades** (avalia atrasos em listas de prioridades):
- Vermelho: ${stats.prioridades.vermelho} clientes
- Amarelo: ${stats.prioridades.amarelo} clientes
- Verde: ${stats.prioridades.verde} clientes

**Produtividade** (avalia chamados abertos e backlog):
- Vermelho: ${stats.produtividade.vermelho} clientes
- Amarelo: ${stats.produtividade.amarelo} clientes
- Verde: ${stats.produtividade.verde} clientes

**Riscos e BO's** (avalia riscos abertos e em mitigação):
- Vermelho: ${stats.riscos.vermelho} clientes
- Amarelo: ${stats.riscos.amarelo} clientes
- Verde: ${stats.riscos.verde} clientes

### Lista de Clientes Críticos (não verdes):
${clientesCriticos.map((c, i) => `${i + 1}. **${c.nome}** (Responsável: ${c.responsavel || 'Não definido'})
   - Status Geral: ${c.geral.toUpperCase()}
   - Metodologia: ${c.metodologia}
   - Prioridades: ${c.prioridades}
   - Produtividade: ${c.produtividade}
   - Riscos: ${c.riscos}`).join('\n')}

### Distribuição por Responsável:
${Object.entries(porResponsavel).map(([resp, lista]) => {
  const criticos = lista.filter(c => c.geral !== 'verde').length;
  return `- **${resp}**: ${lista.length} clientes (${criticos} críticos)`;
}).join('\n')}

---

## GERE O RELATÓRIO COM A SEGUINTE ESTRUTURA:

### 1. ANÁLISE CRÍTICA GERAL
Faça uma análise crítica abrangente da situação geral, incluindo:
- Principais problemas comuns identificados entre os clientes críticos
- Possíveis causas-raiz dos problemas
- Necessidade de alinhamentos com equipe e clientes
- Necessidade de feedbacks e desenvolvimentos da equipe
- Pontos de atenção estratégicos
- Recomendações gerais para melhoria

### 2. CLIENTES CRÍTICOS
Liste todos os clientes cujo farol geral NÃO está verde, ordenados do mais crítico para o menos crítico.
Para cada cliente, explique brevemente o motivo da criticidade baseado nos indicadores.

### 3. AÇÕES POR CLIENTE
Para cada cliente crítico listado acima (mantendo a mesma ordem), indique:
- Ações específicas necessárias para correção de cada indicador problemático
- Prioridade das ações (Alta/Média/Baixa)
- Responsável sugerido para acompanhamento

Seja objetivo, pragmático e forneça insights acionáveis. Use linguagem profissional e direta.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um consultor sênior de gestão de projetos especializado em análise de indicadores de performance de clientes. Responda sempre em português brasileiro." },
          { role: "user", content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar análise" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("analyze-clients error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
