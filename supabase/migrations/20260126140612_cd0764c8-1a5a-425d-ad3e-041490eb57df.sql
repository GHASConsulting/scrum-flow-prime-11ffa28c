-- Create priority_list table to store priority lists linked to projects (clients)
CREATE TABLE public.priority_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_access_records(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.priority_list ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Permitir acesso público às listas de prioridades"
ON public.priority_list
FOR ALL
USING (true)
WITH CHECK (true);

-- Add priority_list_id to schedule_task table
ALTER TABLE public.schedule_task
ADD COLUMN priority_list_id UUID REFERENCES public.priority_list(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_priority_list_updated_at
BEFORE UPDATE ON public.priority_list
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();