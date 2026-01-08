import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TipoTarefa {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useTipoTarefa = () => {
  const [tiposTarefa, setTiposTarefa] = useState<TipoTarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTiposTarefa = async () => {
    try {
      const { data, error } = await supabase
        .from('tipo_tarefa')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTiposTarefa(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de tarefa:', error);
      toast.error('Erro ao carregar tipos de tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  const addTipoTarefa = async (nome: string) => {
    try {
      const { data, error } = await supabase
        .from('tipo_tarefa')
        .insert([{ nome, ativo: true }])
        .select()
        .single();

      if (error) throw error;
      
      setTiposTarefa(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast.success('Tipo cadastrado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar tipo de tarefa:', error);
      toast.error('Erro ao criar tipo de tarefa');
      throw error;
    }
  };

  const updateTipoTarefa = async (updates: { id: string; nome?: string; ativo?: boolean }) => {
    try {
      const { data, error } = await supabase
        .from('tipo_tarefa')
        .update({ 
          ...(updates.nome !== undefined && { nome: updates.nome }),
          ...(updates.ativo !== undefined && { ativo: updates.ativo }),
          updated_at: new Date().toISOString()
        })
        .eq('id', updates.id)
        .select()
        .single();

      if (error) throw error;
      
      setTiposTarefa(prev => 
        prev.map(t => t.id === updates.id ? data : t).sort((a, b) => a.nome.localeCompare(b.nome))
      );
      toast.success('Tipo atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de tarefa:', error);
      toast.error('Erro ao atualizar tipo de tarefa');
      throw error;
    }
  };

  const deleteTipoTarefa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tipo_tarefa')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTiposTarefa(prev => prev.filter(t => t.id !== id));
      toast.success('Tipo removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover tipo de tarefa:', error);
      toast.error('Erro ao remover tipo de tarefa');
      throw error;
    }
  };

  useEffect(() => {
    fetchTiposTarefa();
  }, []);

  const tiposTarefaAtivos = tiposTarefa.filter(t => t.ativo);

  return {
    tiposTarefa,
    tiposTarefaAtivos,
    isLoading,
    addTipoTarefa,
    updateTipoTarefa,
    deleteTipoTarefa,
    refetch: fetchTiposTarefa
  };
};
