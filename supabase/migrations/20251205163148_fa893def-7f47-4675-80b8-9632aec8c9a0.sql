-- Remover a constraint que valida valores fixos de tipo_produto
ALTER TABLE public.backlog DROP CONSTRAINT IF EXISTS backlog_tipo_produto_check;