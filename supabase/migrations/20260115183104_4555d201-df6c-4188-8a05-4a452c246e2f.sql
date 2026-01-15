-- Adicionar coluna para indicar se o registro foi importado
ALTER TABLE public.produtividade 
ADD COLUMN IF NOT EXISTS importado boolean NOT NULL DEFAULT false;