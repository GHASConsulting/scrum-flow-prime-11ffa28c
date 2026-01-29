-- Adiciona coluna documento_id na tabela treinamento para vincular ao documento
ALTER TABLE public.treinamento
ADD COLUMN documento_id UUID REFERENCES public.documento(id) ON DELETE SET NULL;

-- Atualiza os valores de status existentes de 'ativo'/'inativo' para 'concluido'/'nao_concluido'
UPDATE public.treinamento 
SET status = CASE 
  WHEN status = 'ativo' THEN 'concluido'
  WHEN status = 'inativo' THEN 'nao_concluido'
  ELSE status
END;

-- Adiciona comentário para documentação
COMMENT ON COLUMN public.treinamento.documento_id IS 'Referência ao documento vinculado ao treinamento';