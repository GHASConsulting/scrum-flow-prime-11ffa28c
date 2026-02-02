import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Pessoa {
  id: string;
  codigo: number;
  nome: string;
  email: string | null;
  nivel: string | null;
  setor_id: string | null;
  user_id: string | null;
  deve_alterar_senha: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  setor?: { id: string; nome: string } | null;
}

export const NIVEL_OPTIONS = ['N1', 'N2', 'Especialidade'] as const;
export type NivelType = typeof NIVEL_OPTIONS[number];

export function usePessoa() {
  const queryClient = useQueryClient();

  const { data: pessoas = [], isLoading } = useQuery({
    queryKey: ['pessoa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoa')
        .select(`
          *,
          setor:setor_id(id, nome)
        `)
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return data as Pessoa[];
    },
  });

  const addPessoa = useMutation({
    mutationFn: async (pessoa: { 
      nome: string; 
      email?: string; 
      nivel?: string; 
      setor_id?: string;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('pessoa')
        .insert({ 
          nome: pessoa.nome, 
          email: pessoa.email || null,
          nivel: pessoa.nivel || 'N1',
          setor_id: pessoa.setor_id || null,
          ativo: pessoa.ativo ?? true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa'] });
      toast.success('Pessoa adicionada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar pessoa: ' + error.message);
    },
  });

  const updatePessoa = useMutation({
    mutationFn: async (pessoa: { 
      id: string; 
      nome: string; 
      email?: string; 
      nivel?: string; 
      setor_id?: string | null;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('pessoa')
        .update({ 
          nome: pessoa.nome, 
          email: pessoa.email || null,
          nivel: pessoa.nivel || 'N1',
          setor_id: pessoa.setor_id || null,
          ativo: pessoa.ativo ?? true
        })
        .eq('id', pessoa.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa'] });
      toast.success('Pessoa atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pessoa: ' + error.message);
    },
  });

  const deletePessoa = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se a pessoa tem user_id (é um usuário do sistema)
      const { data: pessoa } = await supabase
        .from('pessoa')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (pessoa?.user_id) {
        throw new Error('Não é possível excluir uma pessoa vinculada a um usuário do sistema');
      }

      const { error } = await supabase
        .from('pessoa')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa'] });
      toast.success('Pessoa removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover pessoa: ' + error.message);
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('pessoa')
        .update({ ativo })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  // Retorna apenas pessoas ativas (para uso em selects)
  const pessoasAtivas = pessoas.filter(p => p.ativo);

  return {
    pessoas,
    pessoasAtivas,
    isLoading,
    addPessoa: addPessoa.mutateAsync,
    updatePessoa: updatePessoa.mutateAsync,
    deletePessoa: deletePessoa.mutateAsync,
    toggleAtivo: toggleAtivo.mutateAsync,
    isAdding: addPessoa.isPending,
    isUpdating: updatePessoa.isPending,
    isDeleting: deletePessoa.isPending,
  };
}
