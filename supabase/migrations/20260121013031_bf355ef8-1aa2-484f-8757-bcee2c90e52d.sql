-- Add new foreign key constraint to client_access_records table
ALTER TABLE public.schedule_task 
ADD CONSTRAINT schedule_task_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.client_access_records(id) ON DELETE CASCADE;