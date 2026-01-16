
-- Remover trigger e função atuais (backlog → sprint_tarefas)
DROP TRIGGER IF EXISTS sync_sprint_tarefas_status_trigger ON public.backlog;
DROP FUNCTION IF EXISTS public.sync_sprint_tarefas_status_from_backlog();

-- Criar nova função para sincronizar backlog quando sprint_tarefas mudar
CREATE OR REPLACE FUNCTION public.sync_backlog_status_from_sprint_tarefa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualiza o status do backlog com base no status da sprint_tarefa
  UPDATE public.backlog
  SET status = NEW.status,
      updated_at = now()
  WHERE id = NEW.backlog_id;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger que dispara após UPDATE de status na tabela sprint_tarefas
CREATE TRIGGER sync_backlog_status_trigger
AFTER UPDATE OF status ON public.sprint_tarefas
FOR EACH ROW
EXECUTE FUNCTION public.sync_backlog_status_from_sprint_tarefa();
