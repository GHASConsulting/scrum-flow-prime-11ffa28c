import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProdutividadeGlobal {
  id: string;
  codigo: number;
  cliente_id: string;
  data_inicio: string;
  data_fim: string;
  abertos: number;
  encerrados: number;
  backlog: number;
  abertos_15_dias: number;
  percentual_incidentes: number;
  percentual_solicitacoes: number;
  importado: boolean;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: string;
    codigo: number;
    cliente: string;
  };
}

export function useProdutividadeGlobal() {
  const queryClient = useQueryClient();

  const { data: produtividades = [], isLoading } = useQuery({
    queryKey: ['produtividade_global'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtividade_global')
        .select(`
          *,
          cliente:client_access_records(id, codigo, cliente)
        `)
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      return data as ProdutividadeGlobal[];
    },
  });

  const addProdutividade = useMutation({
    mutationFn: async (prod: {
      cliente_id: string;
      data_inicio: string;
      data_fim: string;
      abertos: number;
      encerrados: number;
      backlog: number;
      abertos_15_dias: number;
      percentual_incidentes: number;
      percentual_solicitacoes: number;
      importado?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('produtividade_global')
        .insert({
          cliente_id: prod.cliente_id,
          data_inicio: prod.data_inicio,
          data_fim: prod.data_fim,
          abertos: prod.abertos,
          encerrados: prod.encerrados,
          backlog: prod.backlog,
          abertos_15_dias: prod.abertos_15_dias,
          percentual_incidentes: prod.percentual_incidentes,
          percentual_solicitacoes: prod.percentual_solicitacoes,
          importado: prod.importado || false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade_global'] });
    },
    onError: (error) => {
      toast.error('Erro ao registrar produtividade: ' + error.message);
    },
  });

  const addMultipleProdutividade = useMutation({
    mutationFn: async (prods: {
      cliente_id: string;
      data_inicio: string;
      data_fim: string;
      abertos: number;
      encerrados: number;
      backlog: number;
      abertos_15_dias: number;
      percentual_incidentes: number;
      percentual_solicitacoes: number;
      importado: boolean;
    }[]) => {
      const { data, error } = await supabase
        .from('produtividade_global')
        .insert(prods)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade_global'] });
    },
    onError: (error) => {
      toast.error('Erro ao importar produtividades: ' + error.message);
    },
  });

  const updateProdutividade = useMutation({
    mutationFn: async (prod: {
      id: string;
      cliente_id: string;
      data_inicio: string;
      data_fim: string;
      abertos: number;
      encerrados: number;
      backlog: number;
      abertos_15_dias: number;
      percentual_incidentes: number;
      percentual_solicitacoes: number;
    }) => {
      const { data, error } = await supabase
        .from('produtividade_global')
        .update({
          cliente_id: prod.cliente_id,
          data_inicio: prod.data_inicio,
          data_fim: prod.data_fim,
          abertos: prod.abertos,
          encerrados: prod.encerrados,
          backlog: prod.backlog,
          abertos_15_dias: prod.abertos_15_dias,
          percentual_incidentes: prod.percentual_incidentes,
          percentual_solicitacoes: prod.percentual_solicitacoes,
        })
        .eq('id', prod.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade_global'] });
      toast.success('Produtividade atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produtividade: ' + error.message);
    },
  });

  const deleteProdutividade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produtividade_global')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade_global'] });
      toast.success('Produtividade removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover produtividade: ' + error.message);
    },
  });

  return {
    produtividades,
    isLoading,
    addProdutividade: addProdutividade.mutateAsync,
    addMultipleProdutividade: addMultipleProdutividade.mutateAsync,
    updateProdutividade: updateProdutividade.mutateAsync,
    deleteProdutividade: deleteProdutividade.mutateAsync,
  };
}
