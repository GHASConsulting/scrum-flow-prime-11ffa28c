-- Adicionar coluna nivel na tabela prestador_servico
ALTER TABLE public.prestador_servico 
ADD COLUMN nivel text DEFAULT 'N1';

-- Adicionar check constraint para validar os valores permitidos
ALTER TABLE public.prestador_servico 
ADD CONSTRAINT prestador_servico_nivel_check 
CHECK (nivel IN ('N1', 'N2', 'Especialidade'));