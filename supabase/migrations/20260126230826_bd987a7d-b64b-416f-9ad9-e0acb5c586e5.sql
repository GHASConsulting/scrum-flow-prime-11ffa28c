-- Add sequential code per client to priority_list
ALTER TABLE public.priority_list
ADD COLUMN codigo integer;

-- Create function to generate sequential code per client
CREATE OR REPLACE FUNCTION public.generate_priority_list_codigo()
RETURNS TRIGGER AS $$
DECLARE
  next_code integer;
BEGIN
  SELECT COALESCE(MAX(codigo), 0) + 1 INTO next_code
  FROM public.priority_list
  WHERE project_id = NEW.project_id;
  
  NEW.codigo := next_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate codigo on insert
CREATE TRIGGER trigger_generate_priority_list_codigo
BEFORE INSERT ON public.priority_list
FOR EACH ROW
EXECUTE FUNCTION public.generate_priority_list_codigo();

-- Update existing records with sequential codes per client
WITH numbered AS (
  SELECT id, project_id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as rn
  FROM public.priority_list
)
UPDATE public.priority_list pl
SET codigo = numbered.rn
FROM numbered
WHERE pl.id = numbered.id;

-- Make codigo NOT NULL after populating existing data
ALTER TABLE public.priority_list
ALTER COLUMN codigo SET NOT NULL;