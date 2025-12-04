-- Remove the trigger that enforces single active sprint
DROP TRIGGER IF EXISTS trg_single_active_sprint ON public.sprint;

-- Now drop the function
DROP FUNCTION IF EXISTS public.enforce_single_active_sprint();