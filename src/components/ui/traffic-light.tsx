import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

export type TrafficLightColor = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

export const getTrafficLightEmoji = (color: TrafficLightColor): string => {
  switch (color) {
    case 'verde':
      return '🟢';
    case 'amarelo':
      return '🟡';
    case 'vermelho':
      return '🔴';
    case 'cinza':
      return '⚪';
    default:
      return '⚪';
  }
};

export const getTrafficLightTextColor = (color: TrafficLightColor): string => {
  switch (color) {
    case 'verde':
      return 'text-green-600';
    case 'amarelo':
      return 'text-yellow-600';
    case 'vermelho':
      return 'text-red-600';
    case 'cinza':
      return 'text-gray-400';
    default:
      return 'text-muted-foreground';
  }
};

interface TrafficLightProps {
  color: TrafficLightColor;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TrafficLight({ color, className, size = 'md' }: TrafficLightProps) {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  
  return (
    <span className={cn(sizeClass, className)}>
      {getTrafficLightEmoji(color)}
    </span>
  );
}

interface TrafficLightWithHoverProps {
  color: TrafficLightColor;
  hoverContent: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function TrafficLightWithHover({ 
  color, 
  hoverContent, 
  className, 
  size = 'md',
  onClick 
}: TrafficLightWithHoverProps) {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button 
          className={cn("cursor-pointer hover:opacity-80 transition-opacity", sizeClass, className)}
          onClick={onClick}
        >
          {getTrafficLightEmoji(color)}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        {hoverContent}
      </HoverCardContent>
    </HoverCard>
  );
}

// Status priority for sorting (cinza=0, verde=1, amarelo=2, vermelho=3)
export const getTrafficLightPriority = (status: TrafficLightColor): number => {
  switch (status) {
    case 'cinza': return 0;
    case 'verde': return 1;
    case 'amarelo': return 2;
    case 'vermelho': return 3;
    default: return 0;
  }
};

// Get worst status between two
export const getWorstTrafficLightStatus = (status1: TrafficLightColor, status2: TrafficLightColor): TrafficLightColor => {
  const priority1 = getTrafficLightPriority(status1);
  const priority2 = getTrafficLightPriority(status2);
  return priority1 >= priority2 ? status1 : status2;
};
