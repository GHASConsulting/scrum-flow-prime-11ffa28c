-- Create storage bucket for templates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for templates bucket
CREATE POLICY "Templates are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates');

CREATE POLICY "Authenticated users can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'templates' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update templates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'templates' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete templates"
ON storage.objects FOR DELETE
USING (bucket_id = 'templates' AND auth.role() = 'authenticated');

-- Create table to track template files metadata
CREATE TABLE public.template_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.template_files ENABLE ROW LEVEL SECURITY;

-- Everyone can read templates
CREATE POLICY "Templates are publicly readable"
ON public.template_files FOR SELECT
USING (true);

-- Only authenticated users can manage templates
CREATE POLICY "Authenticated users can insert templates"
ON public.template_files FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update templates"
ON public.template_files FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete templates"
ON public.template_files FOR DELETE
USING (auth.role() = 'authenticated');