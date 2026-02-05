-- CHECKPOINT: Remoção da constraint de validação de datas para permitir importação flexível
-- Para restaurar esta regra, execute:
-- ALTER TABLE public.schedule_task ADD CONSTRAINT schedule_task_check CHECK (((end_at IS NULL) OR (start_at IS NULL) OR (end_at >= start_at)));

-- Remove a constraint que exige end_at >= start_at
ALTER TABLE public.schedule_task DROP CONSTRAINT IF EXISTS schedule_task_check;