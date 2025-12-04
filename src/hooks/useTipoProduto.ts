import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TipoProduto {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useTipoProduto = () => {
  const queryClient = useQueryClient();

  const { data: tiposProduto = [], isLoading } = useQuery({
    queryKey: ['tipos-produto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipo_produto')
        .select('*')
        .order('nome');

      if (error) {
        toast.error('Erro ao carregar tipos de produto');
        throw error;
      }

      return data as TipoProduto[];
    }
  });

  const addTipoProduto = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from('tipo_produto')
        .insert({ nome })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um tipo de produto com este nome');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto adicionado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao adicionar tipo de produto');
    }
  });

  const updateTipoProduto = useMutation({
    mutationFn: async ({ id, nome, ativo }: { id: string; nome?: string; ativo?: boolean }) => {
      const updates: Partial<TipoProduto> = {};
      if (nome !== undefined) updates.nome = nome;
      if (ativo !== undefined) updates.ativo = ativo;

      const { data, error } = await supabase
        .from('tipo_produto')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um tipo de produto com este nome');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto atualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar tipo de produto');
    }
  });

  const deleteTipoProduto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tipo_produto')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto removido');
    },
    onError: () => {
      toast.error('Erro ao remover tipo de produto');
    }
  });

  return {
    tiposProduto,
    tiposProdutoAtivos: tiposProduto.filter(tp => tp.ativo),
    isLoading,
    addTipoProduto: addTipoProduto.mutateAsync,
    updateTipoProduto: updateTipoProduto.mutateAsync,
    deleteTipoProduto: deleteTipoProduto.mutateAsync
  };
};
