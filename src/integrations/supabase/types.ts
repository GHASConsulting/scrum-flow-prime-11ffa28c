export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      area_documento: {
        Row: {
          ativo: boolean
          codigo: number
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      ava_evento: {
        Row: {
          created_at: string
          dedupe_key: string | null
          ds_descricao: string | null
          ds_tipo: string
          dt_registro: string
          id: string
          ie_status: string
          nm_cliente: string
        }
        Insert: {
          created_at?: string
          dedupe_key?: string | null
          ds_descricao?: string | null
          ds_tipo: string
          dt_registro: string
          id?: string
          ie_status: string
          nm_cliente: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string | null
          ds_descricao?: string | null
          ds_tipo?: string
          dt_registro?: string
          id?: string
          ie_status?: string
          nm_cliente?: string
        }
        Relationships: []
      }
      backlog: {
        Row: {
          cliente_id: string | null
          created_at: string
          descricao: string | null
          id: string
          prioridade: string
          responsavel: string | null
          status: string
          story_points: number
          tipo_produto: string | null
          tipo_tarefa: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          prioridade: string
          responsavel?: string | null
          status: string
          story_points: number
          tipo_produto?: string | null
          tipo_tarefa?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          prioridade?: string
          responsavel?: string | null
          status?: string
          story_points?: number
          tipo_produto?: string | null
          tipo_tarefa?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlog_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      client_access_records: {
        Row: {
          ativo: boolean
          cliente: string
          codigo: number
          created_at: string
          id: string
          responsavel_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cliente: string
          codigo?: number
          created_at?: string
          id?: string
          responsavel_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cliente?: string
          codigo?: number
          created_at?: string
          id?: string
          responsavel_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_records_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_app_access: {
        Row: {
          app_nome: string | null
          app_senha: string | null
          app_usuario: string | null
          client_record_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          app_nome?: string | null
          app_senha?: string | null
          app_usuario?: string | null
          client_record_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          app_nome?: string | null
          app_senha?: string | null
          app_usuario?: string | null
          client_record_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_app_access_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      client_database_access: {
        Row: {
          bd_host: string | null
          bd_porta: string | null
          bd_senha: string | null
          bd_service_name: string | null
          bd_usuario: string | null
          client_record_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          bd_host?: string | null
          bd_porta?: string | null
          bd_senha?: string | null
          bd_service_name?: string | null
          bd_usuario?: string | null
          client_record_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          bd_host?: string | null
          bd_porta?: string | null
          bd_senha?: string | null
          bd_service_name?: string | null
          bd_usuario?: string | null
          client_record_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_database_access_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      client_docker_access: {
        Row: {
          client_record_id: string
          created_at: string
          docker_senha: string | null
          docker_so: string | null
          docker_usuario: string | null
          id: string
          updated_at: string
        }
        Insert: {
          client_record_id: string
          created_at?: string
          docker_senha?: string | null
          docker_so?: string | null
          docker_usuario?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          client_record_id?: string
          created_at?: string
          docker_senha?: string | null
          docker_so?: string | null
          docker_usuario?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_docker_access_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      client_server_access: {
        Row: {
          client_record_id: string
          created_at: string
          id: string
          servidor_ip: string | null
          servidor_senha: string | null
          servidor_so: string | null
          servidor_usuario: string | null
          updated_at: string
        }
        Insert: {
          client_record_id: string
          created_at?: string
          id?: string
          servidor_ip?: string | null
          servidor_senha?: string | null
          servidor_so?: string | null
          servidor_usuario?: string | null
          updated_at?: string
        }
        Update: {
          client_record_id?: string
          created_at?: string
          id?: string
          servidor_ip?: string | null
          servidor_senha?: string | null
          servidor_so?: string | null
          servidor_usuario?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_server_access_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      client_vpn_access: {
        Row: {
          client_record_id: string
          created_at: string
          id: string
          updated_at: string
          vpn_executavel_path: string | null
          vpn_ip_servidor: string | null
          vpn_nome: string | null
          vpn_senha: string | null
          vpn_usuario: string | null
        }
        Insert: {
          client_record_id: string
          created_at?: string
          id?: string
          updated_at?: string
          vpn_executavel_path?: string | null
          vpn_ip_servidor?: string | null
          vpn_nome?: string | null
          vpn_senha?: string | null
          vpn_usuario?: string | null
        }
        Update: {
          client_record_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          vpn_executavel_path?: string | null
          vpn_ip_servidor?: string | null
          vpn_nome?: string | null
          vpn_senha?: string | null
          vpn_usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_vpn_access_client_record_id_fkey"
            columns: ["client_record_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      daily: {
        Row: {
          cliente_id: string | null
          created_at: string
          data: string
          hoje: string
          id: string
          impedimentos: string | null
          ontem: string
          sprint_id: string | null
          updated_at: string
          usuario: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          hoje: string
          id?: string
          impedimentos?: string | null
          ontem: string
          sprint_id?: string | null
          updated_at?: string
          usuario: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          hoje?: string
          id?: string
          impedimentos?: string | null
          ontem?: string
          sprint_id?: string | null
          updated_at?: string
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["id"]
          },
        ]
      }
      documento: {
        Row: {
          area_documento_id: string | null
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          codigo: number
          created_at: string
          data_publicacao: string
          descricao: string | null
          id: string
          nome: string
          setores_ids: string[] | null
          status: string
          tipo_documento_id: string | null
          updated_at: string
          versao: string | null
        }
        Insert: {
          area_documento_id?: string | null
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          codigo?: number
          created_at?: string
          data_publicacao?: string
          descricao?: string | null
          id?: string
          nome: string
          setores_ids?: string[] | null
          status?: string
          tipo_documento_id?: string | null
          updated_at?: string
          versao?: string | null
        }
        Update: {
          area_documento_id?: string | null
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tipo?: string
          codigo?: number
          created_at?: string
          data_publicacao?: string
          descricao?: string | null
          id?: string
          nome?: string
          setores_ids?: string[] | null
          status?: string
          tipo_documento_id?: string | null
          updated_at?: string
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documento_area_documento_id_fkey"
            columns: ["area_documento_id"]
            isOneToOne: false
            referencedRelation: "area_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tipo_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_cliente: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          cliente_id: string
          codigo: number
          created_at: string
          data_publicacao: string
          id: string
          tipo_documento_cliente_id: string | null
          updated_at: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          cliente_id: string
          codigo?: number
          created_at?: string
          data_publicacao?: string
          id?: string
          tipo_documento_cliente_id?: string | null
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tipo?: string
          cliente_id?: string
          codigo?: number
          created_at?: string
          data_publicacao?: string
          id?: string
          tipo_documento_cliente_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documento_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_cliente_tipo_documento_cliente_id_fkey"
            columns: ["tipo_documento_cliente_id"]
            isOneToOne: false
            referencedRelation: "tipo_documento_cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      integracao_config: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          webhook_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          webhook_token: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          webhook_token?: string
        }
        Relationships: []
      }
      pessoa: {
        Row: {
          ativo: boolean
          codigo: number
          created_at: string
          deve_alterar_senha: boolean | null
          email: string | null
          id: string
          nivel: string | null
          nome: string
          setor_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          deve_alterar_senha?: boolean | null
          email?: string | null
          id?: string
          nivel?: string | null
          nome: string
          setor_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          deve_alterar_senha?: boolean | null
          email?: string | null
          id?: string
          nivel?: string | null
          nome?: string
          setor_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoa_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "area_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      prestador_servico: {
        Row: {
          codigo: number
          created_at: string
          email: string | null
          id: string
          nivel: string | null
          nome: string
          setor_id: string | null
          updated_at: string
        }
        Insert: {
          codigo?: number
          created_at?: string
          email?: string | null
          id?: string
          nivel?: string | null
          nome: string
          setor_id?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: number
          created_at?: string
          email?: string | null
          id?: string
          nivel?: string | null
          nome?: string
          setor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestador_servico_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "area_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      priority_list: {
        Row: {
          codigo: number
          created_at: string
          descricao: string | null
          id: string
          nome: string
          project_id: string
          updated_at: string
        }
        Insert: {
          codigo: number
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          project_id: string
          updated_at?: string
        }
        Update: {
          codigo?: number
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "priority_list_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      produtividade: {
        Row: {
          cliente_id: string
          codigo: number
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          horas_trabalhadas: number
          id: string
          importado: boolean
          prestador_id: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          codigo?: number
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          horas_trabalhadas?: number
          id?: string
          importado?: boolean
          prestador_id: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          codigo?: number
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          horas_trabalhadas?: number
          id?: string
          importado?: boolean
          prestador_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtividade_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestador_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      produtividade_global: {
        Row: {
          abertos: number
          abertos_15_dias: number
          backlog: number
          cliente_id: string
          codigo: number
          created_at: string
          data_fim: string
          data_inicio: string
          encerrados: number
          id: string
          importado: boolean
          percentual_incidentes: number
          percentual_solicitacoes: number
          updated_at: string
        }
        Insert: {
          abertos?: number
          abertos_15_dias?: number
          backlog?: number
          cliente_id: string
          codigo?: number
          created_at?: string
          data_fim: string
          data_inicio: string
          encerrados?: number
          id?: string
          importado?: boolean
          percentual_incidentes?: number
          percentual_solicitacoes?: number
          updated_at?: string
        }
        Update: {
          abertos?: number
          abertos_15_dias?: number
          backlog?: number
          cliente_id?: string
          codigo?: number
          created_at?: string
          data_fim?: string
          data_inicio?: string
          encerrados?: number
          id?: string
          importado?: boolean
          percentual_incidentes?: number
          percentual_solicitacoes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_global_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          deve_alterar_senha: boolean
          email: string | null
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deve_alterar_senha?: boolean
          email?: string | null
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deve_alterar_senha?: boolean
          email?: string | null
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resource: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      resumo_executivo_diario: {
        Row: {
          conteudo: string
          created_at: string
          data_geracao: string
          id: string
          periodo_fim: string
          periodo_inicio: string
          updated_at: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_geracao?: string
          id?: string
          periodo_fim: string
          periodo_inicio: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_geracao?: string
          id?: string
          periodo_fim?: string
          periodo_inicio?: string
          updated_at?: string
        }
        Relationships: []
      }
      retrospectiva: {
        Row: {
          acoes: string[]
          bom: string[]
          created_at: string
          data: string
          id: string
          melhorar: string[]
          sprint_id: string
          updated_at: string
        }
        Insert: {
          acoes?: string[]
          bom?: string[]
          created_at?: string
          data?: string
          id?: string
          melhorar?: string[]
          sprint_id: string
          updated_at?: string
        }
        Update: {
          acoes?: string[]
          bom?: string[]
          created_at?: string
          data?: string
          id?: string
          melhorar?: string[]
          sprint_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retrospectiva_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["id"]
          },
        ]
      }
      risco: {
        Row: {
          area_impactada: string
          cliente_id: string | null
          codigo: number
          comentario_acompanhamento: string | null
          created_at: string
          data_identificacao: string
          data_limite_acao: string | null
          descricao: string
          historico: string | null
          id: string
          impacto: string
          impacto_real_ocorrido: string | null
          licao_aprendida: string | null
          nivel_risco: string | null
          origem_risco: string
          plano_mitigacao: string | null
          probabilidade: string
          projeto: string
          responsavel: string | null
          risco_ocorreu: boolean | null
          status_risco: string
          tipo_risco_cliente: string
          tipo_risco_ghas: string
          updated_at: string
        }
        Insert: {
          area_impactada: string
          cliente_id?: string | null
          codigo?: number
          comentario_acompanhamento?: string | null
          created_at?: string
          data_identificacao?: string
          data_limite_acao?: string | null
          descricao: string
          historico?: string | null
          id?: string
          impacto: string
          impacto_real_ocorrido?: string | null
          licao_aprendida?: string | null
          nivel_risco?: string | null
          origem_risco: string
          plano_mitigacao?: string | null
          probabilidade: string
          projeto: string
          responsavel?: string | null
          risco_ocorreu?: boolean | null
          status_risco?: string
          tipo_risco_cliente: string
          tipo_risco_ghas: string
          updated_at?: string
        }
        Update: {
          area_impactada?: string
          cliente_id?: string | null
          codigo?: number
          comentario_acompanhamento?: string | null
          created_at?: string
          data_identificacao?: string
          data_limite_acao?: string | null
          descricao?: string
          historico?: string | null
          id?: string
          impacto?: string
          impacto_real_ocorrido?: string | null
          licao_aprendida?: string | null
          nivel_risco?: string | null
          origem_risco?: string
          plano_mitigacao?: string | null
          probabilidade?: string
          projeto?: string
          responsavel?: string | null
          risco_ocorreu?: boolean | null
          status_risco?: string
          tipo_risco_cliente?: string
          tipo_risco_ghas?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risco_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      risco_history: {
        Row: {
          created_at: string
          descricao: string
          id: string
          risco_id: string
          usuario: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          risco_id: string
          usuario: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          risco_id?: string
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "risco_history_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "risco"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap: {
        Row: {
          atores: string | null
          backlog_ids: string[] | null
          created_at: string
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio_prevista: string | null
          data_inicio_real: string | null
          descricao: string | null
          id: string
          kr: string
          sprint_tarefa_ids: string[] | null
          status: string | null
          tipo_produto: string
          updated_at: string
        }
        Insert: {
          atores?: string | null
          backlog_ids?: string[] | null
          created_at?: string
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          id?: string
          kr: string
          sprint_tarefa_ids?: string[] | null
          status?: string | null
          tipo_produto: string
          updated_at?: string
        }
        Update: {
          atores?: string | null
          backlog_ids?: string[] | null
          created_at?: string
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          id?: string
          kr?: string
          sprint_tarefa_ids?: string[] | null
          status?: string | null
          tipo_produto?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule_assignment: {
        Row: {
          allocation_pct: number | null
          created_at: string
          id: string
          resource_id: string
          role: string | null
          task_id: string
        }
        Insert: {
          allocation_pct?: number | null
          created_at?: string
          id?: string
          resource_id: string
          role?: string | null
          task_id: string
        }
        Update: {
          allocation_pct?: number | null
          created_at?: string
          id?: string
          resource_id?: string
          role?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignment_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resource"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "schedule_task"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_dependency: {
        Row: {
          created_at: string
          id: string
          lag_hours: number
          predecessor_id: string
          successor_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          lag_hours?: number
          predecessor_id: string
          successor_id: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          lag_hours?: number
          predecessor_id?: string
          successor_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_dependency_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "schedule_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_dependency_successor_id_fkey"
            columns: ["successor_id"]
            isOneToOne: false
            referencedRelation: "schedule_task"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_task: {
        Row: {
          created_at: string
          duration_days: number | null
          duration_is_estimate: boolean
          end_at: string | null
          id: string
          is_summary: boolean
          name: string
          notes: string | null
          order_index: number
          parent_id: string | null
          predecessors: string | null
          priority_list_id: string | null
          project_id: string
          responsavel: string | null
          start_at: string | null
          status: string | null
          tipo_produto: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          duration_is_estimate?: boolean
          end_at?: string | null
          id?: string
          is_summary?: boolean
          name: string
          notes?: string | null
          order_index?: number
          parent_id?: string | null
          predecessors?: string | null
          priority_list_id?: string | null
          project_id: string
          responsavel?: string | null
          start_at?: string | null
          status?: string | null
          tipo_produto?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          duration_is_estimate?: boolean
          end_at?: string | null
          id?: string
          is_summary?: boolean
          name?: string
          notes?: string | null
          order_index?: number
          parent_id?: string | null
          predecessors?: string | null
          priority_list_id?: string | null
          project_id?: string
          responsavel?: string | null
          start_at?: string | null
          status?: string | null
          tipo_produto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_task_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "schedule_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_task_priority_list_id_fkey"
            columns: ["priority_list_id"]
            isOneToOne: false
            referencedRelation: "priority_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_task_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_access_records"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_task_history: {
        Row: {
          alterado_por: string | null
          campo_alterado: string
          created_at: string
          id: string
          task_id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_por?: string | null
          campo_alterado: string
          created_at?: string
          id?: string
          task_id: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_por?: string | null
          campo_alterado?: string
          created_at?: string
          id?: string
          task_id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "schedule_task"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          nome: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          nome: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          nome?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sprint_tarefas: {
        Row: {
          backlog_id: string
          created_at: string
          id: string
          responsavel: string | null
          sprint_id: string
          status: string
          updated_at: string
        }
        Insert: {
          backlog_id: string
          created_at?: string
          id?: string
          responsavel?: string | null
          sprint_id: string
          status: string
          updated_at?: string
        }
        Update: {
          backlog_id?: string
          created_at?: string
          id?: string
          responsavel?: string | null
          sprint_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_tarefas_backlog_id_fkey"
            columns: ["backlog_id"]
            isOneToOne: false
            referencedRelation: "backlog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_tarefas_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["id"]
          },
        ]
      }
      subtarefas: {
        Row: {
          created_at: string
          fim: string
          id: string
          inicio: string
          responsavel: string | null
          sprint_tarefa_id: string
          status: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fim: string
          id?: string
          inicio: string
          responsavel?: string | null
          sprint_tarefa_id: string
          status?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fim?: string
          id?: string
          inicio?: string
          responsavel?: string | null
          sprint_tarefa_id?: string
          status?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtarefas_sprint_tarefa_id_fkey"
            columns: ["sprint_tarefa_id"]
            isOneToOne: false
            referencedRelation: "sprint_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      template_files: {
        Row: {
          created_at: string
          id: string
          nome: string
          storage_path: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          storage_path: string
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          storage_path?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipo_documento: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipo_documento_cliente: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipo_produto: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipo_tarefa: {
        Row: {
          ativo: boolean
          cliente_obrigatorio: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cliente_obrigatorio?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cliente_obrigatorio?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      treinamento: {
        Row: {
          arquivo_nome: string | null
          arquivo_path: string | null
          arquivo_tipo: string | null
          codigo: number
          created_at: string
          data_treinamento: string
          descricao: string | null
          documento_id: string | null
          id: string
          ministrado_por_id: string | null
          nome: string
          status: string
          updated_at: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_path?: string | null
          arquivo_tipo?: string | null
          codigo?: number
          created_at?: string
          data_treinamento?: string
          descricao?: string | null
          documento_id?: string | null
          id?: string
          ministrado_por_id?: string | null
          nome: string
          status?: string
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_path?: string | null
          arquivo_tipo?: string | null
          codigo?: number
          created_at?: string
          data_treinamento?: string
          descricao?: string | null
          documento_id?: string | null
          id?: string
          ministrado_por_id?: string | null
          nome?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinamento_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamento_ministrado_por_id_fkey"
            columns: ["ministrado_por_id"]
            isOneToOne: false
            referencedRelation: "prestador_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamento_participante: {
        Row: {
          capacitado: boolean
          created_at: string
          id: string
          prestador_id: string
          treinamento_id: string
          updated_at: string
        }
        Insert: {
          capacitado?: boolean
          created_at?: string
          id?: string
          prestador_id: string
          treinamento_id: string
          updated_at?: string
        }
        Update: {
          capacitado?: boolean
          created_at?: string
          id?: string
          prestador_id?: string
          treinamento_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinamento_participante_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestador_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamento_participante_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamento"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrador" | "operador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "operador"],
    },
  },
} as const
