-- Add setor_id column to prestador_servico table
ALTER TABLE public.prestador_servico
ADD COLUMN setor_id UUID REFERENCES public.area_documento(id);

-- Create index for better query performance
CREATE INDEX idx_prestador_servico_setor_id ON public.prestador_servico(setor_id);