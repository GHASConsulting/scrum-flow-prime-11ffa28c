import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AreaDocumento {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useAreaDocumento = () => {
  const queryClient = useQueryClient();

  const { data: areasDocumento = [], isLoading } = useQuery({
    queryKey: ['area_documento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('area_documento')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as AreaDocumento[];
    },
  });

  const addAreaDocumento = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from('area_documento')
        .insert({ nome })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['area_documento'] });
      toast.success('Área de documento adicionada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao adicionar área de documento:', error);
      toast.error('Erro ao adicionar área de documento');
    },
  });

  const updateAreaDocumento = useMutation({
    mutationFn: async ({ id, nome, ativo }: { id: string; nome?: string; ativo?: boolean }) => {
      const updateData: Partial<AreaDocumento> = {};
      if (nome !== undefined) updateData.nome = nome;
      if (ativo !== undefined) updateData.ativo = ativo;

      const { data, error } = await supabase
        .from('area_documento')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['area_documento'] });
      toast.success('Área de documento atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar área de documento:', error);
      toast.error('Erro ao atualizar área de documento');
    },
  });

  const deleteAreaDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('area_documento')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['area_documento'] });
      toast.success('Área de documento removida com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover área de documento:', error);
      toast.error('Erro ao remover área de documento');
    },
  });

  return {
    areasDocumento,
    isLoading,
    addAreaDocumento: addAreaDocumento.mutateAsync,
    updateAreaDocumento: updateAreaDocumento.mutateAsync,
    deleteAreaDocumento: deleteAreaDocumento.mutateAsync,
  };
};
