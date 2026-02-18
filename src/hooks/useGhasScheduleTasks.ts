import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GhasScheduleTask {
  id: string;
  ghas_priority_list_id: string;
  parent_id: string | null;
  order_index: number;
  name: string;
  is_summary: boolean;
  status: string | null;
  start_at: string | null;
  end_at: string | null;
  duration_days: number | null;
  duration_is_estimate: boolean;
  responsavel: string | null;
  predecessors: string | null;
  notes: string | null;
  percent_complete: number | null;
  created_at: string;
  updated_at: string;
  // Compatibility fields for CronogramaTreeGrid
  project_id: string;
  priority_list_id: string;
  tipo_produto: string | null;
}

const TABLE = 'ghas_schedule_task' as any;
const HISTORY_TABLE = 'ghas_schedule_task_history' as any;

const TRACKED_FIELDS = ['start_at', 'end_at', 'status', 'responsavel'];

function isTaskOlderThan24Hours(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  return (now.getTime() - created.getTime()) > 24 * 60 * 60 * 1000;
}

// Adapts a raw DB row to have the compatibility fields expected by CronogramaTreeGrid
function adaptTask(row: any): GhasScheduleTask {
  return {
    ...row,
    project_id: row.ghas_priority_list_id, // compat
    priority_list_id: row.ghas_priority_list_id, // compat
    tipo_produto: null,
  };
}

export const useGhasScheduleTasks = (priorityListId: string | null) => {
  const [tasks, setTasks] = useState<GhasScheduleTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    if (!priorityListId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('ghas_priority_list_id', priorityListId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      setTasks((data || []).map(adaptTask));
    } catch (error) {
      console.error('Erro ao carregar tarefas GHAS:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const recordHistory = async (taskId: string, field: string, oldValue: string | null, newValue: string | null) => {
    try {
      await supabase.from(HISTORY_TABLE).insert({
        task_id: taskId,
        campo_alterado: field,
        valor_anterior: oldValue,
        valor_novo: newValue,
        alterado_por: null,
      });
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  };

  const addTask = async (task: Partial<GhasScheduleTask> & { priority_list_id: string }) => {
    try {
      const insertData = {
        ghas_priority_list_id: task.priority_list_id,
        name: task.name || 'Nova Tarefa',
        order_index: task.order_index ?? 0,
        is_summary: task.is_summary ?? false,
        duration_days: task.duration_days ?? 1,
        duration_is_estimate: task.duration_is_estimate ?? false,
        start_at: task.start_at ?? null,
        end_at: task.end_at ?? null,
        predecessors: task.predecessors ?? null,
        parent_id: task.parent_id ?? null,
        notes: task.notes ?? null,
        responsavel: task.responsavel ?? null,
        status: task.status ?? 'pendente',
        percent_complete: task.percent_complete ?? 0,
      };

      const { data, error } = await supabase
        .from(TABLE)
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      const adapted = adaptTask(data);
      setTasks(prev => [...prev, adapted]);
      toast.success('Tarefa adicionada com sucesso');
      return adapted;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<GhasScheduleTask>) => {
    try {
      const currentTask = tasks.find(t => t.id === id);

      // Remove compat fields before sending to DB
      const { project_id, priority_list_id, tipo_produto, ...dbUpdates } = updates as any;

      const { data, error } = await supabase
        .from(TABLE)
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Record history for tracked fields
      if (currentTask && isTaskOlderThan24Hours(currentTask.created_at)) {
        for (const field of TRACKED_FIELDS) {
          if (field in updates) {
            const oldValue = currentTask[field as keyof GhasScheduleTask];
            const newValue = updates[field as keyof GhasScheduleTask];
            if (String(oldValue || '') !== String(newValue || '')) {
              await recordHistory(id, field, oldValue ? String(oldValue) : null, newValue ? String(newValue) : null);
            }
          }
        }
      }

      const adapted = adaptTask(data);
      setTasks(prev => prev.map(t => t.id === id ? adapted : t));
      return adapted;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Tarefa excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
      throw error;
    }
  };

  useEffect(() => {
    loadTasks();

    if (!priorityListId) return;

    const channel = supabase
      .channel(`ghas-task-changes-${priorityListId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ghas_schedule_task',
        filter: `ghas_priority_list_id=eq.${priorityListId}`,
      }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [priorityListId]);

  return { tasks, loading, addTask, updateTask, deleteTask, loadTasks };
};
