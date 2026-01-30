import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { TrafficLightColor, getTrafficLightEmoji, getWorstTrafficLightStatus } from '@/components/ui/traffic-light';

interface ProdutividadeTrafficLightProps {
  abertos15Dias: number;
  backlog: number;
  abertos: number;
}

const getStatusFromAbertos15Dias = (value: number): TrafficLightColor => {
  if (value === 0) return 'verde';
  if (value === 1) return 'amarelo';
  return 'vermelho';
};

const getStatusFromBacklog = (backlog: number, abertos: number): TrafficLightColor => {
  // Se não há chamados abertos, não há como calcular percentual - considera verde
  if (abertos === 0) return 'verde';
  
  const percentual = (backlog / abertos) * 100;
  
  if (percentual >= 18) return 'vermelho';
  if (percentual >= 12) return 'amarelo';
  return 'verde';
};

const getStatusMessage = (
  abertos15Dias: number, 
  backlog: number,
  abertos: number,
  statusAbertos: TrafficLightColor,
  statusBacklog: TrafficLightColor
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
  
  // Mensagem para backlog (percentual)
  const percentual = abertos > 0 ? ((backlog / abertos) * 100).toFixed(1) : '0';
  
  if (statusBacklog === 'verde') {
    messages.push(`Backlog: Situação excelente (${backlog} de ${abertos} = ${percentual}%).`);
  } else if (statusBacklog === 'amarelo') {
    messages.push(`Backlog: Atenção - ${backlog} de ${abertos} chamados (${percentual}%).`);
  } else {
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

export function ProdutividadeTrafficLight({ abertos15Dias, backlog, abertos }: ProdutividadeTrafficLightProps) {
  // Se não há dados para calcular, retorna cinza
  const hasNoData = abertos15Dias === 0 && backlog === 0 && abertos === 0;
  
  if (hasNoData) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="cursor-pointer ml-2 text-base hover:opacity-80 transition-opacity">
            {getTrafficLightEmoji('cinza')}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Sem dados disponíveis para análise.</p>
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

  const statusAbertos = getStatusFromAbertos15Dias(abertos15Dias);
  const statusBacklog = getStatusFromBacklog(backlog, abertos);
  const finalStatus = getWorstTrafficLightStatus(statusAbertos, statusBacklog);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer ml-2 text-base hover:opacity-80 transition-opacity">
          {getTrafficLightEmoji(finalStatus)}
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
