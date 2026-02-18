import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TaskHistoryEntry } from './useScheduleTaskHistory';

const TABLE = 'ghas_schedule_task' as any;
const HISTORY_TABLE = 'ghas_schedule_task_history' as any;

export const useGhasScheduleTaskHistory = (priorityListId: string | null) => {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!priorityListId) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);

      const { data: tasks, error: tasksError } = await supabase
        .from(TABLE)
        .select('id, name, order_index')
        .eq('ghas_priority_list_id', priorityListId);

      if (tasksError) throw tasksError;
      if (!tasks || tasks.length === 0) {
        setHistory([]);
        return;
      }

      const taskIds = tasks.map((t: any) => t.id);
      const taskMap = new Map(tasks.map((t: any) => [t.id, { name: t.name, order_index: t.order_index }]));

      const { data: historyData, error: historyError } = await supabase
        .from(HISTORY_TABLE)
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      const enrichedHistory = ((historyData as any[]) || []).map((h: any) => ({
        ...h,
        task_name: taskMap.get(h.task_id)?.name,
        task_order_index: taskMap.get(h.task_id)?.order_index,
      })) as TaskHistoryEntry[];

      setHistory(enrichedHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico GHAS:', error);
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, loadHistory };
};
