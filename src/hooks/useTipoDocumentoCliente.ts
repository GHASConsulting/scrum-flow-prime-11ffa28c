import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TipoDocumentoCliente {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useTipoDocumentoCliente() {
  const queryClient = useQueryClient();

  const { data: tiposDocumentoCliente = [], isLoading } = useQuery({
    queryKey: ['tipo_documento_cliente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipo_documento_cliente')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return data as TipoDocumentoCliente[];
    },
  });

  const activeTipos = tiposDocumentoCliente.filter(t => t.ativo);

  const addTipoDocumentoCliente = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from('tipo_documento_cliente')
        .insert({ nome })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipo_documento_cliente'] });
      toast.success('Tipo de documento do cliente criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar tipo de documento do cliente: ' + error.message);
    },
  });

  const updateTipoDocumentoCliente = useMutation({
    mutationFn: async ({ id, nome, ativo }: { id: string; nome?: string; ativo?: boolean }) => {
      const updateData: { nome?: string; ativo?: boolean } = {};
      if (nome !== undefined) updateData.nome = nome;
      if (ativo !== undefined) updateData.ativo = ativo;
      
      const { data, error } = await supabase
        .from('tipo_documento_cliente')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipo_documento_cliente'] });
      toast.success('Tipo de documento do cliente atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tipo de documento do cliente: ' + error.message);
    },
  });

  const deleteTipoDocumentoCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tipo_documento_cliente')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipo_documento_cliente'] });
      toast.success('Tipo de documento do cliente removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover tipo de documento do cliente: ' + error.message);
    },
  });

  return {
    tiposDocumentoCliente,
    activeTipos,
    isLoading,
    addTipoDocumentoCliente: addTipoDocumentoCliente.mutateAsync,
    updateTipoDocumentoCliente: updateTipoDocumentoCliente.mutateAsync,
    deleteTipoDocumentoCliente: deleteTipoDocumentoCliente.mutateAsync,
  };
}
