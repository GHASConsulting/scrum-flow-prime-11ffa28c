import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskHistoryEntry {
  id: string;
  task_id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  alterado_por: string | null;
  created_at: string;
  task_name?: string;
  task_order_index?: number;
}

export const useScheduleTaskHistory = (priorityListId: string | null) => {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!priorityListId) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);
      
      // First get all task ids for this priority list
      const { data: tasks, error: tasksError } = await supabase
        .from('schedule_task')
        .select('id, name, order_index')
        .eq('priority_list_id', priorityListId);

      if (tasksError) throw tasksError;
      if (!tasks || tasks.length === 0) {
        setHistory([]);
        return;
      }

      const taskIds = tasks.map(t => t.id);
      const taskMap = new Map(tasks.map(t => [t.id, { name: t.name, order_index: t.order_index }]));

      // Then get history for these tasks
      const { data: historyData, error: historyError } = await supabase
        .from('schedule_task_history')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      // Map history with task info
      const enrichedHistory = (historyData || []).map(h => ({
        ...h,
        task_name: taskMap.get(h.task_id)?.name,
        task_order_index: taskMap.get(h.task_id)?.order_index
      }));

      setHistory(enrichedHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async (
    taskId: string,
    campoAlterado: string,
    valorAnterior: string | null,
    valorNovo: string | null,
    alteradoPor?: string
  ) => {
    try {
      const { error } = await supabase
        .from('schedule_task_history')
        .insert({
          task_id: taskId,
          campo_alterado: campoAlterado,
          valor_anterior: valorAnterior,
          valor_novo: valorNovo,
          alterado_por: alteradoPor || null
        });

      if (error) throw error;
      
      // Reload history
      await loadHistory();
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [priorityListId]);

  return { history, loading, loadHistory, addHistoryEntry };
};

// Helper function to check if task is older than 24 hours
export const isTaskOlderThan24Hours = (createdAt: string): boolean => {
  const taskDate = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60);
  return diffInHours >= 24;
};

// Helper function to format field names for display
export const formatFieldName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    'start_at': 'Data Início',
    'end_at': 'Data Fim',
    'status': 'Status',
    'responsavel': 'Responsável',
    'name': 'Nome',
    'duration_days': 'Duração',
    'parent_id': 'Tarefa Pai'
  };
  return fieldNames[field] || field;
};

// Helper to format status values
export const formatStatusValue = (status: string | null): string => {
  if (!status) return '-';
  const statusMap: Record<string, string> = {
    'pendente': 'Pendente',
    'em_andamento': 'Fazendo',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada'
  };
  return statusMap[status] || status;
};

// Helper to format date values
export const formatDateValue = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};
