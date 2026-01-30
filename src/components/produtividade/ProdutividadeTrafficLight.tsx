import { Circle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

type StatusColor = 'verde' | 'amarelo' | 'vermelho';

interface ProdutividadeTrafficLightProps {
  abertos15Dias: number;
  backlog: number;
}

const getStatusColor = (color: StatusColor): string => {
  switch (color) {
    case 'verde':
      return 'text-green-500';
    case 'amarelo':
      return 'text-yellow-500';
    case 'vermelho':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusFromAbertos15Dias = (value: number): StatusColor => {
  if (value === 0) return 'verde';
  if (value === 1) return 'amarelo';
  return 'vermelho';
};

const getStatusFromBacklog = (value: number): StatusColor => {
  if (value > 18) return 'vermelho';
  if (value >= 12) return 'amarelo';
  return 'verde';
};

const getWorstStatus = (status1: StatusColor, status2: StatusColor): StatusColor => {
  const priority: Record<StatusColor, number> = { verde: 0, amarelo: 1, vermelho: 2 };
  return priority[status1] >= priority[status2] ? status1 : status2;
};

const getStatusMessage = (
  abertos15Dias: number, 
  backlog: number,
  statusAbertos: StatusColor,
  statusBacklog: StatusColor
): string => {
  const messages: string[] = [];
  
  // Mensagem para abertos_15_dias
  if (statusAbertos === 'verde') {
    messages.push(`Chamados 15 dias: Situação excelente (${abertos15Dias}).`);
  } else if (statusAbertos === 'amarelo') {
    messages.push(`Chamados 15 dias: Atenção - ${abertos15Dias} chamado aberto.`);
  } else {
    messages.push(`Chamados 15 dias: Crítico - ${abertos15Dias} chamados abertos.`);
  }
  
  // Mensagem para backlog
  if (statusBacklog === 'verde') {
    messages.push(`Backlog: Situação excelente (${backlog}).`);
  } else if (statusBacklog === 'amarelo') {
    messages.push(`Backlog: Atenção - ${backlog} itens no backlog.`);
  } else {
    messages.push(`Backlog: Crítico - ${backlog} itens no backlog.`);
  }
  
  return messages.join('\n');
};

const getRuleExplanation = (): string => {
  return `Regra do Farol (pior cenário prevalece):

Chamados abertos há 15 dias:
• Verde: 0 chamados
• Amarelo: 1 chamado
• Vermelho: 2 ou mais chamados

Backlog:
• Verde: Menos de 12 itens
• Amarelo: 12 a 18 itens
• Vermelho: Mais de 18 itens`;
};

export function ProdutividadeTrafficLight({ abertos15Dias, backlog }: ProdutividadeTrafficLightProps) {
  const statusAbertos = getStatusFromAbertos15Dias(abertos15Dias);
  const statusBacklog = getStatusFromBacklog(backlog);
  const finalStatus = getWorstStatus(statusAbertos, statusBacklog);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer ml-2">
          <Circle className={`h-4 w-4 fill-current ${getStatusColor(finalStatus)}`} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium whitespace-pre-line">
              {getStatusMessage(abertos15Dias, backlog, statusAbertos, statusBacklog)}
            </p>
          </div>
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {getRuleExplanation()}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
