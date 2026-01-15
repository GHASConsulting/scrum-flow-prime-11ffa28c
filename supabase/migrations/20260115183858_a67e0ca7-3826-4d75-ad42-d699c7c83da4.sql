-- Criar sequência para código de produtividade
CREATE SEQUENCE IF NOT EXISTS produtividade_codigo_seq START 1;

-- Adicionar coluna codigo
ALTER TABLE public.produtividade 
ADD COLUMN IF NOT EXISTS codigo integer NOT NULL DEFAULT nextval('produtividade_codigo_seq');

-- Atualizar registros existentes com códigos sequenciais
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.produtividade
)
UPDATE public.produtividade p
SET codigo = n.rn
FROM numbered n
WHERE p.id = n.id;

-- Atualizar a sequência para continuar do último valor
SELECT setval('produtividade_codigo_seq', COALESCE((SELECT MAX(codigo) FROM public.produtividade), 0) + 1, false);