import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileDown, ChevronDown, ChevronRight, Circle, Eye } from 'lucide-react';
import { useScheduleTasks } from '@/hooks/useScheduleTasks';
import type { Tables } from '@/integrations/supabase/types';
import { calculateWorkingDays } from '@/lib/workingDays';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DebouncedInput } from './DebouncedInput';
import { format, differenceInDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TaskHistoryDialog } from './TaskHistoryDialog';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
];

type ScheduleTask = Tables<'schedule_task'>;

interface TaskWithChildren extends ScheduleTask {
  children: TaskWithChildren[];
}

interface CronogramaTreeGridProps {
  priorityListId: string;
}

// Convert UTC date to Brazil timezone and format for datetime-local input
const formatToBrazil = (date: Date): string => {
  const zonedDate = toZonedTime(date, BRAZIL_TIMEZONE);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
};

// Parse datetime-local input (interpreted as Brazil time) and convert to UTC
const parseFromBrazil = (dateString: string): Date => {
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Create a date object representing the Brazil time, then convert to UTC
  const brazilDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return fromZonedTime(brazilDate, BRAZIL_TIMEZONE);
};

// Helper to create default start/end times in Brazil timezone
const createDefaultStartTime = (): Date => {
  const now = new Date();
  const zonedNow = toZonedTime(now, BRAZIL_TIMEZONE);
  zonedNow.setHours(8, 0, 0, 0);
  return fromZonedTime(zonedNow, BRAZIL_TIMEZONE);
};

const createDefaultEndTime = (): Date => {
  const now = new Date();
  const zonedNow = toZonedTime(now, BRAZIL_TIMEZONE);
  zonedNow.setHours(18, 0, 0, 0);
  return fromZonedTime(zonedNow, BRAZIL_TIMEZONE);
};

export function CronogramaTreeGrid({ priorityListId }: CronogramaTreeGridProps) {
  const { tasks, loading, addTask, updateTask, deleteTask } = useScheduleTasks(priorityListId);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<Tables<'schedule_task'> | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const handleOpenHistoryDialog = (task: Tables<'schedule_task'>) => {
    setSelectedTaskForHistory(task);
    setIsHistoryDialogOpen(true);
  };

  const handleSaveTaskNotes = async (taskId: string, notes: string) => {
    await updateTask(taskId, { notes });
    toast.success('Histórico salvo com sucesso!');
  };

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAddTask = async () => {
    try {
      const startTime = createDefaultStartTime();
      const endTime = createDefaultEndTime();
      
      await addTask({
        priority_list_id: priorityListId,
        name: 'Nova Tarefa',
        order_index: tasks.length,
        is_summary: false,
        duration_days: 1,
        duration_is_estimate: false,
        start_at: startTime.toISOString(),
        end_at: endTime.toISOString(),
        predecessors: null,
        parent_id: null,
        notes: null,
        responsavel: null,
        tipo_produto: null,
        status: 'pendente',
      });
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      doc.setFontSize(16);
      doc.text('Cronograma do Projeto', 14, 15);
      
      const tableData = tasks.map(task => {
        const parentTask = task.parent_id ? tasks.find(t => t.id === task.parent_id) : null;
        const parentIdLabel = parentTask ? `Filho de ID ${parentTask.order_index + 1}` : '';
        const statusLabel = STATUS_OPTIONS.find(s => s.value === task.status)?.label || 'Pendente';
        return [
          (task.order_index + 1).toString(),
          task.name,
          task.duration_days ? task.duration_days.toString() : '',
          task.start_at ? new Date(task.start_at).toLocaleString('pt-BR') : '',
          task.end_at ? new Date(task.end_at).toLocaleString('pt-BR') : '',
          parentIdLabel,
          task.responsavel || '',
          statusLabel
        ];
      });

      autoTable(doc, {
        head: [['ID', 'Nome', 'Duração (dias)', 'Início', 'Fim', 'Tarefa Pai', 'Responsável', 'Status']],
        body: tableData,
        startY: 25,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 55 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
          6: { cellWidth: 40 },
          7: { cellWidth: 30 },
        },
        didParseCell: (data) => {
          const task = tasks[data.row.index];
          if (task?.is_summary && data.section === 'body') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
      });

      doc.save(`cronograma-${new Date().toLocaleDateString('pt-BR')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };


  // Get all children (recursively) for a task
  const getAllChildren = (taskId: string): ScheduleTask[] => {
    const children: ScheduleTask[] = [];
    const directChildren = tasks.filter(t => t.parent_id === taskId);
    for (const child of directChildren) {
      children.push(child);
      children.push(...getAllChildren(child.id));
    }
    return children;
  };

  // Get max end date from children
  const getMaxEndDateFromChildren = (taskId: string): Date | null => {
    const children = getAllChildren(taskId);
    if (children.length === 0) return null;
    
    const endDates = children
      .filter(c => c.end_at)
      .map(c => new Date(c.end_at!));
    
    if (endDates.length === 0) return null;
    return new Date(Math.max(...endDates.map(d => d.getTime())));
  };

  // Update parent task's end date based on children
  const updateParentEndDate = async (parentId: string) => {
    const maxEndDate = getMaxEndDateFromChildren(parentId);
    if (maxEndDate) {
      const parent = tasks.find(t => t.id === parentId);
      if (parent) {
        await updateTask(parentId, { end_at: maxEndDate.toISOString() });
      }
    }
  };

  // Effect to update parent end dates when tasks change
  useEffect(() => {
    const parentIds = new Set(tasks.filter(t => t.parent_id).map(t => t.parent_id!));
    parentIds.forEach(parentId => {
      const parent = tasks.find(t => t.id === parentId);
      if (parent) {
        const maxEndDate = getMaxEndDateFromChildren(parentId);
        if (maxEndDate && parent.end_at) {
          const currentEndDate = new Date(parent.end_at);
          if (maxEndDate > currentEndDate) {
            updateTask(parentId, { end_at: maxEndDate.toISOString() });
          }
        }
      }
    });
  }, [tasks.map(t => `${t.id}-${t.end_at}-${t.parent_id}`).join(',')]);

  const handleUpdateField = async (taskId: string, field: keyof ScheduleTask, value: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updates: Partial<ScheduleTask> = { [field]: value };

    if (field === 'start_at' && task.duration_days && value) {
      const startDate = parseFromBrazil(value);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + (Number(task.duration_days) * 9)); // 9 hours per day
      updates.start_at = startDate.toISOString();
      updates.end_at = endDate.toISOString();
    } else if (field === 'duration_days' && task.start_at && value) {
      const startDate = new Date(task.start_at);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + (Number(value) * 9));
      updates.end_at = endDate.toISOString();
    } else if (field === 'end_at' && task.start_at && value) {
      const startDate = new Date(task.start_at);
      const endDate = parseFromBrazil(value);
      const duration = calculateWorkingDays(startDate, endDate);
      updates.duration_days = duration;
    }

    await updateTask(taskId, updates);

    // If this task has a parent, update parent's end date
    if (task.parent_id && (field === 'end_at' || field === 'start_at' || field === 'duration_days')) {
      setTimeout(() => updateParentEndDate(task.parent_id!), 100);
    }
  };

  const handleUpdateParentId = async (taskId: string, parentIdInput: string) => {
    if (!parentIdInput.trim()) {
      await updateTask(taskId, { parent_id: null });
      return;
    }

    const parentIndex = parseInt(parentIdInput, 10) - 1;
    if (isNaN(parentIndex) || parentIndex < 0) {
      toast.error('ID inválido');
      return;
    }

    const parentTask = tasks.find(t => t.order_index === parentIndex);
    if (!parentTask) {
      toast.error(`Tarefa com ID ${parentIdInput} não encontrada`);
      return;
    }

    if (parentTask.id === taskId) {
      toast.error('Uma tarefa não pode ser filha de si mesma');
      return;
    }

    await updateTask(taskId, { parent_id: parentTask.id });
    toast.success(`Tarefa definida como filha do ID ${parentIdInput}`);
    
    // Update parent's end date based on this child
    setTimeout(() => updateParentEndDate(parentTask.id), 100);
  };

  const getParentIdDisplay = (task: ScheduleTask): string => {
    if (!task.parent_id) return '';
    const parentTask = tasks.find(t => t.id === task.parent_id);
    return parentTask ? (parentTask.order_index + 1).toString() : '';
  };

  // Check if task has children (for disabling end date edit on parent)
  const hasChildTasks = (taskId: string): boolean => {
    return tasks.some(t => t.parent_id === taskId);
  };

  const buildTree = (): TaskWithChildren[] => {
    const taskMap = new Map<string, TaskWithChildren>();
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });
    const roots: TaskWithChildren[] = [];
    tasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id)!;
      if (task.parent_id) {
        const parent = taskMap.get(task.parent_id);
        if (parent) {
          parent.children.push(taskWithChildren);
        } else {
          roots.push(taskWithChildren);
        }
      } else {
        roots.push(taskWithChildren);
      }
    });
    return roots;
  };

  // Check if a task is overdue (for status styling)
  const isTaskOverdue = (task: ScheduleTask): boolean => {
    if (!task.end_at || task.status === 'concluida' || task.status === 'cancelada') return false;
    const now = new Date();
    const brazilNow = toZonedTime(now, BRAZIL_TIMEZONE);
    brazilNow.setHours(23, 59, 59, 999);
    const taskEndDate = toZonedTime(new Date(task.end_at), BRAZIL_TIMEZONE);
    return taskEndDate < brazilNow;
  };

  // Get status styling based on task state
  const getStatusStyle = (task: ScheduleTask): string => {
    const status = task.status || 'pendente';
    
    if (status === 'concluida') {
      return 'font-bold text-green-700';
    }
    
    if (status === 'em_andamento') {
      if (isTaskOverdue(task)) {
        return 'font-bold text-red-600';
      }
      return 'font-bold text-foreground';
    }
    
    if (status === 'pendente') {
      if (isTaskOverdue(task)) {
        return 'font-bold text-red-600';
      }
    }
    
    return '';
  };

  const renderTaskRow = (task: TaskWithChildren, level: number = 0): React.ReactNode => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = task.children.length > 0;
    const isParentTask = hasChildTasks(task.id);
    const statusStyle = getStatusStyle(task);

    return (
      <>
        <TableRow key={task.id}>
          <TableCell className="w-16 text-center font-medium text-muted-foreground">
            {task.order_index + 1}
          </TableCell>
          <TableCell className="w-20">
            <div className="flex items-center justify-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleOpenHistoryDialog(task)} 
                className="h-6 w-6 p-0"
                title="Ver histórico e andamento"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="h-6 w-6 p-0 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TableCell>
          <TableCell className="min-w-[300px]">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <Button variant="ghost" size="icon" onClick={() => toggleExpand(task.id)} className="h-6 w-6 p-0 flex-shrink-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              <DebouncedInput 
                value={task.name} 
                onChange={(value) => handleUpdateField(task.id, 'name', value)} 
                className="h-8 w-full" 
              />
            </div>
          </TableCell>
          <TableCell>
            <Select 
              value={task.status || 'pendente'} 
              onValueChange={(value) => handleUpdateField(task.id, 'status', value)}
            >
              <SelectTrigger className={`h-8 w-40 text-left ${statusStyle}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <Input type="number" value={task.duration_days || ''} onChange={(e) => handleUpdateField(task.id, 'duration_days', e.target.value)} className="h-8 w-16" disabled={task.is_summary || isParentTask} />
          </TableCell>
          <TableCell>
            <Input type="datetime-local" step="1800" value={task.start_at ? formatToBrazil(new Date(task.start_at)) : ''} onChange={(e) => handleUpdateField(task.id, 'start_at', e.target.value)} className="h-8" disabled={task.is_summary || isParentTask} />
          </TableCell>
          <TableCell>
            <Input 
              type="datetime-local" 
              step="1800"
              value={task.end_at ? formatToBrazil(new Date(task.end_at)) : ''} 
              onChange={(e) => handleUpdateField(task.id, 'end_at', e.target.value)} 
              className="h-8" 
              disabled={task.is_summary || isParentTask}
              title={isParentTask ? 'Data fim calculada automaticamente com base nas tarefas filhas' : ''}
            />
          </TableCell>
          <TableCell>
            <DebouncedInput 
              value={task.responsavel || ''} 
              onChange={(value) => handleUpdateField(task.id, 'responsavel', value)} 
              className="h-8"
              placeholder="Nome do responsável" 
            />
          </TableCell>
          <TableCell>
            <DebouncedInput 
              value={getParentIdDisplay(task)} 
              onChange={(value) => handleUpdateParentId(task.id, value)} 
              className="h-8 w-20" 
              placeholder="ID pai" 
            />
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && task.children.map(child => renderTaskRow(child, level + 1))}
      </>
    );
  };

  // Calculate completion percentage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'concluida').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate traffic light status
  const trafficLightData = useMemo(() => {
    if (tasks.length === 0) {
      return { color: 'verde' as const, reason: 'Nenhuma tarefa cadastrada.', overdueTasks: [] as ScheduleTask[] };
    }

    // Get current date in Brazil timezone at 23:59
    const now = new Date();
    const brazilNow = toZonedTime(now, BRAZIL_TIMEZONE);
    brazilNow.setHours(23, 59, 59, 999);

    // Filter tasks that are not completed and have end_at
    const nonCompletedTasks = tasks.filter(t => 
      t.status !== 'concluida' && 
      t.status !== 'cancelada' && 
      t.end_at
    );

    // Find overdue tasks
    const overdueTasks = nonCompletedTasks.filter(task => {
      if (!task.end_at) return false;
      const taskEndDate = toZonedTime(new Date(task.end_at), BRAZIL_TIMEZONE);
      return taskEndDate < brazilNow;
    });

    // Find tasks with more than 7 days overdue
    const tasksOver7Days = overdueTasks.filter(task => {
      const taskEndDate = toZonedTime(new Date(task.end_at!), BRAZIL_TIMEZONE);
      const daysOverdue = differenceInDays(brazilNow, taskEndDate);
      return daysOverdue > 7;
    });

    const overduePercentage = totalTasks > 0 ? (overdueTasks.length / totalTasks) * 100 : 0;

    // Determine color based on rules
    if (overdueTasks.length === 0) {
      return { 
        color: 'verde' as const, 
        reason: '100% das atividades estão em dia.', 
        overdueTasks: [] as ScheduleTask[] 
      };
    }

    if (overduePercentage > 30 || tasksOver7Days.length > 0) {
      let reason = '';
      if (overduePercentage > 30) {
        reason = `Mais de 30% das atividades estão atrasadas (${Math.round(overduePercentage)}%).`;
      }
      if (tasksOver7Days.length > 0) {
        if (reason) reason += ' ';
        reason += `${tasksOver7Days.length} tarefa(s) com mais de 7 dias de atraso.`;
      }
      return { 
        color: 'vermelho' as const, 
        reason, 
        overdueTasks 
      };
    }

    return { 
      color: 'amarelo' as const, 
      reason: `${overdueTasks.length} atividade(s) atrasada(s).`, 
      overdueTasks 
    };
  }, [tasks, totalTasks]);

  const getTrafficLightColor = (color: 'verde' | 'amarelo' | 'vermelho'): string => {
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

  if (loading) {
    return <Card className="p-8 text-center">Carregando cronograma...</Card>;
  }

  const tree = buildTree();

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Cronograma <span className="font-bold text-primary">{completionPercentage}%</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="cursor-pointer">
                  <Circle className={`h-4 w-4 fill-current ${getTrafficLightColor(trafficLightData.color)}`} />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{trafficLightData.reason}</p>
                  {trafficLightData.overdueTasks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">Tarefas que necessitam atenção:</p>
                      <ul className="text-xs space-y-1">
                        {trafficLightData.overdueTasks.map(task => {
                          const taskEndDate = toZonedTime(new Date(task.end_at!), BRAZIL_TIMEZONE);
                          const brazilNow = toZonedTime(new Date(), BRAZIL_TIMEZONE);
                          const daysOverdue = differenceInDays(brazilNow, taskEndDate);
                          return (
                            <li key={task.id} className="text-destructive">
                              • ID {task.order_index + 1}: {task.name} ({daysOverdue} dias de atraso)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          </h3>
          <div className="flex gap-2">
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-20">Ações</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração (dias)</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-24">Tarefa Pai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tree.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Nenhuma tarefa encontrada. Adicione uma nova tarefa para começar.
                  </TableCell>
                </TableRow>
              ) : (
                tree.map(task => renderTaskRow(task))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TaskHistoryDialog
        task={selectedTaskForHistory}
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        onSave={handleSaveTaskNotes}
      />
    </Card>
  );
}
