import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toZonedTime } from "date-fns-tz";

type StatusColor = 'verde' | 'amarelo' | 'vermelho';

interface PriorityListStatus {
  listId: string;
  listName: string;
  status: StatusColor;
}

interface ClientPrioridadesStatus {
  clientId: string;
  status: StatusColor;
  listsStatuses: PriorityListStatus[];
}

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Calculate traffic light status for a single priority list's tasks
const calculateListTrafficLight = (tasks: any[]): StatusColor => {
  if (tasks.length === 0) return 'verde';
  
  // Get current date in Brazil timezone at 23:59:59
  const now = new Date();
  const brazilNow = toZonedTime(now, BRAZIL_TIMEZONE);
  brazilNow.setHours(23, 59, 59, 999);
  
  // Filter non-completed and non-cancelled tasks
  const nonCompletedTasks = tasks.filter(
    task => task.status !== 'concluida' && task.status !== 'cancelada' && task.end_at
  );
  
  if (nonCompletedTasks.length === 0) return 'verde';
  
  // Find overdue tasks
  const overdueTasks = nonCompletedTasks.filter(task => {
    const taskEndDate = toZonedTime(new Date(task.end_at), BRAZIL_TIMEZONE);
    return taskEndDate < brazilNow;
  });
  
  if (overdueTasks.length === 0) return 'verde';
  
  // Check for tasks overdue by more than 7 days
  const tasksOver7Days = overdueTasks.filter(task => {
    const taskEndDate = toZonedTime(new Date(task.end_at), BRAZIL_TIMEZONE);
    const diffTime = brazilNow.getTime() - taskEndDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  });
  
  // Red: more than 30% overdue OR any task over 7 days
  const totalTasks = tasks.filter(t => t.status !== 'cancelada').length;
  const overduePercentage = totalTasks > 0 ? (overdueTasks.length / totalTasks) : 0;
  
  if (overduePercentage > 0.3 || tasksOver7Days.length > 0) {
    return 'vermelho';
  }
  
  // Yellow: at least one overdue
  return 'amarelo';
};

// Calculate overall client status based on all priority lists
const calculateClientStatus = (listsStatuses: PriorityListStatus[]): StatusColor => {
  if (listsStatuses.length === 0) return 'verde';
  
  const redCount = listsStatuses.filter(l => l.status === 'vermelho').length;
  const yellowCount = listsStatuses.filter(l => l.status === 'amarelo').length;
  const totalLists = listsStatuses.length;
  
  // Red: any list is red OR 51%+ of lists are yellow
  if (redCount > 0) return 'vermelho';
  if (totalLists > 0 && (yellowCount / totalLists) >= 0.51) return 'vermelho';
  
  // Yellow: one or more lists are yellow
  if (yellowCount > 0) return 'amarelo';
  
  // Green: all lists are green
  return 'verde';
};

export const useClientPrioridadesStatus = () => {
  return useQuery({
    queryKey: ["client-prioridades-status"],
    queryFn: async () => {
      // Fetch all priority lists with their project_id (client_id)
      const { data: priorityLists, error: plError } = await supabase
        .from("priority_list")
        .select("id, nome, project_id");
      
      if (plError) throw plError;
      
      if (!priorityLists || priorityLists.length === 0) {
        return {} as Record<string, ClientPrioridadesStatus>;
      }
      
      // Fetch all schedule tasks for these priority lists
      const listIds = priorityLists.map(pl => pl.id);
      const { data: allTasks, error: tasksError } = await supabase
        .from("schedule_task")
        .select("id, priority_list_id, status, end_at")
        .in("priority_list_id", listIds);
      
      if (tasksError) throw tasksError;
      
      // Group tasks by priority_list_id
      const tasksByList: Record<string, any[]> = {};
      (allTasks || []).forEach(task => {
        if (!tasksByList[task.priority_list_id]) {
          tasksByList[task.priority_list_id] = [];
        }
        tasksByList[task.priority_list_id].push(task);
      });
      
      // Calculate status for each priority list
      const listStatusMap: Record<string, PriorityListStatus[]> = {};
      
      priorityLists.forEach(pl => {
        const tasks = tasksByList[pl.id] || [];
        const status = calculateListTrafficLight(tasks);
        
        if (!listStatusMap[pl.project_id]) {
          listStatusMap[pl.project_id] = [];
        }
        
        listStatusMap[pl.project_id].push({
          listId: pl.id,
          listName: pl.nome,
          status,
        });
      });
      
      // Calculate overall status for each client
      const clientStatusMap: Record<string, ClientPrioridadesStatus> = {};
      
      Object.entries(listStatusMap).forEach(([clientId, listsStatuses]) => {
        clientStatusMap[clientId] = {
          clientId,
          status: calculateClientStatus(listsStatuses),
          listsStatuses,
        };
      });
      
      return clientStatusMap;
    },
  });
};
