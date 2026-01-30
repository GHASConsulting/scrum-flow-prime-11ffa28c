import { useMemo } from 'react';
import { useRiscos } from './useRiscos';
import { TrafficLightColor } from '@/components/ui/traffic-light';

export interface RiscosStatusResult {
  status: TrafficLightColor;
  abertosCount: number;
  emMitigacaoCount: number;
  totalCount: number;
  message: string;
}

export const useClientRiscosStatus = (
  filterDataInicio?: string,
  filterDataFim?: string
) => {
  const { riscos, loading } = useRiscos();

  const data = useMemo(() => {
    const statusMap: Record<string, RiscosStatusResult> = {};

    // Group riscos by cliente_id
    const riscosByCliente: Record<string, typeof riscos> = {};
    
    riscos.forEach(risco => {
      // Filter by date range if specified
      if (filterDataInicio && risco.data_identificacao < filterDataInicio) return;
      if (filterDataFim && risco.data_identificacao > filterDataFim) return;
      
      const clienteId = risco.cliente_id;
      if (!clienteId) return;
      
      if (!riscosByCliente[clienteId]) {
        riscosByCliente[clienteId] = [];
      }
      riscosByCliente[clienteId].push(risco);
    });

    // Calculate status for each cliente
    Object.entries(riscosByCliente).forEach(([clienteId, clienteRiscos]) => {
      const abertosCount = clienteRiscos.filter(r => r.status_risco === 'Aberto').length;
      const emMitigacaoCount = clienteRiscos.filter(r => r.status_risco === 'Em mitigação').length;
      const totalCount = clienteRiscos.length;

      let status: TrafficLightColor;
      let message: string;

      if (totalCount === 0) {
        status = 'cinza';
        message = 'Nenhum risco cadastrado para este cliente.';
      } else if (abertosCount > 0) {
        status = 'vermelho';
        message = `${abertosCount} risco(s) em aberto requer(em) atenção imediata.`;
      } else if (emMitigacaoCount > 0) {
        status = 'amarelo';
        message = `${emMitigacaoCount} risco(s) em mitigação - acompanhamento em andamento.`;
      } else {
        status = 'verde';
        message = 'Todos os riscos estão mitigados ou materializados.';
      }

      statusMap[clienteId] = {
        status,
        abertosCount,
        emMitigacaoCount,
        totalCount,
        message,
      };
    });

    return statusMap;
  }, [riscos, filterDataInicio, filterDataFim]);

  return { data, isLoading: loading };
};
