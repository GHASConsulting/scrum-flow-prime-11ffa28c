import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BacklogRoadmapItem, RoadmapTaskStatus } from '@/hooks/useBacklogRoadmap';
import { CheckCircle2, Circle, Clock, User, Calendar, FileText, Tag, Layers, Zap } from 'lucide-react';

interface TaskDetailDialogProps {
  item: BacklogRoadmapItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const getStatusBadgeVariant = (status: RoadmapTaskStatus) => {
  switch (status) {
    case 'ENTREGUE':
      return 'bg-[#B5E3B5] text-green-800';
    case 'EM_ATRASO':
      return 'bg-[#F49B9B] text-red-800';
    case 'EM_PLANEJAMENTO':
      return 'bg-[#E5C3A3] text-amber-800';
    case 'NAO_PLANEJADA':
      return 'bg-gray-200 text-gray-800';
    case 'EM_SPRINT':
      return 'bg-[#FFF4A3] text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSubtaskStatusIcon = (status: string | null) => {
  switch (status) {
    case 'done':
    case 'validated':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'doing':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const getSubtaskStatusLabel = (status: string | null) => {
  switch (status) {
    case 'todo':
      return 'Fazer';
    case 'doing':
      return 'Fazendo';
    case 'done':
      return 'Feito';
    case 'validated':
      return 'Validado';
    default:
      return status || 'Fazer';
  }
};

export const TaskDetailDialog = ({ item, open, onOpenChange }: TaskDetailDialogProps) => {
  if (!item) return null;

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getDataInicio = () => {
    if (item.subtarefas.length > 0) {
      const datasInicio = item.subtarefas
        .map(s => new Date(s.inicio).getTime())
        .filter(d => !isNaN(d));
      
      if (datasInicio.length > 0) {
        return formatDate(new Date(Math.min(...datasInicio)).toISOString());
      }
    }
    return formatDate(item.sprint_data_inicio);
  };

  const getDataFim = () => {
    if (item.subtarefas.length > 0) {
      const datasFim = item.subtarefas
        .map(s => new Date(s.fim).getTime())
        .filter(d => !isNaN(d));
      
      if (datasFim.length > 0) {
        return formatDate(new Date(Math.max(...datasFim)).toISOString());
      }
    }
    return formatDate(item.sprint_data_fim);
  };

  const subtarefasConcluidas = item.subtarefas.filter(
    s => s.status === 'done' || s.status === 'validated'
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            {item.titulo}
            <Badge className={getStatusBadgeVariant(item.roadmapStatus)}>
              {getStatusLabel(item.roadmapStatus)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Descrição */}
          {item.descricao && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                Descrição
              </div>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">{item.descricao}</p>
            </div>
          )}

          <Separator />

          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Zap className="h-4 w-4" />
                Sprint
              </div>
              <p className="text-sm font-medium">{item.sprint_nome || 'Não vinculada'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Responsável
              </div>
              <p className="text-sm font-medium">{item.responsavel || '-'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Layers className="h-4 w-4" />
                Story Points
              </div>
              <p className="text-sm font-medium">{item.story_points}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="h-4 w-4" />
                Tipo Produto
              </div>
              <p className="text-sm font-medium">{item.tipo_produto || '-'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="h-4 w-4" />
                Tipo Tarefa
              </div>
              <p className="text-sm font-medium">{item.tipo_tarefa || '-'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data Início
              </div>
              <p className="text-sm font-medium">{getDataInicio()}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data Fim
              </div>
              <p className="text-sm font-medium">{getDataFim()}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Prioridade
              </div>
              <Badge variant="outline" className="capitalize">{item.prioridade}</Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Status Backlog
              </div>
              <Badge variant="outline" className="capitalize">{item.status}</Badge>
            </div>
          </div>

          {/* Subtarefas */}
          {item.subtarefas.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Subtarefas ({subtarefasConcluidas}/{item.subtarefas.length})
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((subtarefasConcluidas / item.subtarefas.length) * 100)}% concluído
                  </span>
                </div>
                
                <div className="space-y-2">
                  {item.subtarefas.map((subtarefa) => (
                    <div 
                      key={subtarefa.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getSubtaskStatusIcon(subtarefa.status)}
                        <div>
                          <p className="text-sm font-medium">{subtarefa.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {subtarefa.responsavel || 'Sem responsável'} • {formatDate(subtarefa.inicio)} - {formatDate(subtarefa.fim)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getSubtaskStatusLabel(subtarefa.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
