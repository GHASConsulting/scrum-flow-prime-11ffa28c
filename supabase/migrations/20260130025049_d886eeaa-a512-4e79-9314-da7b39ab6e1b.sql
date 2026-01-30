-- Tabela para armazenar histórico de acompanhamento dos riscos
CREATE TABLE public.risco_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risco_id UUID NOT NULL REFERENCES public.risco(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  usuario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risco_history ENABLE ROW LEVEL SECURITY;

-- Create policies (similar to risco table)
CREATE POLICY "Usuários autenticados podem ver histórico de riscos" 
ON public.risco_history 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir histórico de riscos" 
ON public.risco_history 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar histórico de riscos" 
ON public.risco_history 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create index for faster lookups by risco_id
CREATE INDEX idx_risco_history_risco_id ON public.risco_history(risco_id);

-- Create index for ordering by created_at
CREATE INDEX idx_risco_history_created_at ON public.risco_history(created_at DESC);