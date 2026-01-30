import { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileDown, ChevronDown, ChevronRight, Circle, Eye, Upload, Download, History } from 'lucide-react';
import { useScheduleTasks } from '@/hooks/useScheduleTasks';
import { useScheduleTaskHistory } from '@/hooks/useScheduleTaskHistory';
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
import { TaskChangeHistoryPanel } from './TaskChangeHistoryPanel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Fazendo' },
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
  const { tasks, loading, addTask, updateTask, deleteTask, loadTasks } = useScheduleTasks(priorityListId);
  const { history: changeHistory, loading: historyLoading, loadHistory } = useScheduleTaskHistory(priorityListId);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<Tables<'schedule_task'> | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadTemplate = () => {
    try {
      // Download the template file from public folder
      const link = document.createElement('a');
      link.href = '/templates/GHAS_-_Arquivo_Modelo_de_Importacao_Prioridades.xlsx';
      link.download = 'GHAS_-_Arquivo_Modelo_de_Importacao_Prioridades.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download do modelo iniciado!');
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      toast.error('Erro ao baixar modelo');
    }
  };

  const parseExcelDate = (value: any): Date | null => {
    if (!value) return null;
    
    if (typeof value === 'number') {
      // Excel serial date
      const excelEpoch = new Date(1899, 11, 30);
      const days = Math.floor(value);
      const fractionalDay = value - days;
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      
      // Add time from fractional part
      const totalSeconds = Math.round(fractionalDay * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      date.setHours(hours, minutes, 0, 0);
      
      return fromZonedTime(date, BRAZIL_TIMEZONE);
    }
    
    if (typeof value === 'string') {
      // Try to parse date string
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return fromZonedTime(parsed, BRAZIL_TIMEZONE);
      }
    }
    
    return null;
  };

  const mapStatusFromExcel = (status: string): string => {
    if (!status) return 'pendente';
    const normalized = status.toLowerCase().trim();
    if (normalized.includes('andamento') || normalized.includes('fazendo')) return 'em_andamento';
    if (normalized.includes('conclu')) return 'concluida';
    if (normalized.includes('cancel')) return 'cancelada';
    return 'pendente';
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Skip header row
          const rows = jsonData.slice(1).filter(row => row.length > 0 && row[0]);
          
          if (rows.length === 0) {
            toast.error('Nenhum registro encontrado no arquivo');
            setIsImporting(false);
            return;
          }

          let importedCount = 0;
          const existingOrderIndices = tasks.map(t => t.order_index);
          let nextOrderIndex = existingOrderIndices.length > 0 ? Math.max(...existingOrderIndices) + 1 : 0;
          
          // Map to track imported tasks by their Excel ID for parent linking
          const importedTasksMap = new Map<number, string>();
          
          // First pass: create tasks without parent links
          for (const row of rows) {
            // Columns: Código Cliente, Código Lista, ID, Nome, Pai, Status, Dias Duração, Data Início, Data Fim, Responsável
            // const codigoCliente = Number(row[0]) || 0; // For future use
            // const codigoLista = Number(row[1]) || 0;   // For future use
            const excelId = Number(row[2]) || 0;
            const nome = String(row[3] || '').trim();
            const paiId = row[4] ? Number(row[4]) : null;
            const status = mapStatusFromExcel(String(row[5] || ''));
            const diasDuracao = row[6] ? Number(row[6]) : 1;
            const dataInicio = parseExcelDate(row[7]);
            const dataFim = parseExcelDate(row[8]);
            const responsavel = String(row[9] || '').trim() || null;

            if (!nome) continue;

            const startTime = dataInicio || createDefaultStartTime();
            const endTime = dataFim || createDefaultEndTime();

            const newTask = await addTask({
              priority_list_id: priorityListId,
              name: nome,
              order_index: nextOrderIndex,
              is_summary: false,
              duration_days: diasDuracao,
              duration_is_estimate: false,
              start_at: startTime.toISOString(),
              end_at: endTime.toISOString(),
              predecessors: null,
              parent_id: null,
              notes: null,
              responsavel: responsavel,
              tipo_produto: null,
              status: status,
            });

            if (newTask && excelId > 0) {
              importedTasksMap.set(excelId, newTask.id);
            }

            nextOrderIndex++;
            importedCount++;
          }

          // Second pass: update parent links
          for (const row of rows) {
            const excelId = Number(row[2]) || 0;
            const paiId = row[4] ? Number(row[4]) : null;
            
            if (paiId && excelId > 0) {
              const taskId = importedTasksMap.get(excelId);
              const parentTaskId = importedTasksMap.get(paiId);
              
              if (taskId && parentTaskId) {
                await updateTask(taskId, { parent_id: parentTaskId });
              }
            }
          }

          await loadTasks();
          toast.success(`${importedCount} tarefa(s) importada(s) com sucesso!`);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          toast.error('Erro ao processar arquivo. Verifique se o formato está correto.');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      toast.error('Erro ao importar arquivo');
      setIsImporting(false);
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

  // Count end_at changes per task from history
  const endAtChangesCount = useMemo(() => {
    const counts = new Map<string, number>();
    changeHistory.forEach(entry => {
      if (entry.campo_alterado === 'end_at') {
        counts.set(entry.task_id, (counts.get(entry.task_id) || 0) + 1);
      }
    });
    return counts;
  }, [changeHistory]);

  // Check if task has 2+ end_at changes (considered as overdue even if on time)
  const hasMultipleEndAtChanges = (taskId: string): boolean => {
    return (endAtChangesCount.get(taskId) || 0) >= 2;
  };

  // Check if a task is overdue (for status styling)
  const isTaskOverdue = (task: ScheduleTask): boolean => {
    if (task.status === 'concluida' || task.status === 'cancelada') return false;
    
    // Check if task has 2+ end_at changes - considered overdue regardless of date
    if (hasMultipleEndAtChanges(task.id)) return true;
    
    if (!task.end_at) return false;
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
          <TableCell className="w-10 text-center font-medium text-muted-foreground">
            {task.order_index + 1}
          </TableCell>
          <TableCell className="w-16">
            <div className="flex items-center justify-center gap-0.5">
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
          <TableCell className="min-w-[180px]">
            <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 16}px` }}>
              {hasChildren && (
                <Button variant="ghost" size="icon" onClick={() => toggleExpand(task.id)} className="h-5 w-5 p-0 flex-shrink-0">
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </Button>
              )}
              <DebouncedInput 
                value={task.name} 
                onChange={(value) => handleUpdateField(task.id, 'name', value)} 
                className="h-7 w-full text-sm" 
              />
            </div>
          </TableCell>
          <TableCell className="w-14">
            <DebouncedInput 
              value={getParentIdDisplay(task)} 
              onChange={(value) => handleUpdateParentId(task.id, value)} 
              className="h-7 w-12 text-sm text-center" 
              placeholder="" 
            />
          </TableCell>
          <TableCell className="w-32">
            <Select 
              value={task.status || 'pendente'} 
              onValueChange={(value) => handleUpdateField(task.id, 'status', value)}
            >
              <SelectTrigger className={`h-7 w-[120px] text-left text-sm ${statusStyle}`}>
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
          <TableCell className="w-14">
            <Input type="number" value={task.duration_days || ''} onChange={(e) => handleUpdateField(task.id, 'duration_days', e.target.value)} className="h-7 w-12 text-sm text-center" disabled={task.is_summary || isParentTask} />
          </TableCell>
          <TableCell className="w-40">
            <Input type="datetime-local" step="1800" value={task.start_at ? formatToBrazil(new Date(task.start_at)) : ''} onChange={(e) => handleUpdateField(task.id, 'start_at', e.target.value)} className="h-7 text-sm" disabled={task.is_summary || isParentTask} />
          </TableCell>
          <TableCell className="w-40">
            <Input 
              type="datetime-local" 
              step="1800"
              value={task.end_at ? formatToBrazil(new Date(task.end_at)) : ''} 
              onChange={(e) => handleUpdateField(task.id, 'end_at', e.target.value)} 
              className="h-7 text-sm" 
              disabled={task.is_summary || isParentTask}
              title={isParentTask ? 'Data fim calculada automaticamente com base nas tarefas filhas' : ''}
            />
          </TableCell>
          <TableCell>
            <DebouncedInput 
              value={task.responsavel || ''} 
              onChange={(value) => handleUpdateField(task.id, 'responsavel', value)} 
              className="h-7 text-sm"
              placeholder="Responsável" 
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
      return { color: 'cinza' as const, reason: 'Nenhuma tarefa cadastrada.', overdueTasks: [] as ScheduleTask[] };
    }

    // Get current date in Brazil timezone at 23:59
    const now = new Date();
    const brazilNow = toZonedTime(now, BRAZIL_TIMEZONE);
    brazilNow.setHours(23, 59, 59, 999);

    // Filter tasks that are not completed and not cancelled
    const nonCompletedTasks = tasks.filter(t => 
      t.status !== 'concluida' && 
      t.status !== 'cancelada'
    );

    // Find overdue tasks (including those with 2+ end_at changes)
    const overdueTasks = nonCompletedTasks.filter(task => {
      // Check if task has 2+ end_at changes - considered overdue
      if (hasMultipleEndAtChanges(task.id)) return true;
      
      if (!task.end_at) return false;
      const taskEndDate = toZonedTime(new Date(task.end_at), BRAZIL_TIMEZONE);
      return taskEndDate < brazilNow;
    });

    // Find tasks with more than 7 days overdue (only date-based, not change-based)
    const tasksOver7Days = overdueTasks.filter(task => {
      if (!task.end_at) return false;
      const taskEndDate = toZonedTime(new Date(task.end_at), BRAZIL_TIMEZONE);
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
  }, [tasks, totalTasks, endAtChangesCount]);

  const getTrafficLightColor = (color: 'verde' | 'amarelo' | 'vermelho' | 'cinza'): string => {
    switch (color) {
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
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <Button variant="outline" onMouseEnter={() => loadHistory()}>
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="bottom" align="start" className="w-auto p-0">
                <TaskChangeHistoryPanel history={changeHistory} loading={historyLoading} />
              </HoverCardContent>
            </HoverCard>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isImporting}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importando...' : 'Importar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Modelo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Registros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleImportFile}
              className="hidden"
            />
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
                <TableHead className="w-10 text-xs">ID</TableHead>
                <TableHead className="w-16 text-xs">Ações</TableHead>
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="w-14 text-xs">Pai</TableHead>
                <TableHead className="w-32 text-xs">Status</TableHead>
                <TableHead className="w-14 text-xs">Dias</TableHead>
                <TableHead className="w-40 text-xs">Início</TableHead>
                <TableHead className="w-40 text-xs">Fim</TableHead>
                <TableHead className="text-xs">Responsável</TableHead>
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
