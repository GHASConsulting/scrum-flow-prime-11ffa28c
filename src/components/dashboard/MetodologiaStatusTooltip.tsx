import { Circle } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

type StatusColor = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

interface MetodologiaStatusData {
  status: StatusColor;
  tarefasTotal: number;
  tarefasConcluidas: number;
  percentualConcluido: number;
  percentualTempoTranscorrido: number;
  desvio: number;
}

interface MetodologiaStatusTooltipProps {
  status: StatusColor;
  metodologiaData?: MetodologiaStatusData;
}

const getStatusColor = (status: StatusColor): string => {
  switch (status) {
    case 'verde':
      return 'text-green-500';
    case 'amarelo':
      return 'text-yellow-500';
    case 'vermelho':
      return 'text-red-500';
    case 'cinza':
      return 'text-gray-400';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: StatusColor): string => {
  switch (status) {
    case 'verde':
      return 'Em Dia';
    case 'amarelo':
      return 'Atenção';
    case 'vermelho':
      return 'Crítico';
    case 'cinza':
      return 'Sem Dados';
    default:
      return '';
  }
};

export const MetodologiaStatusTooltip = ({ status, metodologiaData }: MetodologiaStatusTooltipProps) => {
  if (status === 'cinza') {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex justify-center cursor-help">
            <Circle className={`h-4 w-4 fill-current ${getStatusColor(status)}`} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Circle className={`h-3 w-3 fill-current ${getStatusColor(status)}`} />
              <span className="font-medium">{getStatusLabel(status)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa do tipo "Cliente" encontrada no período selecionado ou nenhum período selecionado.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  const getReason = (): string => {
    if (!metodologiaData) return '';
    
    if (status === 'vermelho') {
      return `Desvio de ${metodologiaData.desvio.toFixed(1)}% (superior a 10%)`;
    }
    if (status === 'amarelo') {
      return `Desvio de ${metodologiaData.desvio.toFixed(1)}% (% concluído abaixo do % de tempo)`;
    }
    return 'Progresso dentro do esperado';
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex justify-center cursor-help">
          <Circle className={`h-4 w-4 fill-current ${getStatusColor(status)}`} />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Circle className={`h-3 w-3 fill-current ${getStatusColor(status)}`} />
            <span className="font-medium">{getStatusLabel(status)}</span>
          </div>
          
          <p className="text-sm text-muted-foreground">{getReason()}</p>
          
          {metodologiaData && (
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Tarefas:</span>
                </div>
                <div className="text-right font-medium">
                  {metodologiaData.tarefasConcluidas} / {metodologiaData.tarefasTotal}
                </div>
                
                <div>
                  <span className="text-muted-foreground">% Concluído:</span>
                </div>
                <div className="text-right font-medium">
                  {metodologiaData.percentualConcluido.toFixed(1)}%
                </div>
                
                <div>
                  <span className="text-muted-foreground">% Tempo Transcorrido:</span>
                </div>
                <div className="text-right font-medium">
                  {metodologiaData.percentualTempoTranscorrido.toFixed(1)}%
                </div>
                
                <div>
                  <span className="text-muted-foreground">Desvio:</span>
                </div>
                <div className={`text-right font-medium ${metodologiaData.desvio > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {metodologiaData.desvio > 0 ? '+' : ''}{metodologiaData.desvio.toFixed(1)}%
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground pt-1">
                Considerando apenas tarefas do tipo "Cliente"
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
