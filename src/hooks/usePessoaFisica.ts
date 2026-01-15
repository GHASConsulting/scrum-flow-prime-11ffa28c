import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PessoaFisica {
  id: string;
  codigo: number;
  nome: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export function usePessoaFisica() {
  const queryClient = useQueryClient();

  const { data: pessoasFisicas = [], isLoading } = useQuery({
    queryKey: ['pessoa-fisica'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoa_fisica')
        .select('*')
        .order('codigo', { ascending: true });
      
      if (error) throw error;
      return data as PessoaFisica[];
    },
  });

  const addPessoaFisica = useMutation({
    mutationFn: async (pessoa: { nome: string; email?: string }) => {
      const { data, error } = await supabase
        .from('pessoa_fisica')
        .insert({ nome: pessoa.nome, email: pessoa.email || null })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa-fisica'] });
      toast.success('Pessoa física adicionada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar pessoa física: ' + error.message);
    },
  });

  const updatePessoaFisica = useMutation({
    mutationFn: async (pessoa: { id: string; nome: string; email?: string }) => {
      const { data, error } = await supabase
        .from('pessoa_fisica')
        .update({ nome: pessoa.nome, email: pessoa.email || null })
        .eq('id', pessoa.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa-fisica'] });
      toast.success('Pessoa física atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pessoa física: ' + error.message);
    },
  });

  const deletePessoaFisica = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pessoa_fisica')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa-fisica'] });
      toast.success('Pessoa física removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover pessoa física: ' + error.message);
    },
  });

  return {
    pessoasFisicas,
    isLoading,
    addPessoaFisica: addPessoaFisica.mutateAsync,
    updatePessoaFisica: updatePessoaFisica.mutateAsync,
    deletePessoaFisica: deletePessoaFisica.mutateAsync,
  };
}
