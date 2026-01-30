-- Add codigo column with auto-increment sequence
ALTER TABLE public.risco 
ADD COLUMN codigo integer;

-- Create a sequence for risco codigo
CREATE SEQUENCE IF NOT EXISTS public.risco_codigo_seq;

-- Set default for new records
ALTER TABLE public.risco 
ALTER COLUMN codigo SET DEFAULT nextval('public.risco_codigo_seq'::regclass);

-- Populate existing records with sequential codes
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.risco
)
UPDATE public.risco r
SET codigo = n.rn
FROM numbered n
WHERE r.id = n.id;

-- Set the sequence to the next value
SELECT setval('public.risco_codigo_seq', COALESCE((SELECT MAX(codigo) FROM public.risco), 0) + 1);

-- Make codigo NOT NULL after populating
ALTER TABLE public.risco 
ALTER COLUMN codigo SET NOT NULL;

-- Add cliente_id foreign key column
ALTER TABLE public.risco 
ADD COLUMN cliente_id uuid REFERENCES public.client_access_records(id);

-- Update existing records to match cliente_id based on projeto text
UPDATE public.risco r
SET cliente_id = c.id
FROM public.client_access_records c
WHERE r.projeto = c.cliente;