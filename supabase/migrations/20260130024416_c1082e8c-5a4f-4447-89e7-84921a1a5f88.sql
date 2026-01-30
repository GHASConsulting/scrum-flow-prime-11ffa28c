-- Tabela para armazenar histórico de alterações das tarefas do cronograma
CREATE TABLE public.schedule_task_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.schedule_task(id) ON DELETE CASCADE,
  campo_alterado TEXT NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  alterado_por TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_task_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (similar to schedule_task)
CREATE POLICY "Permitir acesso público ao histórico de tarefas" 
ON public.schedule_task_history 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for faster lookups by task_id
CREATE INDEX idx_schedule_task_history_task_id ON public.schedule_task_history(task_id);

-- Create index for faster lookups by created_at
CREATE INDEX idx_schedule_task_history_created_at ON public.schedule_task_history(created_at DESC);