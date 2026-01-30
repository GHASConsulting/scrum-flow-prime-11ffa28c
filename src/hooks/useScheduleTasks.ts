import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { isTaskOlderThan24Hours } from './useScheduleTaskHistory';

type ScheduleTask = Tables<'schedule_task'>;
type ScheduleTaskInsert = Omit<ScheduleTask, 'id' | 'created_at' | 'updated_at'>;

// Fields that should be tracked for history
const TRACKED_FIELDS = ['start_at', 'end_at', 'status', 'responsavel'];

export const useScheduleTasks = (priorityListId: string | null) => {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
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
        .from('schedule_task')
        .select('*')
        .eq('priority_list_id', priorityListId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<ScheduleTaskInsert, 'project_id'> & { priority_list_id: string }) => {
    try {
      // Get the project_id from the priority_list
      const { data: priorityList, error: plError } = await supabase
        .from('priority_list')
        .select('project_id')
        .eq('id', task.priority_list_id)
        .single();

      if (plError) throw plError;

      const { data, error } = await supabase
        .from('schedule_task')
        .insert([{ ...task, project_id: priorityList.project_id }])
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data]);
      toast.success('Tarefa adicionada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      throw error;
    }
  };

  const recordHistory = async (
    taskId: string,
    field: string,
    oldValue: string | null,
    newValue: string | null
  ) => {
    try {
      await supabase
        .from('schedule_task_history')
        .insert({
          task_id: taskId,
          campo_alterado: field,
          valor_anterior: oldValue,
          valor_novo: newValue,
          alterado_por: null // Can be enhanced to track user
        });
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<ScheduleTask>) => {
    try {
      // Get current task state for history comparison
      const currentTask = tasks.find(t => t.id === id);
      
      const { data, error } = await supabase
        .from('schedule_task')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Record history for tracked fields if task is older than 24 hours
      if (currentTask && isTaskOlderThan24Hours(currentTask.created_at)) {
        for (const field of TRACKED_FIELDS) {
          if (field in updates) {
            const oldValue = currentTask[field as keyof ScheduleTask];
            const newValue = updates[field as keyof ScheduleTask];
            
            // Only record if value actually changed
            if (String(oldValue || '') !== String(newValue || '')) {
              await recordHistory(
                id,
                field,
                oldValue ? String(oldValue) : null,
                newValue ? String(newValue) : null
              );
            }
          }
        }
      }
      
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedule_task')
        .delete()
        .eq('id', id);

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
      .channel(`schedule-task-changes-${priorityListId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'schedule_task',
        filter: `priority_list_id=eq.${priorityListId}`
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
