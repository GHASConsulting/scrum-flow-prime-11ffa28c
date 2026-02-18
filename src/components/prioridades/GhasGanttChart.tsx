import { Card } from '@/components/ui/card';
import { useGhasScheduleTasks } from '@/hooks/useGhasScheduleTasks';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface GhasGanttChartProps {
  priorityListId: string;
}

const TIMEZONE = 'America/Sao_Paulo';

export function GhasGanttChart({ priorityListId }: GhasGanttChartProps) {
  const { tasks, loading } = useGhasScheduleTasks(priorityListId);

  if (loading) return <Card className="p-8 text-center">Carregando gráfico de Gantt...</Card>;

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma tarefa encontrada para exibir no Gantt.</p>
      </Card>
    );
  }

  const dates = tasks
    .filter(t => t.start_at && t.end_at)
    .flatMap(t => [new Date(t.start_at!), new Date(t.end_at!)]);

  if (dates.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Adicione datas às tarefas para visualizar o Gantt.</p>
      </Card>
    );
  }

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const startDate = startOfMonth(minDate);
  const endDate = endOfMonth(maxDate);
  const dayRange = eachDayOfInterval({ start: startDate, end: endDate });
  const totalDays = dayRange.length;
  const today = new Date();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gráfico de Gantt</h3>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex border-b">
              <div className="w-48 min-w-48 p-2 font-medium border-r bg-muted"><p>Tarefa</p></div>
              <div className="flex-1 flex">
                {dayRange.map((day, index) => {
                  const dayDate = toZonedTime(day, TIMEZONE);
                  const isCurrentDay = isToday(dayDate);
                  return (
                    <div key={index} className={`flex-1 min-w-[30px] text-center text-xs p-1 border-r ${isCurrentDay ? 'bg-primary/20 font-bold' : ''}`}>
                      {format(dayDate, 'dd/MM')}
                    </div>
                  );
                })}
              </div>
            </div>

            {tasks.map((task) => {
              if (!task.start_at || !task.end_at) return null;
              const taskStart = new Date(task.start_at);
              const taskEnd = new Date(task.end_at);
              const startOffset = differenceInDays(taskStart, startDate);
              const duration = differenceInDays(taskEnd, taskStart) + 1;
              const isOverdue = taskEnd < today && task.is_summary === false;

              return (
                <div key={task.id} className="flex border-b hover:bg-muted/50">
                  <div className="w-48 min-w-48 p-2 border-r truncate" title={task.name}>{task.name}</div>
                  <div className="flex-1 relative h-8 flex items-center">
                    <div
                      className={`absolute h-4 rounded ${task.is_summary ? 'bg-primary/70' : isOverdue ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ left: `${(startOffset / totalDays) * 100}%`, width: `${(duration / totalDays) * 100}%` }}
                    />
                    {dayRange.some(d => isToday(toZonedTime(d, TIMEZONE))) && (
                      <div className="absolute w-0.5 h-full bg-destructive" style={{ left: `${(differenceInDays(today, startDate) / totalDays) * 100}%` }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary" /><span>Tarefa</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary/70" /><span>Resumo/Fase</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-destructive" /><span>Atrasada</span></div>
          <div className="flex items-center gap-2"><div className="w-0.5 h-4 bg-destructive" /><span>Hoje</span></div>
        </div>
      </div>
    </Card>
  );
}
