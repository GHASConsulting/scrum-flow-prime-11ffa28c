import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getTrafficLightEmoji, TrafficLightColor } from '@/components/ui/traffic-light';

interface MetodologiaStatusData {
  status: TrafficLightColor;
  tarefasTotal: number;
  tarefasConcluidas: number;
  percentualConcluido: number;
  percentualTempoTranscorrido: number;
  desvio: number;
}

interface MetodologiaStatusTooltipProps {
  status: TrafficLightColor;
  metodologiaData?: MetodologiaStatusData;
}

const getStatusLabel = (status: TrafficLightColor): string => {
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
          <div className="flex justify-center cursor-help hover:opacity-80 transition-opacity">
            {getTrafficLightEmoji(status)}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>{getTrafficLightEmoji(status)}</span>
              <span className="font-medium">{getStatusLabel(status)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa do tipo "Cliente" vinculada a sprints no período selecionado ou nenhum período selecionado.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  const getReason = (): string => {
    if (!metodologiaData) return '';
    
    if (status === 'vermelho') {
      return `Desvio de ${metodologiaData.desvio.toFixed(1)}% (superior a 18%)`;
    }
    if (status === 'amarelo') {
      return `Desvio de ${metodologiaData.desvio.toFixed(1)}% (entre 10% e 18%)`;
    }
    return 'Progresso dentro do esperado (desvio ≤ 10%)';
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex justify-center cursor-help hover:opacity-80 transition-opacity">
          {getTrafficLightEmoji(status)}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span>{getTrafficLightEmoji(status)}</span>
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
                Considerando tarefas do tipo "Cliente" vinculadas a sprints no período
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
