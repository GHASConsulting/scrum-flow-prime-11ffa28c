-- Adicionar campo para controlar alteração de senha obrigatória
ALTER TABLE public.profiles 
ADD COLUMN deve_alterar_senha boolean NOT NULL DEFAULT true;

-- Atualizar usuários existentes para não precisarem alterar (opcional - remover se quiser forçar todos)
UPDATE public.profiles SET deve_alterar_senha = false;