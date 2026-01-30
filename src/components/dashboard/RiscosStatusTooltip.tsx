import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getTrafficLightEmoji, TrafficLightColor } from '@/components/ui/traffic-light';
import { RiscosStatusResult } from '@/hooks/useClientRiscosStatus';

interface RiscosStatusTooltipProps {
  status: TrafficLightColor;
  riscosData?: RiscosStatusResult;
}

export const RiscosStatusTooltip = ({ status, riscosData }: RiscosStatusTooltipProps) => {
  if (!riscosData || status === 'cinza') {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="cursor-pointer hover:opacity-80 transition-opacity">
            {getTrafficLightEmoji(status)}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <p className="font-medium">Riscos e BO's</p>
            <p className="text-sm text-muted-foreground">
              Nenhum risco cadastrado para este cliente.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer hover:opacity-80 transition-opacity">
          {getTrafficLightEmoji(status)}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-3">
          <p className="font-medium">Riscos e BO's</p>
          <p className="text-sm text-muted-foreground">{riscosData.message}</p>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de riscos:</span>
              <span className="font-medium">{riscosData.totalCount}</span>
            </div>
            {riscosData.abertosCount > 0 && (
              <div className="flex justify-between">
                <span className="text-red-600">Abertos:</span>
                <span className="font-medium text-red-600">{riscosData.abertosCount}</span>
              </div>
            )}
            {riscosData.emMitigacaoCount > 0 && (
              <div className="flex justify-between">
                <span className="text-yellow-600">Em mitigação:</span>
                <span className="font-medium text-yellow-600">{riscosData.emMitigacaoCount}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
