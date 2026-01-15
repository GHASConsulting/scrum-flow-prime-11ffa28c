import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Produtividade {
  id: string;
  codigo: number;
  prestador_id: string;
  cliente_id: string;
  data_inicio: string;
  data_fim: string;
  horas_trabalhadas: number;
  descricao: string | null;
  importado: boolean;
  created_at: string;
  updated_at: string;
  prestador?: {
    id: string;
    codigo: number;
    nome: string;
  };
  cliente?: {
    id: string;
    codigo: number;
    cliente: string;
  };
}

export function useProdutividade() {
  const queryClient = useQueryClient();

  const { data: produtividades = [], isLoading } = useQuery({
    queryKey: ['produtividade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtividade')
        .select(`
          *,
          prestador:prestador_servico(id, codigo, nome),
          cliente:client_access_records(id, codigo, cliente)
        `)
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      return data as Produtividade[];
    },
  });

  const addProdutividade = useMutation({
    mutationFn: async (prod: {
      prestador_id: string;
      cliente_id: string;
      data_inicio: string;
      data_fim: string;
      horas_trabalhadas: number;
      descricao?: string;
      importado?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('produtividade')
        .insert({
          prestador_id: prod.prestador_id,
          cliente_id: prod.cliente_id,
          data_inicio: prod.data_inicio,
          data_fim: prod.data_fim,
          horas_trabalhadas: prod.horas_trabalhadas,
          descricao: prod.descricao || null,
          importado: prod.importado || false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade'] });
    },
    onError: (error) => {
      toast.error('Erro ao registrar produtividade: ' + error.message);
    },
  });

  const addMultipleProdutividade = useMutation({
    mutationFn: async (prods: {
      prestador_id: string;
      cliente_id: string;
      data_inicio: string;
      data_fim: string;
      horas_trabalhadas: number;
      importado: boolean;
    }[]) => {
      const { data, error } = await supabase
        .from('produtividade')
        .insert(prods)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade'] });
    },
    onError: (error) => {
      toast.error('Erro ao importar produtividades: ' + error.message);
    },
  });

  const updateProdutividade = useMutation({
    mutationFn: async (prod: {
      id: string;
      prestador_id: string;
      cliente_id: string;
      data_inicio: string;
      data_fim: string;
      horas_trabalhadas: number;
      descricao?: string;
    }) => {
      const { data, error } = await supabase
        .from('produtividade')
        .update({
          prestador_id: prod.prestador_id,
          cliente_id: prod.cliente_id,
          data_inicio: prod.data_inicio,
          data_fim: prod.data_fim,
          horas_trabalhadas: prod.horas_trabalhadas,
          descricao: prod.descricao || null,
        })
        .eq('id', prod.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade'] });
      toast.success('Produtividade atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produtividade: ' + error.message);
    },
  });

  const deleteProdutividade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produtividade')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtividade'] });
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
