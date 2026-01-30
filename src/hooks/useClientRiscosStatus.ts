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
      // Filter by data_limite_acao: include risks where deadline is within or after the filter start date
      // A risk is included if its data_limite_acao >= filterDataInicio (deadline is in filtered period or later)
      if (filterDataInicio && risco.data_limite_acao && risco.data_limite_acao < filterDataInicio) return;
      // If no data_limite_acao is set, we still include the risk in the calculation
      
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

      const riscosAtencaoCount = abertosCount + emMitigacaoCount;

      if (totalCount === 0) {
        status = 'cinza';
        message = 'Nenhum risco cadastrado para este cliente.';
      } else if (abertosCount > 0 || riscosAtencaoCount > 2) {
        // Red if any risk is "Aberto" OR if more than 2 risks are in "Aberto" or "Em mitigação" status
        status = 'vermelho';
        if (abertosCount > 0 && riscosAtencaoCount > 2) {
          message = `${abertosCount} risco(s) em aberto e ${riscosAtencaoCount} riscos requerem atenção imediata.`;
        } else if (riscosAtencaoCount > 2) {
          message = `${riscosAtencaoCount} riscos em aberto ou mitigação requerem atenção imediata.`;
        } else {
          message = `${abertosCount} risco(s) em aberto requer(em) atenção imediata.`;
        }
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
