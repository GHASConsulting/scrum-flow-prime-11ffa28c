-- Add codigo column to area_documento (Setor) table with auto-increment
ALTER TABLE public.area_documento
ADD COLUMN codigo SERIAL;

-- Create index for better query performance
CREATE INDEX idx_area_documento_codigo ON public.area_documento(codigo);