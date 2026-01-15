-- Create table for Pessoa Física (Individual Registration)
CREATE TABLE public.pessoa_fisica (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo serial UNIQUE NOT NULL,
  nome text NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pessoa_fisica ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read pessoa_fisica"
ON public.pessoa_fisica FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert pessoa_fisica"
ON public.pessoa_fisica FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update pessoa_fisica"
ON public.pessoa_fisica FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete pessoa_fisica"
ON public.pessoa_fisica FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_pessoa_fisica_updated_at
BEFORE UPDATE ON public.pessoa_fisica
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();