-- Criar tabela para tipos de documento
CREATE TABLE public.tipo_documento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para áreas/categorias de documento
CREATE TABLE public.area_documento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para documentos
CREATE TABLE public.documento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_documento_id UUID REFERENCES public.tipo_documento(id) ON DELETE SET NULL,
  area_documento_id UUID REFERENCES public.area_documento(id) ON DELETE SET NULL,
  versao TEXT,
  descricao TEXT,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tipo TEXT NOT NULL,
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tipo_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento ENABLE ROW LEVEL SECURITY;

-- Políticas para tipo_documento
CREATE POLICY "Authenticated users can view active tipo_documento"
ON public.tipo_documento FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert tipo_documento"
ON public.tipo_documento FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update tipo_documento"
ON public.tipo_documento FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete tipo_documento"
ON public.tipo_documento FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'administrador'));

-- Políticas para area_documento
CREATE POLICY "Authenticated users can view active area_documento"
ON public.area_documento FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert area_documento"
ON public.area_documento FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update area_documento"
ON public.area_documento FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete area_documento"
ON public.area_documento FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'administrador'));

-- Políticas para documento
CREATE POLICY "Authenticated users can view active documento"
ON public.documento FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert documento"
ON public.documento FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update documento"
ON public.documento FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete documento"
ON public.documento FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'administrador'));

-- Triggers para updated_at
CREATE TRIGGER update_tipo_documento_updated_at
BEFORE UPDATE ON public.tipo_documento
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_area_documento_updated_at
BEFORE UPDATE ON public.area_documento
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documento_updated_at
BEFORE UPDATE ON public.documento
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true);

-- Políticas de storage para documentos
CREATE POLICY "Anyone can view documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos');

CREATE POLICY "Admins can upload documentos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentos' AND public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update documentos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documentos' AND public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete documentos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documentos' AND public.has_role(auth.uid(), 'administrador'));