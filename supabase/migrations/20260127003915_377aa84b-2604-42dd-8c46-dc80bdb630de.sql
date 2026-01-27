-- Create a new table for global productivity with the new fields
CREATE TABLE public.produtividade_global (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo SERIAL,
  cliente_id UUID NOT NULL REFERENCES public.client_access_records(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  abertos INTEGER NOT NULL DEFAULT 0,
  encerrados INTEGER NOT NULL DEFAULT 0,
  backlog INTEGER NOT NULL DEFAULT 0,
  percentual_incidentes NUMERIC(5,2) NOT NULL DEFAULT 0,
  percentual_solicitacoes NUMERIC(5,2) NOT NULL DEFAULT 0,
  importado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.produtividade_global ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view produtividade_global" 
ON public.produtividade_global 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert produtividade_global" 
ON public.produtividade_global 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update produtividade_global" 
ON public.produtividade_global 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete produtividade_global" 
ON public.produtividade_global 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_produtividade_global_updated_at
BEFORE UPDATE ON public.produtividade_global
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();