import { useMemo } from 'react';
import { useBacklog } from './useBacklog';
import { useSprints } from './useSprints';
import { useSprintTarefas } from './useSprintTarefas';

type StatusColor = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

interface MetodologiaStatusData {
  status: StatusColor;
  tarefasTotal: number;
  tarefasConcluidas: number;
  percentualConcluido: number;
  percentualTempoTranscorrido: number;
  desvio: number;
}

export function useClientMetodologiaStatus(
  filterDataInicio?: string,
  filterDataFim?: string
) {
  const { backlog } = useBacklog();
  const { sprints } = useSprints();
  const { sprintTarefas } = useSprintTarefas();

  const data = useMemo(() => {
    const statusMap: Record<string, MetodologiaStatusData> = {};

    // Se não houver filtro de período, retornar vazio (todos cinza)
    if (!filterDataInicio || !filterDataFim) {
      return statusMap;
    }

    const periodoInicio = new Date(filterDataInicio + 'T00:00:00');
    const periodoFim = new Date(filterDataFim + 'T23:59:59');
    const hoje = new Date();

    // Calcular % de tempo transcorrido no período filtrado
    const duracaoTotalPeriodo = periodoFim.getTime() - periodoInicio.getTime();
    let tempoTranscorrido: number;
    
    if (hoje >= periodoFim) {
      tempoTranscorrido = duracaoTotalPeriodo;
    } else if (hoje <= periodoInicio) {
      tempoTranscorrido = 0;
    } else {
      tempoTranscorrido = hoje.getTime() - periodoInicio.getTime();
    }
    
    const percentualTempoTranscorrido = duracaoTotalPeriodo > 0 
      ? (tempoTranscorrido / duracaoTotalPeriodo) * 100 
      : 0;

    // Filtrar apenas tarefas do backlog com tipo_tarefa = "Cliente"
    const tarefasCliente = backlog.filter(b => b.tipo_tarefa === 'Cliente');

    // Agrupar por cliente_id
    const clienteIds = new Set(tarefasCliente.map(t => t.cliente_id).filter(Boolean));

    clienteIds.forEach(clienteId => {
      if (!clienteId) return;

      // Buscar as tarefas deste cliente
      const tarefasDoCliente = tarefasCliente.filter(t => t.cliente_id === clienteId);
      
      // Filtrar tarefas que têm sprint_tarefas dentro do período filtrado
      const tarefasNoPeriodo: typeof tarefasDoCliente = [];
      
      tarefasDoCliente.forEach(tarefa => {
        // Verificar se esta tarefa está em alguma sprint do período
        const sprintTarefasDaTarefa = sprintTarefas.filter(st => st.backlog_id === tarefa.id);
        
        const temSprintNoPeriodo = sprintTarefasDaTarefa.some(st => {
          const sprint = sprints.find(s => s.id === st.sprint_id);
          if (!sprint) return false;
          
          const sprintInicio = new Date(sprint.data_inicio + 'T00:00:00');
          const sprintFim = new Date(sprint.data_fim + 'T23:59:59');
          
          // Verificar se a sprint se sobrepõe ao período filtrado
          return sprintFim >= periodoInicio && sprintInicio <= periodoFim;
        });
        
        if (temSprintNoPeriodo) {
          tarefasNoPeriodo.push(tarefa);
        }
      });

      if (tarefasNoPeriodo.length === 0) {
        // Nenhuma tarefa no período = cinza
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
      const tarefasConcluidas = tarefasNoPeriodo.filter(
        t => t.status === 'done' || t.status === 'validated'
      ).length;

      const percentualConcluido = (tarefasConcluidas / tarefasNoPeriodo.length) * 100;
      const desvio = percentualTempoTranscorrido - percentualConcluido;

      // Determinar status
      let status: StatusColor;
      if (desvio > 10) {
        status = 'vermelho';
      } else if (desvio > 0) {
        status = 'amarelo';
      } else {
        status = 'verde';
      }

      statusMap[clienteId] = {
        status,
        tarefasTotal: tarefasNoPeriodo.length,
        tarefasConcluidas,
        percentualConcluido,
        percentualTempoTranscorrido,
        desvio,
      };
    });

    return statusMap;
  }, [backlog, sprints, sprintTarefas, filterDataInicio, filterDataFim]);

  return { data };
}
