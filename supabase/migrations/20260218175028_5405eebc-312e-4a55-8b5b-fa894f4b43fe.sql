
-- Cria tabela independente de listas de prioridades GHAS (sem vínculo com clientes)
CREATE TABLE public.ghas_priority_list (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo integer NOT NULL,
  nome text NOT NULL,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger para auto-incrementar o código
CREATE OR REPLACE FUNCTION public.generate_ghas_priority_list_codigo()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  next_code integer;
BEGIN
  SELECT COALESCE(MAX(codigo), 0) + 1 INTO next_code
  FROM public.ghas_priority_list;
  NEW.codigo := next_code;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_ghas_priority_list_codigo
  BEFORE INSERT ON public.ghas_priority_list
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ghas_priority_list_codigo();

-- Trigger para updated_at
CREATE TRIGGER update_ghas_priority_list_updated_at
  BEFORE UPDATE ON public.ghas_priority_list
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Cria tabela independente de tarefas GHAS (sem vínculo com clientes)
CREATE TABLE public.ghas_schedule_task (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ghas_priority_list_id uuid NOT NULL REFERENCES public.ghas_priority_list(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.ghas_schedule_task(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  name text NOT NULL,
  is_summary boolean NOT NULL DEFAULT false,
  status text DEFAULT 'pendente',
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  duration_days numeric,
  duration_is_estimate boolean NOT NULL DEFAULT false,
  responsavel text,
  predecessors text,
  notes text,
  percent_complete integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TRIGGER update_ghas_schedule_task_updated_at
  BEFORE UPDATE ON public.ghas_schedule_task
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Histórico de alterações das tarefas GHAS
CREATE TABLE public.ghas_schedule_task_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.ghas_schedule_task(id) ON DELETE CASCADE,
  campo_alterado text NOT NULL,
  valor_anterior text,
  valor_novo text,
  alterado_por text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para ghas_priority_list
ALTER TABLE public.ghas_priority_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ghas_priority_list"
  ON public.ghas_priority_list
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS para ghas_schedule_task
ALTER TABLE public.ghas_schedule_task ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ghas_schedule_task"
  ON public.ghas_schedule_task
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS para ghas_schedule_task_history
ALTER TABLE public.ghas_schedule_task_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ghas_schedule_task_history"
  ON public.ghas_schedule_task_history
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
