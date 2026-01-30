import { useMemo } from 'react';
import { useBacklog } from './useBacklog';

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

  const data = useMemo(() => {
    const statusMap: Record<string, MetodologiaStatusData> = {};

    const hoje = new Date();
    let percentualTempoTranscorrido = 100; // Default: considera 100% do tempo quando sem filtro

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

    // Filtrar apenas tarefas do backlog com tipo_tarefa = "Cliente" e cliente_id preenchido
    const tarefasCliente = backlog.filter(
      b => b.tipo_tarefa === 'Cliente' && b.cliente_id
    );

    // Agrupar por cliente_id
    const clienteIds = new Set(tarefasCliente.map(t => t.cliente_id).filter(Boolean));

    clienteIds.forEach(clienteId => {
      if (!clienteId) return;

      // Buscar todas as tarefas deste cliente com tipo_tarefa = 'Cliente'
      const tarefasDoCliente = tarefasCliente.filter(t => t.cliente_id === clienteId);

      if (tarefasDoCliente.length === 0) {
        // Nenhuma tarefa = cinza
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
        tarefasTotal: tarefasDoCliente.length,
        tarefasConcluidas,
        percentualConcluido,
        percentualTempoTranscorrido,
        desvio,
      };
    });

    return statusMap;
  }, [backlog, filterDataInicio, filterDataFim]);

  return { data };
}
