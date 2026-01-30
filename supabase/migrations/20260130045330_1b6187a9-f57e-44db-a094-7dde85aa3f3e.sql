-- Create table to store daily executive summaries
CREATE TABLE public.resumo_executivo_diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_geracao DATE NOT NULL DEFAULT CURRENT_DATE,
  conteudo TEXT NOT NULL,
  periodo_inicio VARCHAR(10) NOT NULL,
  periodo_fim VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_daily_summary UNIQUE (data_geracao)
);

-- Enable RLS
ALTER TABLE public.resumo_executivo_diario ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view summaries
CREATE POLICY "Authenticated users can view summaries"
ON public.resumo_executivo_diario
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: All authenticated users can insert summaries
CREATE POLICY "Authenticated users can insert summaries"
ON public.resumo_executivo_diario
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: All authenticated users can update summaries
CREATE POLICY "Authenticated users can update summaries"
ON public.resumo_executivo_diario
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_resumo_executivo_diario_updated_at
BEFORE UPDATE ON public.resumo_executivo_diario
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();