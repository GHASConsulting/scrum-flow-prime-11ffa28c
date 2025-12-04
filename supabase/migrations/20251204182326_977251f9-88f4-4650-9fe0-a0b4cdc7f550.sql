-- Create table for tipos de produto
CREATE TABLE public.tipo_produto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipo_produto ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can read tipo_produto"
ON public.tipo_produto
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert tipo_produto"
ON public.tipo_produto
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tipo_produto"
ON public.tipo_produto
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tipo_produto"
ON public.tipo_produto
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_tipo_produto_updated_at
BEFORE UPDATE ON public.tipo_produto
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default values
INSERT INTO public.tipo_produto (nome) VALUES 
  ('Produto'),
  ('Projeto GHAS'),
  ('Projeto Inovemed');