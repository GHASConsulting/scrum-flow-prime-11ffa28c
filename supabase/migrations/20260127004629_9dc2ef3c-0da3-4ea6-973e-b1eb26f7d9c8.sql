-- Create table for client document types
CREATE TABLE public.tipo_documento_cliente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipo_documento_cliente ENABLE ROW LEVEL SECURITY;

-- Create policies for tipo_documento_cliente
CREATE POLICY "Authenticated users can view tipo_documento_cliente" 
ON public.tipo_documento_cliente 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can insert tipo_documento_cliente" 
ON public.tipo_documento_cliente 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update tipo_documento_cliente" 
ON public.tipo_documento_cliente 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete tipo_documento_cliente" 
ON public.tipo_documento_cliente 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'administrador'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tipo_documento_cliente_updated_at
BEFORE UPDATE ON public.tipo_documento_cliente
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for client documents
CREATE TABLE public.documento_cliente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo SERIAL,
  cliente_id UUID NOT NULL REFERENCES public.client_access_records(id) ON DELETE CASCADE,
  tipo_documento_cliente_id UUID REFERENCES public.tipo_documento_cliente(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tipo TEXT NOT NULL,
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documento_cliente ENABLE ROW LEVEL SECURITY;

-- Create policies for documento_cliente
CREATE POLICY "Authenticated users can view documento_cliente" 
ON public.documento_cliente 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert documento_cliente" 
ON public.documento_cliente 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documento_cliente" 
ON public.documento_cliente 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete documento_cliente" 
ON public.documento_cliente 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documento_cliente_updated_at
BEFORE UPDATE ON public.documento_cliente
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-cliente', 'documentos-cliente', true);

-- Create storage policies for the bucket
CREATE POLICY "Authenticated users can view client documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-cliente');

CREATE POLICY "Authenticated users can upload client documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-cliente');

CREATE POLICY "Authenticated users can update client documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos-cliente');

CREATE POLICY "Authenticated users can delete client documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-cliente');