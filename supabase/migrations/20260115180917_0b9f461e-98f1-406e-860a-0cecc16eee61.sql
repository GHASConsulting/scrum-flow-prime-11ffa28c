-- Add codigo column to client_access_records with auto-increment
CREATE SEQUENCE IF NOT EXISTS client_access_records_codigo_seq;

ALTER TABLE public.client_access_records 
ADD COLUMN codigo integer NOT NULL DEFAULT nextval('client_access_records_codigo_seq');

-- Set existing records to have sequential codes based on creation order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.client_access_records
)
UPDATE public.client_access_records 
SET codigo = numbered.rn
FROM numbered
WHERE client_access_records.id = numbered.id;

-- Set the sequence to continue from the max value
SELECT setval('client_access_records_codigo_seq', COALESCE((SELECT MAX(codigo) FROM public.client_access_records), 0) + 1);