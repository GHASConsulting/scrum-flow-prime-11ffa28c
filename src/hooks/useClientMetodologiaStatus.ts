import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

type StatusColor = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

interface MetodologiaStatusData {
  status: StatusColor;
  tarefasTotal: number;
  tarefasConcluidas: number;
  percentualConcluido: number;
  percentualTempoTranscorrido: number;
  desvio: number;
}

interface BacklogItem {
  id: string;
  cliente_id: string | null;
  tipo_tarefa: string | null;
  status: string;
}

interface Sprint {
  id: string;
  data_inicio: string;
  data_fim: string;
}

interface SprintTarefa {
  backlog_id: string;
  sprint_id: string;
}

export function useClientMetodologiaStatus(
  filterDataInicio?: string,
  filterDataFim?: string
) {
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintTarefas, setSprintTarefas] = useState<SprintTarefa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [backlogRes, sprintsRes, sprintTarefasRes] = await Promise.all([
          supabase
            .from('backlog')
            .select('id, cliente_id, tipo_tarefa, status')
            .eq('tipo_tarefa', 'Cliente')
            .not('cliente_id', 'is', null),
          supabase
            .from('sprint')
            .select('id, data_inicio, data_fim'),
          supabase
            .from('sprint_tarefas')
            .select('backlog_id, sprint_id')
        ]);

        if (backlogRes.data) setBacklog(backlogRes.data);
        if (sprintsRes.data) setSprints(sprintsRes.data);
        if (sprintTarefasRes.data) setSprintTarefas(sprintTarefasRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados de metodologia:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = useMemo(() => {
    const statusMap: Record<string, MetodologiaStatusData> = {};

    if (loading) return statusMap;

    const hoje = new Date();
    let percentualTempoTranscorrido = 100;

    // Se houver filtro de período, calcular % de tempo transcorrido
    if (filterDataInicio && filterDataFim) {
      const periodoInicio = new Date(filterDataInicio + 'T00:00:00');
      const periodoFim = new Date(filterDataFim + 'T23:59:59');

      const duracaoTotalPeriodo = periodoFim.getTime() - periodoInicio.getTime();
      let tempoTranscorrido: number;
      
      if (hoje >= periodoFim) {
        tempoTranscorrido = duracaoTotalPeriodo;
      } else if (hoje <= periodoInicio) {
        tempoTranscorrido = 0;
      } else {
        tempoTranscorrido = hoje.getTime() - periodoInicio.getTime();
      }
      
      percentualTempoTranscorrido = duracaoTotalPeriodo > 0 
        ? (tempoTranscorrido / duracaoTotalPeriodo) * 100 
        : 0;
    }

    // Filtrar sprints que estão dentro do período filtrado
    const sprintsNoPeriodo = filterDataInicio && filterDataFim
      ? sprints.filter(sprint => {
          const sprintInicio = new Date(sprint.data_inicio);
          const sprintFim = new Date(sprint.data_fim);
          const periodoInicio = new Date(filterDataInicio);
          const periodoFim = new Date(filterDataFim);
          
          // Sprint está no período se houver interseção
          return sprintInicio <= periodoFim && sprintFim >= periodoInicio;
        })
      : [];

    const sprintIdsNoPeriodo = new Set(sprintsNoPeriodo.map(s => s.id));

    // Agrupar por cliente_id
    const clienteIds = new Set(backlog.map(t => t.cliente_id).filter(Boolean));

    clienteIds.forEach(clienteId => {
      if (!clienteId) return;

      // Se não há período selecionado, retorna cinza (não mensurado)
      if (!filterDataInicio || !filterDataFim) {
        statusMap[clienteId] = {
          status: 'cinza',
          tarefasTotal: 0,
          tarefasConcluidas: 0,
          percentualConcluido: 0,
          percentualTempoTranscorrido: 0,
          desvio: 0,
        };
        return;
      }

      // Buscar backlog_ids que estão vinculados a sprints no período
      const backlogIdsNoPeriodo = new Set(
        sprintTarefas
          .filter(st => sprintIdsNoPeriodo.has(st.sprint_id))
          .map(st => st.backlog_id)
      );

      // Filtrar tarefas do cliente que estão vinculadas a sprints no período
      const tarefasDoCliente = backlog.filter(
        t => t.cliente_id === clienteId && backlogIdsNoPeriodo.has(t.id)
      );

      if (tarefasDoCliente.length === 0) {
        // Nenhuma tarefa vinculada a sprints no período = cinza
        statusMap[clienteId] = {
          status: 'cinza',
          tarefasTotal: 0,
          tarefasConcluidas: 0,
          percentualConcluido: 0,
          percentualTempoTranscorrido,
          desvio: 0,
        };
        return;
      }

      // Calcular tarefas concluídas (status = 'done' ou 'validated')
      const tarefasConcluidas = tarefasDoCliente.filter(
        t => t.status === 'done' || t.status === 'validated'
      ).length;

      const percentualConcluido = (tarefasConcluidas / tarefasDoCliente.length) * 100;
      const desvio = percentualTempoTranscorrido - percentualConcluido;

      // Determinar status com novas regras:
      // Desvio > 18%: Vermelho
      // Desvio > 10% e <= 18%: Amarelo
      // Desvio <= 10%: Verde
      let status: StatusColor;
      if (desvio > 18) {
        status = 'vermelho';
      } else if (desvio > 10) {
        status = 'amarelo';
      } else {
        status = 'verde';
      }

      statusMap[clienteId] = {
        status,
        tarefasTotal: tarefasDoCliente.length,
        tarefasConcluidas,
        percentualConcluido,
        percentualTempoTranscorrido,
        desvio,
      };
    });

    return statusMap;
  }, [backlog, sprints, sprintTarefas, loading, filterDataInicio, filterDataFim]);

  return { data, loading };
}
