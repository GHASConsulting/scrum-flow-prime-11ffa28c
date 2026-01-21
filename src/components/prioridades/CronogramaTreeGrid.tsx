import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileDown, ChevronDown, ChevronRight } from 'lucide-react';
import { useScheduleTasks } from '@/hooks/useScheduleTasks';
import type { Tables } from '@/integrations/supabase/types';
import { formatDateTimeForInput, calculateWorkingDays, parseDateTimeFromInput } from '@/lib/workingDays';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DebouncedInput } from './DebouncedInput';

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
  projectId: string;
}

// Helper to create default start/end times
const createDefaultStartTime = (): Date => {
  const now = new Date();
  now.setHours(8, 0, 0, 0);
  return now;
};

const createDefaultEndTime = (): Date => {
  const now = new Date();
  now.setHours(18, 0, 0, 0);
  return now;
};

export function CronogramaTreeGrid({ projectId }: CronogramaTreeGridProps) {
  const { tasks, loading, addTask, updateTask, deleteTask } = useScheduleTasks(projectId);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

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
        project_id: projectId,
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


  const handleUpdateField = async (taskId: string, field: keyof ScheduleTask, value: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updates: Partial<ScheduleTask> = { [field]: value };

    if (field === 'start_at' && task.duration_days && value) {
      const startDate = parseDateTimeFromInput(value);
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
      const endDate = parseDateTimeFromInput(value);
      const duration = calculateWorkingDays(startDate, endDate);
      updates.duration_days = duration;
    }

    await updateTask(taskId, updates);
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
  };

  const getParentIdDisplay = (task: ScheduleTask): string => {
    if (!task.parent_id) return '';
    const parentTask = tasks.find(t => t.id === task.parent_id);
    return parentTask ? (parentTask.order_index + 1).toString() : '';
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

  const renderTaskRow = (task: TaskWithChildren, level: number = 0): React.ReactNode => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = task.children.length > 0;

    return (
      <>
        <TableRow key={task.id}>
          <TableCell className="w-16 text-center font-medium text-muted-foreground">
            {task.order_index + 1}
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
            <Input type="number" value={task.duration_days || ''} onChange={(e) => handleUpdateField(task.id, 'duration_days', e.target.value)} className="h-8 w-24" disabled={task.is_summary} />
          </TableCell>
          <TableCell>
            <Input type="datetime-local" value={task.start_at ? formatDateTimeForInput(new Date(task.start_at)) : ''} onChange={(e) => handleUpdateField(task.id, 'start_at', e.target.value)} className="h-8" disabled={task.is_summary} />
          </TableCell>
          <TableCell>
            <Input type="datetime-local" value={task.end_at ? formatDateTimeForInput(new Date(task.end_at)) : ''} onChange={(e) => handleUpdateField(task.id, 'end_at', e.target.value)} className="h-8" disabled={task.is_summary} />
          </TableCell>
          <TableCell>
            <DebouncedInput 
              value={getParentIdDisplay(task)} 
              onChange={(value) => handleUpdateParentId(task.id, value)} 
              className="h-8 w-20" 
              placeholder="ID pai" 
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
            <Select 
              value={task.status || 'pendente'} 
              onValueChange={(value) => handleUpdateField(task.id, 'status', value)}
            >
              <SelectTrigger className="h-8 w-32">
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
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="h-8 w-8 p-0 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && task.children.map(child => renderTaskRow(child, level + 1))}
      </>
    );
  };

  if (loading) {
    return <Card className="p-8 text-center">Carregando cronograma...</Card>;
  }

  const tree = buildTree();

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cronograma do Projeto</h3>
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
                <TableHead>Nome</TableHead>
                <TableHead>Duração (dias)</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead className="w-24">Tarefa Pai</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
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
    </Card>
  );
}
