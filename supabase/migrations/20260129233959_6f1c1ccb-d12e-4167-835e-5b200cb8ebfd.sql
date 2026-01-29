-- Adicionar coluna cliente_obrigatorio na tabela tipo_tarefa
ALTER TABLE public.tipo_tarefa ADD COLUMN cliente_obrigatorio BOOLEAN NOT NULL DEFAULT false;