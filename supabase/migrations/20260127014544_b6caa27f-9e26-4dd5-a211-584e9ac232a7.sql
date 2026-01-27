-- Add setores_ids array column to documento table for multiple sector selection
ALTER TABLE public.documento
ADD COLUMN setores_ids UUID[] DEFAULT '{}';

-- Migrate existing area_documento_id data to setores_ids array
UPDATE public.documento 
SET setores_ids = ARRAY[area_documento_id]
WHERE area_documento_id IS NOT NULL;