import { useMemo } from 'react';
import { useProdutividadeGlobal } from './useProdutividadeGlobal';

type StatusColor = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

interface ProdutividadeStatusData {
  status: StatusColor;
  abertos15Dias: number;
  backlog: number;
  abertos: number;
  percentualBacklog: number;
  statusAbertos: StatusColor;
  statusBacklog: StatusColor;
}

const getStatusFromAbertos15Dias = (value: number): StatusColor => {
  if (value === 0) return 'verde';
  if (value === 1) return 'amarelo';
  return 'vermelho';
};

const getStatusFromBacklog = (backlog: number, abertos: number): StatusColor => {
  if (abertos === 0) return 'verde';
  
  const percentual = (backlog / abertos) * 100;
  
  if (percentual >= 18) return 'vermelho';
  if (percentual >= 12) return 'amarelo';
  return 'verde';
};

const getWorstStatus = (status1: StatusColor, status2: StatusColor): StatusColor => {
  const priority: Record<StatusColor, number> = { cinza: -1, verde: 0, amarelo: 1, vermelho: 2 };
  return priority[status1] >= priority[status2] ? status1 : status2;
};

export function useClientProdutividadeStatus(
  filterDataInicio?: string,
  filterDataFim?: string
) {
  const { produtividades, isLoading } = useProdutividadeGlobal();

  const data = useMemo(() => {
    const statusMap: Record<string, ProdutividadeStatusData> = {};

    // Filter by date range if provided
    const filteredProdutividades = produtividades.filter((p) => {
      if (filterDataInicio) {
        const prodDataFim = new Date(p.data_fim + 'T23:59:59');
        const filterInicio = new Date(filterDataInicio + 'T00:00:00');
        if (prodDataFim < filterInicio) return false;
      }
      
      if (filterDataFim) {
        const prodDataInicio = new Date(p.data_inicio + 'T00:00:00');
        const filterFim = new Date(filterDataFim + 'T23:59:59');
        if (prodDataInicio > filterFim) return false;
      }
      
      return true;
    });

    // Group by client and get the most recent record for each
    const clientIds = new Set(filteredProdutividades.map(p => p.cliente_id));

    clientIds.forEach(clientId => {
      const clientRecords = filteredProdutividades
        .filter(p => p.cliente_id === clientId)
        .sort((a, b) => new Date(b.data_fim).getTime() - new Date(a.data_fim).getTime());
      
      if (clientRecords.length === 0) {
        // No records for this client in the date range
        statusMap[clientId] = {
          status: 'cinza',
          abertos15Dias: 0,
          backlog: 0,
          abertos: 0,
          percentualBacklog: 0,
          statusAbertos: 'cinza',
          statusBacklog: 'cinza',
        };
        return;
      }

      // Get values from the most recent record
      const mostRecent = clientRecords[0];
      const abertos15Dias = Number(mostRecent.abertos_15_dias) || 0;
      const backlog = Number(mostRecent.backlog) || 0;
      const abertos = Number(mostRecent.abertos) || 0;

      // Calculate status
      const statusAbertos = getStatusFromAbertos15Dias(abertos15Dias);
      const statusBacklog = getStatusFromBacklog(backlog, abertos);
      const finalStatus = getWorstStatus(statusAbertos, statusBacklog);
      const percentualBacklog = abertos > 0 ? (backlog / abertos) * 100 : 0;

      statusMap[clientId] = {
        status: finalStatus,
        abertos15Dias,
        backlog,
        abertos,
        percentualBacklog,
        statusAbertos,
        statusBacklog,
      };
    });

    return statusMap;
  }, [produtividades, filterDataInicio, filterDataFim]);

  return { data, isLoading };
}
