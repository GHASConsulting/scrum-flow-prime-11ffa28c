-- Add codigo column to documento table (auto-increment ID)
ALTER TABLE public.documento ADD COLUMN codigo SERIAL;

-- Create unique index on codigo
CREATE UNIQUE INDEX idx_documento_codigo ON public.documento(codigo);