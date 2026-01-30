-- Adicionar coluna ativo na tabela client_access_records
ALTER TABLE public.client_access_records 
ADD COLUMN ativo boolean NOT NULL DEFAULT true;

-- Criar índice para otimizar consultas de clientes ativos
CREATE INDEX idx_client_access_records_ativo ON public.client_access_records(ativo);