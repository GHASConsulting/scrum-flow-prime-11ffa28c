import { Circle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

type StatusColor = 'verde' | 'amarelo' | 'vermelho';

interface ProdutividadeTrafficLightProps {
  abertos15Dias: number;
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

const getStatusFromValue = (value: number): StatusColor => {
  if (value === 0) return 'verde';
  if (value === 1) return 'amarelo';
  return 'vermelho';
};

const getStatusMessage = (color: StatusColor, value: number): string => {
  switch (color) {
    case 'verde':
      return `Situação excelente: Nenhum chamado aberto há mais de 15 dias (${value}).`;
    case 'amarelo':
      return `Atenção: Existe ${value} chamado aberto há mais de 15 dias.`;
    case 'vermelho':
      return `Situação crítica: Existem ${value} chamados abertos há mais de 15 dias.`;
    default:
      return '';
  }
};

const getRuleExplanation = (): string => {
  return `Regra do Farol:
• Verde: 0 chamados abertos há 15 dias
• Amarelo: 1 chamado aberto há 15 dias
• Vermelho: 2 ou mais chamados abertos há 15 dias`;
};

export function ProdutividadeTrafficLight({ abertos15Dias }: ProdutividadeTrafficLightProps) {
  const status = getStatusFromValue(abertos15Dias);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer ml-2">
          <Circle className={`h-4 w-4 fill-current ${getStatusColor(status)}`} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{getStatusMessage(status, abertos15Dias)}</p>
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
