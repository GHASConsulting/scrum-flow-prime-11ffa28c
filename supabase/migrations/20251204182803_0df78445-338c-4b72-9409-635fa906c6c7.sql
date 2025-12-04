-- Drop existing restrictive policies on profiles
DROP POLICY IF EXISTS "Administradores podem atualizar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem deletar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;

-- Create new PERMISSIVE policies for profiles
CREATE POLICY "Usuarios autenticados podem ver perfis"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Administradores podem inserir perfis"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Administradores podem atualizar perfis"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Usuarios podem atualizar proprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Administradores podem deletar perfis"
ON public.profiles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

-- Drop existing restrictive policies on user_roles
DROP POLICY IF EXISTS "Administradores podem atualizar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Administradores podem deletar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Administradores podem inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Administradores podem ver todas as roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuários podem ver sua própria role" ON public.user_roles;

-- Create new PERMISSIVE policies for user_roles
CREATE POLICY "Usuarios autenticados podem ver roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Administradores podem inserir roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Administradores podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Administradores podem deletar roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));