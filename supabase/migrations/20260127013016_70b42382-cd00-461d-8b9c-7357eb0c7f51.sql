-- Tabela principal de treinamentos
CREATE TABLE public.treinamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo INTEGER NOT NULL DEFAULT nextval('documento_codigo_seq'::regclass),
  nome TEXT NOT NULL,
  data_treinamento DATE NOT NULL DEFAULT CURRENT_DATE,
  ministrado_por_id UUID REFERENCES public.prestador_servico(id),
  descricao TEXT,
  arquivo_path TEXT,
  arquivo_nome TEXT,
  arquivo_tipo TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar sequência própria para treinamentos
CREATE SEQUENCE IF NOT EXISTS treinamento_codigo_seq START WITH 1;
ALTER TABLE public.treinamento ALTER COLUMN codigo SET DEFAULT nextval('treinamento_codigo_seq'::regclass);

-- Tabela de participantes do treinamento
CREATE TABLE public.treinamento_participante (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treinamento_id UUID NOT NULL REFERENCES public.treinamento(id) ON DELETE CASCADE,
  prestador_id UUID NOT NULL REFERENCES public.prestador_servico(id) ON DELETE CASCADE,
  capacitado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(treinamento_id, prestador_id)
);

-- Enable RLS
ALTER TABLE public.treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinamento_participante ENABLE ROW LEVEL SECURITY;

-- Policies for treinamento (similar to documento)
CREATE POLICY "Admins can insert treinamento" 
ON public.treinamento 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can update treinamento" 
ON public.treinamento 
FOR UPDATE 
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can delete treinamento" 
ON public.treinamento 
FOR DELETE 
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Authenticated users can view treinamento" 
ON public.treinamento 
FOR SELECT 
USING (true);

-- Policies for treinamento_participante
CREATE POLICY "Admins can insert treinamento_participante" 
ON public.treinamento_participante 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can update treinamento_participante" 
ON public.treinamento_participante 
FOR UPDATE 
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can delete treinamento_participante" 
ON public.treinamento_participante 
FOR DELETE 
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Authenticated users can view treinamento_participante" 
ON public.treinamento_participante 
FOR SELECT 
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_treinamento_updated_at
BEFORE UPDATE ON public.treinamento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treinamento_participante_updated_at
BEFORE UPDATE ON public.treinamento_participante
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();