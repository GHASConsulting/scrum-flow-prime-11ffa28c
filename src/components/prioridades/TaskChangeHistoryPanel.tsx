import { useMemo } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  TaskHistoryEntry, 
  formatFieldName, 
  formatStatusValue,
  formatDateValue 
} from '@/hooks/useScheduleTaskHistory';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

interface TaskChangeHistoryPanelProps {
  history: TaskHistoryEntry[];
  loading: boolean;
}

export function TaskChangeHistoryPanel({ history, loading }: TaskChangeHistoryPanelProps) {
  // Group history by task
  const groupedHistory = useMemo(() => {
    const grouped = new Map<string, TaskHistoryEntry[]>();
    
    history.forEach(entry => {
      const key = entry.task_id;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(entry);
    });
    
    return grouped;
  }, [history]);

  const formatHistoryDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const zonedDate = toZonedTime(date, BRAZIL_TIMEZONE);
      return format(zonedDate, 'dd/MM/yyyy HH:mm');
    } catch {
      return dateStr;
    }
  };

  const formatValue = (entry: TaskHistoryEntry, value: string | null): string => {
    if (!value) return '-';
    
    if (entry.campo_alterado === 'status') {
      return formatStatusValue(value);
    }
    
    if (entry.campo_alterado === 'start_at' || entry.campo_alterado === 'end_at') {
      return formatDateValue(value);
    }
    
    return value;
  };

  const getFieldBadgeColor = (field: string): string => {
    switch (field) {
      case 'status':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'start_at':
      case 'end_at':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'responsavel':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Carregando histórico...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Nenhuma alteração registrada.
        <p className="text-xs mt-1">
          Alterações são registradas após 24h da criação da tarefa.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-[450px]">
      <div className="p-4 space-y-4">
        <div className="text-xs text-muted-foreground mb-2">
          Histórico de alterações (após 24h de criação)
        </div>
        
        {Array.from(groupedHistory.entries()).map(([taskId, entries]) => {
          const firstEntry = entries[0];
          return (
            <div key={taskId} className="border rounded-lg p-3 space-y-2">
              <div className="font-medium text-sm flex items-center gap-2">
                <span className="text-muted-foreground">ID {(firstEntry.task_order_index ?? 0) + 1}:</span>
                <span className="truncate max-w-[250px]">{firstEntry.task_name}</span>
              </div>
              
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="text-xs border-l-2 border-muted pl-3 py-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getFieldBadgeColor(entry.campo_alterado)}`}>
                        {formatFieldName(entry.campo_alterado)}
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatHistoryDate(entry.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="line-through">{formatValue(entry, entry.valor_anterior)}</span>
                      <span>→</span>
                      <span className="text-foreground font-medium">{formatValue(entry, entry.valor_novo)}</span>
                    </div>
                    {entry.alterado_por && (
                      <div className="text-[10px] text-muted-foreground">
                        Por: {entry.alterado_por}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
