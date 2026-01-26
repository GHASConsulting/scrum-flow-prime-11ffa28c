import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TipoDocumento {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useTipoDocumento = () => {
  const queryClient = useQueryClient();

  const { data: tiposDocumento = [], isLoading } = useQuery({
    queryKey: ['tipo_documento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipo_documento')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as TipoDocumento[];
    },
  });

  const addTipoDocumento = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from('tipo_documento')
        .insert({ nome })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipo_documento'] });
      toast.success('Tipo de documento adicionado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao adicionar tipo de documento:', error);
      toast.error('Erro ao adicionar tipo de documento');
    },
  });

  const updateTipoDocumento = useMutation({
    mutationFn: async ({ id, nome, ativo }: { id: string; nome?: string; ativo?: boolean }) => {
      const updateData: Partial<TipoDocumento> = {};
      if (nome !== undefined) updateData.nome = nome;
      if (ativo !== undefined) updateData.ativo = ativo;

      const { data, error } = await supabase
        .from('tipo_documento')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipo_documento'] });
      toast.success('Tipo de documento atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar tipo de documento:', error);
      toast.error('Erro ao atualizar tipo de documento');
    },
  });

  const deleteTipoDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tipo_documento')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipo_documento'] });
      toast.success('Tipo de documento removido com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover tipo de documento:', error);
      toast.error('Erro ao remover tipo de documento');
    },
  });

  return {
    tiposDocumento,
    isLoading,
    addTipoDocumento: addTipoDocumento.mutateAsync,
    updateTipoDocumento: updateTipoDocumento.mutateAsync,
    deleteTipoDocumento: deleteTipoDocumento.mutateAsync,
  };
};
