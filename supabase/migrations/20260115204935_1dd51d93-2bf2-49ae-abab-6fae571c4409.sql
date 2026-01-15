-- Add status column to schedule_task table
ALTER TABLE public.schedule_task 
ADD COLUMN status TEXT DEFAULT 'pendente';

-- Add comment explaining the column
COMMENT ON COLUMN public.schedule_task.status IS 'Status da tarefa: pendente, em_andamento, concluida, cancelada';