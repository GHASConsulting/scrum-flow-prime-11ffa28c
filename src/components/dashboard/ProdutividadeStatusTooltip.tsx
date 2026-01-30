import { Circle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

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

interface ProdutividadeStatusTooltipProps {
  status: StatusColor;
  produtividadeData?: ProdutividadeStatusData;
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

const getStatusMessage = (
  abertos15Dias: number, 
  backlog: number,
  abertos: number,
  statusAbertos: StatusColor,
  statusBacklog: StatusColor
): string => {
  const messages: string[] = [];
  
  // Mensagem para abertos_15_dias
  if (statusAbertos === 'verde') {
    messages.push(`Chamados 15 dias: Situação excelente (${abertos15Dias}).`);
  } else if (statusAbertos === 'amarelo') {
    messages.push(`Chamados 15 dias: Atenção - ${abertos15Dias} chamado aberto.`);
  } else if (statusAbertos === 'vermelho') {
    messages.push(`Chamados 15 dias: Crítico - ${abertos15Dias} chamados abertos.`);
  }
  
  // Mensagem para backlog (percentual)
  const percentual = abertos > 0 ? ((backlog / abertos) * 100).toFixed(1) : '0';
  
  if (statusBacklog === 'verde') {
    messages.push(`Backlog: Situação excelente (${backlog} de ${abertos} = ${percentual}%).`);
  } else if (statusBacklog === 'amarelo') {
    messages.push(`Backlog: Atenção - ${backlog} de ${abertos} chamados (${percentual}%).`);
  } else if (statusBacklog === 'vermelho') {
    messages.push(`Backlog: Crítico - ${backlog} de ${abertos} chamados (${percentual}%).`);
  }
  
  return messages.join('\n');
};

const getRuleExplanation = (): string => {
  return `Regra do Farol (pior cenário prevalece):

Chamados abertos há 15 dias:
• Verde: 0 chamados
• Amarelo: 1 chamado
• Vermelho: 2 ou mais chamados

Backlog (% sobre total de abertos):
• Verde: Menos de 12%
• Amarelo: 12% a 17,99%
• Vermelho: 18% ou mais

Cinza: Sem dados para análise`;
};

export function ProdutividadeStatusTooltip({ status, produtividadeData }: ProdutividadeStatusTooltipProps) {
  // Se não há dados, mostra estado cinza
  if (!produtividadeData || status === 'cinza') {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="cursor-pointer flex justify-center w-full">
            <Circle className={`h-4 w-4 fill-current ${getStatusColor('cinza')}`} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Sem dados de produtividade disponíveis.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Nenhum registro encontrado para o período selecionado.
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

  const { abertos15Dias, backlog, abertos, statusAbertos, statusBacklog } = produtividadeData;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer flex justify-center w-full">
          <Circle className={`h-4 w-4 fill-current ${getStatusColor(status)}`} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium whitespace-pre-line">
              {getStatusMessage(abertos15Dias, backlog, abertos, statusAbertos, statusBacklog)}
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
