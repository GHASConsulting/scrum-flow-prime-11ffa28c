-- Criar função para sincronizar status do backlog quando sprint_tarefas mudar
CREATE OR REPLACE FUNCTION public.sync_backlog_status_from_sprint_tarefa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualiza o status do backlog para refletir o status da sprint_tarefa
  UPDATE public.backlog
  SET status = NEW.status,
      updated_at = now()
  WHERE id = NEW.backlog_id;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger que dispara após INSERT ou UPDATE na sprint_tarefas
CREATE TRIGGER sync_backlog_status_trigger
AFTER INSERT OR UPDATE OF status ON public.sprint_tarefas
FOR EACH ROW
EXECUTE FUNCTION public.sync_backlog_status_from_sprint_tarefa();