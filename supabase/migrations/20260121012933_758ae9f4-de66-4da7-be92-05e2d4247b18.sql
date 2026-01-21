-- Remove the old foreign key constraint to project table
ALTER TABLE public.schedule_task DROP CONSTRAINT IF EXISTS schedule_task_project_id_fkey;