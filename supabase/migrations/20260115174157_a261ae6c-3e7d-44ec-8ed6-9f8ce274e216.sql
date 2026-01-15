-- Rename table pessoa_fisica to prestador_servico
ALTER TABLE public.pessoa_fisica RENAME TO prestador_servico;

-- Rename the sequence
ALTER SEQUENCE pessoa_fisica_codigo_seq RENAME TO prestador_servico_codigo_seq;

-- Create table for produtividade (productivity records)
CREATE TABLE public.produtividade (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id uuid NOT NULL REFERENCES public.prestador_servico(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.client_access_records(id) ON DELETE CASCADE,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  horas_trabalhadas numeric(10,2) NOT NULL DEFAULT 0,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT produtividade_datas_check CHECK (data_fim >= data_inicio)
);

-- Enable RLS
ALTER TABLE public.produtividade ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for produtividade
CREATE POLICY "Authenticated users can read produtividade"
ON public.produtividade FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert produtividade"
ON public.produtividade FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update produtividade"
ON public.produtividade FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete produtividade"
ON public.produtividade FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_produtividade_updated_at
BEFORE UPDATE ON public.produtividade
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();