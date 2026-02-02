-- Re-add the foreign key constraint from treinamento.ministrado_por_id to pessoa.id
-- This time only for the ministrado_por field, not participantes

-- First, drop the constraint if it exists (it may have been partially created)
ALTER TABLE public.treinamento 
  DROP CONSTRAINT IF EXISTS treinamento_ministrado_por_id_fkey;

-- Add the new FK constraint to pessoa table
ALTER TABLE public.treinamento 
  ADD CONSTRAINT treinamento_ministrado_por_id_fkey 
  FOREIGN KEY (ministrado_por_id) 
  REFERENCES public.pessoa(id) ON DELETE SET NULL;

-- Re-add the original FK for treinamento_participante back to prestador_servico
-- (Keep participantes using prestador_servico for now)
ALTER TABLE public.treinamento_participante 
  DROP CONSTRAINT IF EXISTS treinamento_participante_prestador_id_fkey;

ALTER TABLE public.treinamento_participante 
  ADD CONSTRAINT treinamento_participante_prestador_id_fkey 
  FOREIGN KEY (prestador_id) 
  REFERENCES public.prestador_servico(id) ON DELETE CASCADE;