import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { getTrafficLightEmoji, TrafficLightColor } from '@/components/ui/traffic-light';

interface PriorityListStatus {
  listId: string;
  listName: string;
  status: TrafficLightColor;
}

interface ClientPrioridadesStatus {
  clientId: string;
  status: TrafficLightColor;
  listsStatuses: PriorityListStatus[];
}

interface PrioridadesStatusTooltipProps {
  status: TrafficLightColor;
  prioridadesData?: ClientPrioridadesStatus;
}

const getStatusMessage = (status: TrafficLightColor, listsStatuses?: PriorityListStatus[]): string => {
  if (status === 'cinza' || !listsStatuses || listsStatuses.length === 0) {
    return 'Nenhuma lista de prioridades cadastrada.';
  }

  switch (status) {
    case 'verde':
      return 'Todas as listas de prioridades estão em dia.';
    case 'amarelo':
      return 'Uma ou mais listas de prioridades possuem tarefas atrasadas.';
    case 'vermelho':
      return 'Atenção crítica necessária: listas com alto índice de atraso.';
    default:
      return '';
  }
};

export function PrioridadesStatusTooltip({ status, prioridadesData }: PrioridadesStatusTooltipProps) {
  const listsStatuses = prioridadesData?.listsStatuses || [];
  const listsNeedingAttention = listsStatuses.filter(
    (l) => l.status === 'amarelo' || l.status === 'vermelho'
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer flex justify-center w-full hover:opacity-80 transition-opacity">
          {getTrafficLightEmoji(status)}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {getStatusMessage(status, listsStatuses)}
          </p>
          
          {listsNeedingAttention.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Listas que necessitam de atenção:
              </p>
              <ul className="text-xs space-y-1">
                {listsNeedingAttention.map((list) => (
                  <li key={list.listId} className="flex items-center gap-2">
                    <span>{getTrafficLightEmoji(list.status)}</span>
                    <span className={list.status === 'vermelho' ? 'text-destructive' : 'text-yellow-600'}>
                      {list.listName}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
