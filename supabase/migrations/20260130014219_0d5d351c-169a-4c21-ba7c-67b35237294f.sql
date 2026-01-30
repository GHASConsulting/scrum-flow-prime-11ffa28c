-- Adicionar coluna responsavel_id na tabela client_access_records
-- Referencia a tabela profiles para vincular um usuário do sistema
ALTER TABLE public.client_access_records 
ADD COLUMN responsavel_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;