-- Remover trigger e função antigos
DROP TRIGGER IF EXISTS sync_backlog_status_trigger ON public.sprint_tarefas;
DROP FUNCTION IF EXISTS public.sync_backlog_status_from_sprint_tarefa();

-- Criar nova função para sincronizar sprint_tarefas quando backlog mudar
CREATE OR REPLACE FUNCTION public.sync_sprint_tarefas_status_from_backlog()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualiza o status de todas as sprint_tarefas vinculadas ao backlog
  UPDATE public.sprint_tarefas
  SET status = NEW.status,
      updated_at = now()
  WHERE backlog_id = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger que dispara após UPDATE de status na tabela backlog
CREATE TRIGGER sync_sprint_tarefas_status_trigger
AFTER UPDATE OF status ON public.backlog
FOR EACH ROW
EXECUTE FUNCTION public.sync_sprint_tarefas_status_from_backlog();