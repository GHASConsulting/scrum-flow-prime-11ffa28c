import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PrestadorServico {
  id: string;
  codigo: number;
  nome: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export function usePrestadorServico() {
  const queryClient = useQueryClient();

  const { data: prestadoresServico = [], isLoading } = useQuery({
    queryKey: ['prestador-servico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prestador_servico')
        .select('*')
        .order('codigo', { ascending: true });
      
      if (error) throw error;
      return data as PrestadorServico[];
    },
  });

  const addPrestadorServico = useMutation({
    mutationFn: async (prestador: { nome: string; email?: string }) => {
      const { data, error } = await supabase
        .from('prestador_servico')
        .insert({ nome: prestador.nome, email: prestador.email || null })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestador-servico'] });
      toast.success('Prestador de serviço adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar prestador de serviço: ' + error.message);
    },
  });

  const updatePrestadorServico = useMutation({
    mutationFn: async (prestador: { id: string; nome: string; email?: string }) => {
      const { data, error } = await supabase
        .from('prestador_servico')
        .update({ nome: prestador.nome, email: prestador.email || null })
        .eq('id', prestador.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestador-servico'] });
      toast.success('Prestador de serviço atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar prestador de serviço: ' + error.message);
    },
  });

  const deletePrestadorServico = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prestador_servico')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestador-servico'] });
      toast.success('Prestador de serviço removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover prestador de serviço: ' + error.message);
    },
  });

  return {
    prestadoresServico,
    isLoading,
    addPrestadorServico: addPrestadorServico.mutateAsync,
    updatePrestadorServico: updatePrestadorServico.mutateAsync,
    deletePrestadorServico: deletePrestadorServico.mutateAsync,
  };
}
