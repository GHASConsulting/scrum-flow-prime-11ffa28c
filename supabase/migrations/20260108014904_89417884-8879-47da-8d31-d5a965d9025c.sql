-- Criar tabela para "Tipo" de tarefa
CREATE TABLE public.tipo_tarefa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna tipo_tarefa na tabela backlog
ALTER TABLE public.backlog ADD COLUMN tipo_tarefa TEXT NULL;

-- Enable RLS
ALTER TABLE public.tipo_tarefa ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read tipo_tarefa"
ON public.tipo_tarefa
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert tipo_tarefa"
ON public.tipo_tarefa
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tipo_tarefa"
ON public.tipo_tarefa
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tipo_tarefa"
ON public.tipo_tarefa
FOR DELETE
USING (auth.role() = 'authenticated');