-- Adicionar coluna cliente_id na tabela daily
ALTER TABLE public.daily
ADD COLUMN cliente_id UUID REFERENCES public.client_access_records(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX idx_daily_cliente_id ON public.daily(cliente_id);

-- Tornar sprint_id nullable
ALTER TABLE public.daily ALTER COLUMN sprint_id DROP NOT NULL;