import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BacklogRoadmapItem, RoadmapTaskStatus } from '@/hooks/useBacklogRoadmap';
import { Badge } from '@/components/ui/badge';

interface RoadmapTableProps {
  items: BacklogRoadmapItem[];
  onRowClick?: (item: BacklogRoadmapItem) => void;
}

const getStatusColor = (status: RoadmapTaskStatus): string => {
  switch (status) {
    case 'ENTREGUE':
      return 'bg-[#B5E3B5]'; // verde claro
    case 'EM_ATRASO':
      return 'bg-[#F49B9B]'; // vermelho claro
    case 'EM_PLANEJAMENTO':
      return 'bg-[#E5C3A3]'; // marrom claro
    case 'NAO_PLANEJADA':
      return 'bg-gray-200'; // cinza claro
    case 'EM_SPRINT':
      return 'bg-[#FFF4A3]'; // amarelo claro
    default:
      return 'bg-gray-100';
  }
};

const getStatusLabel = (status: RoadmapTaskStatus): string => {
  switch (status) {
    case 'EM_SPRINT':
      return 'EM SPRINT';
    case 'NAO_PLANEJADA':
      return 'NÃO PLANEJADA';
    case 'EM_PLANEJAMENTO':
      return 'EM PLANEJAMENTO';
    case 'ENTREGUE':
      return 'ENTREGUE';
    case 'EM_ATRASO':
      return 'EM ATRASO';
    default:
      return status;
  }
};

export const RoadmapTable = ({ items, onRowClick }: RoadmapTableProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getDataInicio = (item: BacklogRoadmapItem) => {
    // Se tem subtarefas, pegar a primeira data de subtarefa
    if (item.subtarefas.length > 0) {
      const datasInicio = item.subtarefas
        .map(s => new Date(s.inicio).getTime())
        .filter(d => !isNaN(d));
      
      if (datasInicio.length > 0) {
        return formatDate(new Date(Math.min(...datasInicio)).toISOString());
      }
    }
    // Senão, pegar a data de início da sprint
    return formatDate(item.sprint_data_inicio);
  };

  const getDataFim = (item: BacklogRoadmapItem) => {
    // Se tem subtarefas, pegar a última data de subtarefa
    if (item.subtarefas.length > 0) {
      const datasFim = item.subtarefas
        .map(s => new Date(s.fim).getTime())
        .filter(d => !isNaN(d));
      
      if (datasFim.length > 0) {
        return formatDate(new Date(Math.max(...datasFim)).toISOString());
      }
    }
    // Senão, pegar a data de fim da sprint
    return formatDate(item.sprint_data_fim);
  };

  const getSubtarefasCount = (item: BacklogRoadmapItem) => {
    const total = item.subtarefas.length;
    if (total === 0) return { concluidas: 0, total: 0 };
    
    const concluidas = item.subtarefas.filter(s => s.status === 'done' || s.status === 'validated').length;
    
    return { concluidas, total };
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Tarefa</TableHead>
            <TableHead className="font-bold">Responsável</TableHead>
            <TableHead className="font-bold">Story Points</TableHead>
            <TableHead className="font-bold">Data Início</TableHead>
            <TableHead className="font-bold">Data Fim</TableHead>
            <TableHead className="font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const subtarefasInfo = getSubtarefasCount(item);
            return (
              <TableRow
                key={item.id}
                className={`${getStatusColor(item.roadmapStatus)} cursor-pointer hover:opacity-80`}
                onClick={() => onRowClick?.(item)}
              >
                <TableCell>
                  <div className="font-medium">{item.titulo}</div>
                  {item.descricao && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.descricao}
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.responsavel || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.story_points}</Badge>
                    {subtarefasInfo.total > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({subtarefasInfo.concluidas}/{subtarefasInfo.total})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getDataInicio(item)}</TableCell>
                <TableCell>{getDataFim(item)}</TableCell>
                <TableCell className="font-semibold">
                  {getStatusLabel(item.roadmapStatus)}
                </TableCell>
              </TableRow>
            );
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhuma tarefa encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
