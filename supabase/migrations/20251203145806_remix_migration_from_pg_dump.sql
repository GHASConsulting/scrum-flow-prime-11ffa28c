CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'administrador',
    'operador'
);


--
-- Name: block_validate_if_subtasks_open(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.block_validate_if_subtasks_open() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare open_count int;
begin
  if new.status = 'validated' and (old.status is null or old.status <> 'validated') then
    select count(*) into open_count
    from public.subtarefas s
    where s.sprint_tarefa_id = new.id
      and coalesce(s.status, 'todo') not in ('done','validated');
    if open_count > 0 then
      raise exception 'Não é possível validar: existem % subtarefas pendentes.', open_count;
    end if;
  end if;
  return new;
end;$$;


--
-- Name: enforce_single_active_sprint(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_single_active_sprint() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.status = 'ativo' then
    update public.sprint 
    set status = 'concluido', updated_at = now()
    where status = 'ativo' and id <> new.id;
  end if;
  return new;
end;$$;


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(_user_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: prevent_subtarefa_deletion_if_sprint_closed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_subtarefa_deletion_if_sprint_closed() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  sprint_status text;
BEGIN
  -- Buscar o status da sprint através da sprint_tarefa
  SELECT s.status INTO sprint_status
  FROM public.sprint s
  INNER JOIN public.sprint_tarefas st ON st.sprint_id = s.id
  WHERE st.id = OLD.sprint_tarefa_id;
  
  -- Se a sprint está concluída, bloquear a exclusão
  IF sprint_status = 'concluido' THEN
    RAISE EXCEPTION 'Não é possível excluir subtarefas de sprints encerradas';
  END IF;
  
  RETURN OLD;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;$$;


--
-- Name: validate_subtarefa_dates(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_subtarefa_dates() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.fim < new.inicio then
    raise exception 'Data fim deve ser maior ou igual à data início';
  end if;
  return new;
end;$$;


SET default_table_access_method = heap;

--
-- Name: ava_evento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ava_evento (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nm_cliente text NOT NULL,
    dt_registro character varying(200) NOT NULL,
    ds_tipo text NOT NULL,
    ds_descricao text,
    ie_status text NOT NULL,
    dedupe_key text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ava_evento_ie_status_check CHECK ((ie_status = ANY (ARRAY['success'::text, 'error'::text, 'pending'::text, 'info'::text, 'other'::text])))
);


--
-- Name: backlog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backlog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo text NOT NULL,
    descricao text,
    story_points integer NOT NULL,
    prioridade text NOT NULL,
    status text NOT NULL,
    responsavel text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tipo_produto text,
    CONSTRAINT backlog_prioridade_check CHECK ((prioridade = ANY (ARRAY['baixa'::text, 'media'::text, 'alta'::text]))),
    CONSTRAINT backlog_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'doing'::text, 'done'::text, 'validated'::text]))),
    CONSTRAINT backlog_story_points_check CHECK ((story_points >= 0)),
    CONSTRAINT backlog_tipo_produto_check CHECK ((tipo_produto = ANY (ARRAY['Produto'::text, 'Projeto GHAS'::text, 'Projeto Inovemed'::text])))
);


--
-- Name: client_access_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_access_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_app_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_app_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_record_id uuid NOT NULL,
    app_nome text,
    app_usuario text,
    app_senha text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_database_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_database_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_record_id uuid NOT NULL,
    bd_host text,
    bd_service_name text,
    bd_porta text,
    bd_usuario text,
    bd_senha text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_docker_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_docker_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_record_id uuid NOT NULL,
    docker_so text,
    docker_usuario text,
    docker_senha text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_server_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_server_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_record_id uuid NOT NULL,
    servidor_so text,
    servidor_ip text,
    servidor_usuario text,
    servidor_senha text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_vpn_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_vpn_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_record_id uuid NOT NULL,
    vpn_nome text,
    vpn_executavel_path text,
    vpn_ip_servidor text,
    vpn_usuario text,
    vpn_senha text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sprint_id uuid NOT NULL,
    usuario text NOT NULL,
    data timestamp with time zone DEFAULT now() NOT NULL,
    ontem text NOT NULL,
    hoje text NOT NULL,
    impedimentos text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: integracao_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integracao_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_token text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nome text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email text
);


--
-- Name: project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    descricao text,
    data_inicio timestamp with time zone,
    data_fim timestamp with time zone,
    status text DEFAULT 'planejamento'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT project_status_check CHECK ((status = ANY (ARRAY['planejamento'::text, 'ativo'::text, 'concluido'::text, 'cancelado'::text])))
);


--
-- Name: resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'interno'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT resource_type_check CHECK ((type = ANY (ARRAY['interno'::text, 'cliente'::text, 'fornecedor'::text])))
);


--
-- Name: retrospectiva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retrospectiva (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sprint_id uuid NOT NULL,
    bom text[] DEFAULT '{}'::text[] NOT NULL,
    melhorar text[] DEFAULT '{}'::text[] NOT NULL,
    acoes text[] DEFAULT '{}'::text[] NOT NULL,
    data timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: roadmap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmap (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kr text NOT NULL,
    descricao text,
    atores text,
    tipo_produto text NOT NULL,
    data_inicio_prevista date,
    data_fim_prevista date,
    data_inicio_real date,
    data_fim_real date,
    status text DEFAULT 'NAO_INICIADO'::text,
    backlog_ids uuid[],
    sprint_tarefa_ids uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT roadmap_status_check CHECK ((status = ANY (ARRAY['NAO_INICIADO'::text, 'EM_DESENVOLVIMENTO'::text, 'TESTES'::text, 'DESENVOLVIDO'::text, 'CANCELADO'::text]))),
    CONSTRAINT roadmap_tipo_produto_check CHECK ((tipo_produto = ANY (ARRAY['Produto'::text, 'Projeto GHAS'::text, 'Projeto Inovemed'::text])))
);


--
-- Name: schedule_assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_assignment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    resource_id uuid NOT NULL,
    role text,
    allocation_pct integer DEFAULT 100,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT schedule_assignment_allocation_pct_check CHECK (((allocation_pct >= 0) AND (allocation_pct <= 100)))
);


--
-- Name: schedule_dependency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_dependency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    predecessor_id uuid NOT NULL,
    successor_id uuid NOT NULL,
    type text DEFAULT 'FS'::text NOT NULL,
    lag_hours integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT schedule_dependency_type_check CHECK ((type = ANY (ARRAY['FS'::text, 'SS'::text, 'FF'::text, 'SF'::text])))
);


--
-- Name: schedule_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    parent_id uuid,
    order_index integer DEFAULT 0 NOT NULL,
    name text NOT NULL,
    is_summary boolean DEFAULT false NOT NULL,
    duration_days numeric(10,2),
    duration_is_estimate boolean DEFAULT false NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    predecessors text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    responsavel text,
    tipo_produto text,
    CONSTRAINT schedule_task_check CHECK (((end_at IS NULL) OR (start_at IS NULL) OR (end_at >= start_at))),
    CONSTRAINT schedule_task_tipo_produto_check CHECK ((tipo_produto = ANY (ARRAY['Produto'::text, 'Projeto GHAS'::text, 'Projeto Inovemed'::text])))
);


--
-- Name: sprint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sprint (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    data_inicio timestamp with time zone NOT NULL,
    data_fim timestamp with time zone NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sprint_status_check CHECK ((status = ANY (ARRAY['planejamento'::text, 'ativo'::text, 'concluido'::text])))
);


--
-- Name: sprint_tarefas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sprint_tarefas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sprint_id uuid NOT NULL,
    backlog_id uuid NOT NULL,
    responsavel text,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sprint_tarefas_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'doing'::text, 'done'::text, 'validated'::text])))
);


--
-- Name: subtarefas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtarefas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sprint_tarefa_id uuid NOT NULL,
    titulo text NOT NULL,
    responsavel text,
    inicio timestamp with time zone NOT NULL,
    fim timestamp with time zone NOT NULL,
    status text DEFAULT 'todo'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subtarefas_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'doing'::text, 'done'::text, 'validated'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ava_evento ava_evento_dedupe_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ava_evento
    ADD CONSTRAINT ava_evento_dedupe_key_key UNIQUE (dedupe_key);


--
-- Name: ava_evento ava_evento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ava_evento
    ADD CONSTRAINT ava_evento_pkey PRIMARY KEY (id);


--
-- Name: backlog backlog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backlog
    ADD CONSTRAINT backlog_pkey PRIMARY KEY (id);


--
-- Name: client_access_records client_access_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_access_records
    ADD CONSTRAINT client_access_records_pkey PRIMARY KEY (id);


--
-- Name: client_app_access client_app_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_app_access
    ADD CONSTRAINT client_app_access_pkey PRIMARY KEY (id);


--
-- Name: client_database_access client_database_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_database_access
    ADD CONSTRAINT client_database_access_pkey PRIMARY KEY (id);


--
-- Name: client_docker_access client_docker_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_docker_access
    ADD CONSTRAINT client_docker_access_pkey PRIMARY KEY (id);


--
-- Name: client_server_access client_server_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_server_access
    ADD CONSTRAINT client_server_access_pkey PRIMARY KEY (id);


--
-- Name: client_vpn_access client_vpn_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_vpn_access
    ADD CONSTRAINT client_vpn_access_pkey PRIMARY KEY (id);


--
-- Name: daily daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily
    ADD CONSTRAINT daily_pkey PRIMARY KEY (id);


--
-- Name: integracao_config integracao_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integracao_config
    ADD CONSTRAINT integracao_config_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- Name: retrospectiva retrospectiva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospectiva
    ADD CONSTRAINT retrospectiva_pkey PRIMARY KEY (id);


--
-- Name: roadmap roadmap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap
    ADD CONSTRAINT roadmap_pkey PRIMARY KEY (id);


--
-- Name: schedule_assignment schedule_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_assignment
    ADD CONSTRAINT schedule_assignment_pkey PRIMARY KEY (id);


--
-- Name: schedule_assignment schedule_assignment_task_id_resource_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_assignment
    ADD CONSTRAINT schedule_assignment_task_id_resource_id_key UNIQUE (task_id, resource_id);


--
-- Name: schedule_dependency schedule_dependency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_dependency
    ADD CONSTRAINT schedule_dependency_pkey PRIMARY KEY (id);


--
-- Name: schedule_dependency schedule_dependency_predecessor_id_successor_id_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_dependency
    ADD CONSTRAINT schedule_dependency_predecessor_id_successor_id_type_key UNIQUE (predecessor_id, successor_id, type);


--
-- Name: schedule_task schedule_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_task
    ADD CONSTRAINT schedule_task_pkey PRIMARY KEY (id);


--
-- Name: sprint sprint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint
    ADD CONSTRAINT sprint_pkey PRIMARY KEY (id);


--
-- Name: sprint_tarefas sprint_tarefas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_tarefas
    ADD CONSTRAINT sprint_tarefas_pkey PRIMARY KEY (id);


--
-- Name: sprint_tarefas sprint_tarefas_sprint_id_backlog_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_tarefas
    ADD CONSTRAINT sprint_tarefas_sprint_id_backlog_id_key UNIQUE (sprint_id, backlog_id);


--
-- Name: subtarefas subtarefas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtarefas
    ADD CONSTRAINT subtarefas_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: backlog_prioridade_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX backlog_prioridade_idx ON public.backlog USING btree (prioridade);


--
-- Name: backlog_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX backlog_status_idx ON public.backlog USING btree (status);


--
-- Name: idx_ava_evento_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ava_evento_cliente ON public.ava_evento USING btree (nm_cliente);


--
-- Name: idx_ava_evento_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ava_evento_data ON public.ava_evento USING btree (dt_registro);


--
-- Name: idx_ava_evento_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ava_evento_status ON public.ava_evento USING btree (ie_status);


--
-- Name: idx_ava_evento_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ava_evento_tipo ON public.ava_evento USING btree (ds_tipo);


--
-- Name: idx_integracao_config_singleton; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_integracao_config_singleton ON public.integracao_config USING btree ((true));


--
-- Name: sprint_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sprint_status_idx ON public.sprint USING btree (status);


--
-- Name: st_backlog_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX st_backlog_idx ON public.sprint_tarefas USING btree (backlog_id);


--
-- Name: st_sprint_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX st_sprint_idx ON public.sprint_tarefas USING btree (sprint_id);


--
-- Name: subtarefas_st_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subtarefas_st_idx ON public.subtarefas USING btree (sprint_tarefa_id);


--
-- Name: subtarefas prevent_subtarefa_deletion_on_closed_sprint; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_subtarefa_deletion_on_closed_sprint BEFORE DELETE ON public.subtarefas FOR EACH ROW EXECUTE FUNCTION public.prevent_subtarefa_deletion_if_sprint_closed();


--
-- Name: sprint trg_single_active_sprint; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_single_active_sprint BEFORE INSERT OR UPDATE ON public.sprint FOR EACH ROW EXECUTE FUNCTION public.enforce_single_active_sprint();


--
-- Name: sprint_tarefas trg_validate_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_guard BEFORE UPDATE ON public.sprint_tarefas FOR EACH ROW EXECUTE FUNCTION public.block_validate_if_subtasks_open();


--
-- Name: subtarefas trg_validate_subtarefa_dates; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_subtarefa_dates BEFORE INSERT OR UPDATE ON public.subtarefas FOR EACH ROW EXECUTE FUNCTION public.validate_subtarefa_dates();


--
-- Name: backlog update_backlog_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_backlog_updated_at BEFORE UPDATE ON public.backlog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_access_records update_client_access_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_access_records_updated_at BEFORE UPDATE ON public.client_access_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: daily update_daily_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_daily_updated_at BEFORE UPDATE ON public.daily FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: integracao_config update_integracao_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_integracao_config_updated_at BEFORE UPDATE ON public.integracao_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project update_project_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON public.project FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: retrospectiva update_retrospectiva_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_retrospectiva_updated_at BEFORE UPDATE ON public.retrospectiva FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: roadmap update_roadmap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_roadmap_updated_at BEFORE UPDATE ON public.roadmap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: schedule_task update_schedule_task_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_schedule_task_updated_at BEFORE UPDATE ON public.schedule_task FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sprint_tarefas update_sprint_tarefas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sprint_tarefas_updated_at BEFORE UPDATE ON public.sprint_tarefas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sprint update_sprint_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sprint_updated_at BEFORE UPDATE ON public.sprint FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subtarefas update_subtarefas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subtarefas_updated_at BEFORE UPDATE ON public.subtarefas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_app_access client_app_access_client_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_app_access
    ADD CONSTRAINT client_app_access_client_record_id_fkey FOREIGN KEY (client_record_id) REFERENCES public.client_access_records(id) ON DELETE CASCADE;


--
-- Name: client_database_access client_database_access_client_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_database_access
    ADD CONSTRAINT client_database_access_client_record_id_fkey FOREIGN KEY (client_record_id) REFERENCES public.client_access_records(id) ON DELETE CASCADE;


--
-- Name: client_docker_access client_docker_access_client_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_docker_access
    ADD CONSTRAINT client_docker_access_client_record_id_fkey FOREIGN KEY (client_record_id) REFERENCES public.client_access_records(id) ON DELETE CASCADE;


--
-- Name: client_server_access client_server_access_client_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_server_access
    ADD CONSTRAINT client_server_access_client_record_id_fkey FOREIGN KEY (client_record_id) REFERENCES public.client_access_records(id) ON DELETE CASCADE;


--
-- Name: client_vpn_access client_vpn_access_client_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_vpn_access
    ADD CONSTRAINT client_vpn_access_client_record_id_fkey FOREIGN KEY (client_record_id) REFERENCES public.client_access_records(id) ON DELETE CASCADE;


--
-- Name: daily daily_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily
    ADD CONSTRAINT daily_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprint(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: retrospectiva retrospectiva_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospectiva
    ADD CONSTRAINT retrospectiva_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprint(id) ON DELETE CASCADE;


--
-- Name: schedule_assignment schedule_assignment_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_assignment
    ADD CONSTRAINT schedule_assignment_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id) ON DELETE CASCADE;


--
-- Name: schedule_assignment schedule_assignment_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_assignment
    ADD CONSTRAINT schedule_assignment_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.schedule_task(id) ON DELETE CASCADE;


--
-- Name: schedule_dependency schedule_dependency_predecessor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_dependency
    ADD CONSTRAINT schedule_dependency_predecessor_id_fkey FOREIGN KEY (predecessor_id) REFERENCES public.schedule_task(id) ON DELETE CASCADE;


--
-- Name: schedule_dependency schedule_dependency_successor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_dependency
    ADD CONSTRAINT schedule_dependency_successor_id_fkey FOREIGN KEY (successor_id) REFERENCES public.schedule_task(id) ON DELETE CASCADE;


--
-- Name: schedule_task schedule_task_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_task
    ADD CONSTRAINT schedule_task_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.schedule_task(id) ON DELETE SET NULL;


--
-- Name: schedule_task schedule_task_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_task
    ADD CONSTRAINT schedule_task_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: sprint_tarefas sprint_tarefas_backlog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_tarefas
    ADD CONSTRAINT sprint_tarefas_backlog_id_fkey FOREIGN KEY (backlog_id) REFERENCES public.backlog(id) ON DELETE CASCADE;


--
-- Name: sprint_tarefas sprint_tarefas_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_tarefas
    ADD CONSTRAINT sprint_tarefas_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprint(id) ON DELETE CASCADE;


--
-- Name: subtarefas subtarefas_sprint_tarefa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtarefas
    ADD CONSTRAINT subtarefas_sprint_tarefa_id_fkey FOREIGN KEY (sprint_tarefa_id) REFERENCES public.sprint_tarefas(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles Administradores podem atualizar perfis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem atualizar perfis" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: user_roles Administradores podem atualizar roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem atualizar roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: profiles Administradores podem deletar perfis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem deletar perfis" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: user_roles Administradores podem deletar roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem deletar roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: profiles Administradores podem inserir perfis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem inserir perfis" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: user_roles Administradores podem inserir roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem inserir roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: user_roles Administradores podem ver todas as roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem ver todas as roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: profiles Administradores podem ver todos os perfis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: backlog Permitir acesso público ao backlog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público ao backlog" ON public.backlog USING (true) WITH CHECK (true);


--
-- Name: roadmap Permitir acesso público ao roadmap; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público ao roadmap" ON public.roadmap USING (true) WITH CHECK (true);


--
-- Name: daily Permitir acesso público aos dailies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público aos dailies" ON public.daily FOR SELECT USING (true);


--
-- Name: project Permitir acesso público aos projetos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público aos projetos" ON public.project USING (true) WITH CHECK (true);


--
-- Name: resource Permitir acesso público aos recursos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público aos recursos" ON public.resource USING (true) WITH CHECK (true);


--
-- Name: schedule_assignment Permitir acesso público às atribuições; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às atribuições" ON public.schedule_assignment USING (true) WITH CHECK (true);


--
-- Name: schedule_dependency Permitir acesso público às dependências; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às dependências" ON public.schedule_dependency USING (true) WITH CHECK (true);


--
-- Name: retrospectiva Permitir acesso público às retrospectivas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às retrospectivas" ON public.retrospectiva FOR SELECT USING (true);


--
-- Name: sprint_tarefas Permitir acesso público às sprint_tarefas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às sprint_tarefas" ON public.sprint_tarefas USING (true) WITH CHECK (true);


--
-- Name: sprint Permitir acesso público às sprints; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às sprints" ON public.sprint USING (true) WITH CHECK (true);


--
-- Name: subtarefas Permitir acesso público às subtarefas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às subtarefas" ON public.subtarefas USING (true) WITH CHECK (true);


--
-- Name: schedule_task Permitir acesso público às tarefas do cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acesso público às tarefas do cronograma" ON public.schedule_task USING (true) WITH CHECK (true);


--
-- Name: daily Usuários autenticados podem atualizar dailies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar dailies" ON public.daily FOR UPDATE TO authenticated USING (true);


--
-- Name: client_app_access Usuários autenticados podem atualizar registros App; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar registros App" ON public.client_app_access FOR UPDATE USING (true);


--
-- Name: client_database_access Usuários autenticados podem atualizar registros BD; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar registros BD" ON public.client_database_access FOR UPDATE USING (true);


--
-- Name: client_docker_access Usuários autenticados podem atualizar registros Docker; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar registros Docker" ON public.client_docker_access FOR UPDATE USING (true);


--
-- Name: client_server_access Usuários autenticados podem atualizar registros Servidor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar registros Servidor" ON public.client_server_access FOR UPDATE USING (true);


--
-- Name: client_vpn_access Usuários autenticados podem atualizar registros VPN; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar registros VPN" ON public.client_vpn_access FOR UPDATE USING (true);


--
-- Name: client_access_records Usuários autenticados podem atualizar registros de acesso; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar registros de acesso" ON public.client_access_records FOR UPDATE TO authenticated USING (true);


--
-- Name: retrospectiva Usuários autenticados podem atualizar retrospectivas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem atualizar retrospectivas" ON public.retrospectiva FOR UPDATE TO authenticated USING (true);


--
-- Name: daily Usuários autenticados podem deletar dailies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar dailies" ON public.daily FOR DELETE TO authenticated USING (true);


--
-- Name: client_app_access Usuários autenticados podem deletar registros App; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar registros App" ON public.client_app_access FOR DELETE USING (true);


--
-- Name: client_database_access Usuários autenticados podem deletar registros BD; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar registros BD" ON public.client_database_access FOR DELETE USING (true);


--
-- Name: client_docker_access Usuários autenticados podem deletar registros Docker; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar registros Docker" ON public.client_docker_access FOR DELETE USING (true);


--
-- Name: client_server_access Usuários autenticados podem deletar registros Servidor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar registros Servidor" ON public.client_server_access FOR DELETE USING (true);


--
-- Name: client_vpn_access Usuários autenticados podem deletar registros VPN; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar registros VPN" ON public.client_vpn_access FOR DELETE USING (true);


--
-- Name: client_access_records Usuários autenticados podem deletar registros de acesso; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar registros de acesso" ON public.client_access_records FOR DELETE TO authenticated USING (true);


--
-- Name: retrospectiva Usuários autenticados podem deletar retrospectivas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem deletar retrospectivas" ON public.retrospectiva FOR DELETE TO authenticated USING (true);


--
-- Name: daily Usuários autenticados podem inserir dailies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir dailies" ON public.daily FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: client_app_access Usuários autenticados podem inserir registros App; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir registros App" ON public.client_app_access FOR INSERT WITH CHECK (true);


--
-- Name: client_database_access Usuários autenticados podem inserir registros BD; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir registros BD" ON public.client_database_access FOR INSERT WITH CHECK (true);


--
-- Name: client_docker_access Usuários autenticados podem inserir registros Docker; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir registros Docker" ON public.client_docker_access FOR INSERT WITH CHECK (true);


--
-- Name: client_server_access Usuários autenticados podem inserir registros Servidor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir registros Servidor" ON public.client_server_access FOR INSERT WITH CHECK (true);


--
-- Name: client_vpn_access Usuários autenticados podem inserir registros VPN; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir registros VPN" ON public.client_vpn_access FOR INSERT WITH CHECK (true);


--
-- Name: client_access_records Usuários autenticados podem inserir registros de acesso; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir registros de acesso" ON public.client_access_records FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: retrospectiva Usuários autenticados podem inserir retrospectivas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem inserir retrospectivas" ON public.retrospectiva FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: client_app_access Usuários autenticados podem ver registros App; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver registros App" ON public.client_app_access FOR SELECT USING (true);


--
-- Name: client_database_access Usuários autenticados podem ver registros BD; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver registros BD" ON public.client_database_access FOR SELECT USING (true);


--
-- Name: client_docker_access Usuários autenticados podem ver registros Docker; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver registros Docker" ON public.client_docker_access FOR SELECT USING (true);


--
-- Name: client_server_access Usuários autenticados podem ver registros Servidor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver registros Servidor" ON public.client_server_access FOR SELECT USING (true);


--
-- Name: client_vpn_access Usuários autenticados podem ver registros VPN; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver registros VPN" ON public.client_vpn_access FOR SELECT USING (true);


--
-- Name: client_access_records Usuários autenticados podem ver registros de acesso; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver registros de acesso" ON public.client_access_records FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Usuários autenticados podem ver todos os perfis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem ver todos os perfis" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Usuários podem ver seu próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Usuários podem ver sua própria role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver sua própria role" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: integracao_config admin read integracao_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin read integracao_config" ON public.integracao_config FOR SELECT USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: integracao_config admin write integracao_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write integracao_config" ON public.integracao_config USING (public.has_role(auth.uid(), 'administrador'::public.app_role));


--
-- Name: ava_evento auth delete ava_evento; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "auth delete ava_evento" ON public.ava_evento FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: ava_evento auth insert ava_evento; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "auth insert ava_evento" ON public.ava_evento FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: ava_evento auth read ava_evento; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "auth read ava_evento" ON public.ava_evento FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: ava_evento auth update ava_evento; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "auth update ava_evento" ON public.ava_evento FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: ava_evento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ava_evento ENABLE ROW LEVEL SECURITY;

--
-- Name: backlog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.backlog ENABLE ROW LEVEL SECURITY;

--
-- Name: client_access_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_access_records ENABLE ROW LEVEL SECURITY;

--
-- Name: client_app_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_app_access ENABLE ROW LEVEL SECURITY;

--
-- Name: client_database_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_database_access ENABLE ROW LEVEL SECURITY;

--
-- Name: client_docker_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_docker_access ENABLE ROW LEVEL SECURITY;

--
-- Name: client_server_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_server_access ENABLE ROW LEVEL SECURITY;

--
-- Name: client_vpn_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_vpn_access ENABLE ROW LEVEL SECURITY;

--
-- Name: daily; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily ENABLE ROW LEVEL SECURITY;

--
-- Name: integracao_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.integracao_config ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: project; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project ENABLE ROW LEVEL SECURITY;

--
-- Name: resource; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resource ENABLE ROW LEVEL SECURITY;

--
-- Name: retrospectiva; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.retrospectiva ENABLE ROW LEVEL SECURITY;

--
-- Name: roadmap; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roadmap ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_assignment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_assignment ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_dependency; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_dependency ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_task; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_task ENABLE ROW LEVEL SECURITY;

--
-- Name: sprint; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sprint ENABLE ROW LEVEL SECURITY;

--
-- Name: sprint_tarefas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sprint_tarefas ENABLE ROW LEVEL SECURITY;

--
-- Name: subtarefas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subtarefas ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


