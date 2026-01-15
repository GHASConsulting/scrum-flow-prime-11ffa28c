-- Adicionar coluna cliente_id na tabela backlog
ALTER TABLE public.backlog 
ADD COLUMN cliente_id UUID REFERENCES public.client_access_records(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX idx_backlog_cliente_id ON public.backlog(cliente_id);