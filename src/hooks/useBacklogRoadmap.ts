import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type RoadmapTaskStatus = 'EM_SPRINT' | 'NAO_PLANEJADA' | 'EM_PLANEJAMENTO' | 'ENTREGUE' | 'EM_ATRASO';

export interface BacklogRoadmapItem {
  id: string;
  titulo: string;
  descricao: string | null;
  story_points: number;
  prioridade: string;
  status: string; // status do backlog
  responsavel: string | null;
  tipo_produto: string | null;
  tipo_tarefa: string | null;
  created_at: string;
  updated_at: string;
  // Dados da sprint (se vinculado)
  sprint_tarefa_id: string | null;
  sprint_id: string | null;
  sprint_data_inicio: string | null;
  sprint_data_fim: string | null;
  sprint_status: string | null; // status da sprint (planejada, ativa, concluida)
  // Subtarefas
  subtarefas: {
    id: string;
    titulo: string;
    inicio: string;
    fim: string;
    status: string | null;
    responsavel: string | null;
  }[];
  // Status calculado do roadmap
  roadmapStatus: RoadmapTaskStatus;
}

const calculateRoadmapStatus = (
  backlogStatus: string,
  sprintStatus: string | null,
  sprintDataFim: string | null,
  subtarefas: { fim: string; status: string | null }[]
): RoadmapTaskStatus => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // NÃO PLANEJADA - Tarefa fora de sprint
  if (!sprintStatus) {
    return 'NAO_PLANEJADA';
  }
  
  // ENTREGUE - Sprint ativa e status do backlog é FEITO ou VALIDADO
  if (sprintStatus === 'ativa' && (backlogStatus === 'feito' || backlogStatus === 'validado')) {
    return 'ENTREGUE';
  }
  
  // EM ATRASO - Verificar se está atrasado
  const isBacklogNaoConcluido = backlogStatus !== 'feito' && backlogStatus !== 'validado';
  
  if (isBacklogNaoConcluido) {
    // Verificar se a data da sprint já passou
    if (sprintDataFim) {
      const dataFimSprint = new Date(sprintDataFim);
      dataFimSprint.setHours(0, 0, 0, 0);
      if (dataFimSprint < hoje) {
        return 'EM_ATRASO';
      }
    }
    
    // Verificar se a maior data fim de uma subtarefa é menor que a data atual
    if (subtarefas.length > 0) {
      const datasFim = subtarefas
        .map(s => new Date(s.fim).getTime())
        .filter(d => !isNaN(d));
      
      if (datasFim.length > 0) {
        const maiorDataFim = new Date(Math.max(...datasFim));
        maiorDataFim.setHours(0, 0, 0, 0);
        if (maiorDataFim < hoje) {
          return 'EM_ATRASO';
        }
      }
    }
  }
  
  // EM SPRINT - Sprint ativa
  if (sprintStatus === 'ativa') {
    return 'EM_SPRINT';
  }
  
  // EM PLANEJAMENTO - Sprint não ativa (planejada ou concluída)
  return 'EM_PLANEJAMENTO';
};

export const useBacklogRoadmap = () => {
  const [items, setItems] = useState<BacklogRoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os itens do backlog
      const { data: backlogItems, error: backlogError } = await supabase
        .from('backlog')
        .select('*')
        .order('created_at', { ascending: false });

      if (backlogError) throw backlogError;

      // Buscar todas as sprint_tarefas com dados da sprint
      const { data: sprintTarefas, error: sprintTarefasError } = await supabase
        .from('sprint_tarefas')
        .select(`
          id,
          backlog_id,
          sprint_id,
          responsavel,
          status,
          sprint:sprint_id (
            data_inicio,
            data_fim,
            status
          )
        `);

      if (sprintTarefasError) throw sprintTarefasError;

      // Buscar todas as subtarefas
      const { data: subtarefas, error: subtarefasError } = await supabase
        .from('subtarefas')
        .select('*')
        .order('inicio', { ascending: true });

      if (subtarefasError) throw subtarefasError;

      // Criar mapa de sprint_tarefas por backlog_id
      const sprintTarefasMap = new Map<string, any[]>();
      (sprintTarefas || []).forEach((st: any) => {
        if (!sprintTarefasMap.has(st.backlog_id)) {
          sprintTarefasMap.set(st.backlog_id, []);
        }
        sprintTarefasMap.get(st.backlog_id)!.push(st);
      });

      // Criar mapa de subtarefas por sprint_tarefa_id
      const subtarefasMap = new Map<string, any[]>();
      (subtarefas || []).forEach((sub: any) => {
        if (!subtarefasMap.has(sub.sprint_tarefa_id)) {
          subtarefasMap.set(sub.sprint_tarefa_id, []);
        }
        subtarefasMap.get(sub.sprint_tarefa_id)!.push(sub);
      });

      // Montar itens completos
      const itemsCompletos: BacklogRoadmapItem[] = (backlogItems || []).map((backlog) => {
        const sprintTarefasDoBacklog = sprintTarefasMap.get(backlog.id) || [];
        
        // Calcular primeira e última data das sprints
        let sprintDataInicio: string | null = null;
        let sprintDataFim: string | null = null;
        let sprintTarefaId: string | null = null;
        let sprintId: string | null = null;
        let sprintStatus: string | null = null;

        if (sprintTarefasDoBacklog.length > 0) {
          const sprintsData = sprintTarefasDoBacklog
            .filter((st: any) => st.sprint)
            .map((st: any) => ({
              inicio: new Date(st.sprint.data_inicio).getTime(),
              fim: new Date(st.sprint.data_fim).getTime(),
              id: st.id,
              sprintId: st.sprint_id,
              sprintStatus: st.sprint.status,
            }));
          
          if (sprintsData.length > 0) {
            // Priorizar sprint ativa
            const sprintAtiva = sprintsData.find((s: any) => s.sprintStatus === 'ativa');
            const sprintSelecionada = sprintAtiva || sprintsData[0];
            
            const primeiraData = sprintsData.reduce((min: any, d: any) => d.inicio < min.inicio ? d : min, sprintsData[0]);
            const ultimaData = sprintsData.reduce((max: any, d: any) => d.fim > max.fim ? d : max, sprintsData[0]);
            
            sprintDataInicio = new Date(primeiraData.inicio).toISOString();
            sprintDataFim = new Date(ultimaData.fim).toISOString();
            sprintTarefaId = sprintSelecionada.id;
            sprintId = sprintSelecionada.sprintId;
            sprintStatus = sprintSelecionada.sprintStatus;
            
            // Se há sprint ativa, usar o status dela
            if (sprintAtiva) {
              sprintStatus = 'ativa';
            }
          }
        }

        // Coletar todas as subtarefas de todas as sprint_tarefas deste backlog
        const todasSubtarefas = sprintTarefasDoBacklog.flatMap((st: any) => 
          (subtarefasMap.get(st.id) || []).map((sub: any) => ({
            id: sub.id,
            titulo: sub.titulo,
            inicio: sub.inicio,
            fim: sub.fim,
            status: sub.status,
            responsavel: sub.responsavel,
          }))
        );

        // Calcular status do roadmap
        const roadmapStatus = calculateRoadmapStatus(
          backlog.status,
          sprintStatus,
          sprintDataFim,
          todasSubtarefas
        );

        return {
          id: backlog.id,
          titulo: backlog.titulo,
          descricao: backlog.descricao,
          story_points: backlog.story_points,
          prioridade: backlog.prioridade,
          status: backlog.status,
          responsavel: backlog.responsavel,
          tipo_produto: backlog.tipo_produto,
          tipo_tarefa: backlog.tipo_tarefa,
          created_at: backlog.created_at,
          updated_at: backlog.updated_at,
          sprint_tarefa_id: sprintTarefaId,
          sprint_id: sprintId,
          sprint_data_inicio: sprintDataInicio,
          sprint_data_fim: sprintDataFim,
          sprint_status: sprintStatus,
          subtarefas: todasSubtarefas,
          roadmapStatus,
        };
      });

      setItems(itemsCompletos);
    } catch (error) {
      console.error('Erro ao carregar itens do roadmap:', error);
      toast.error('Erro ao carregar itens do roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();

    const channel = supabase
      .channel('backlog-roadmap-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backlog' }, loadItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sprint_tarefas' }, loadItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtarefas' }, loadItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sprint' }, loadItems)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { items, loading, loadItems };
};
