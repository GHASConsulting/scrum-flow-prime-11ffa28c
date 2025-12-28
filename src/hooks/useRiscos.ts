import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Risco = {
  id: string;
  projeto: string;
  area_impactada: string;
  tipo_risco_ghas: string;
  tipo_risco_cliente: string;
  descricao: string;
  probabilidade: string;
  impacto: string;
  nivel_risco: string;
  origem_risco: string;
  responsavel: string | null;
  plano_mitigacao: string | null;
  status_risco: string;
  data_identificacao: string;
  data_limite_acao: string | null;
  updated_at: string;
  comentario_acompanhamento: string | null;
  historico: string | null;
  risco_ocorreu: boolean | null;
  impacto_real_ocorrido: string | null;
  licao_aprendida: string | null;
  created_at: string;
};

export type RiscoInsert = Omit<Risco, 'id' | 'created_at' | 'updated_at' | 'nivel_risco'>;

export const useRiscos = () => {
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRiscos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('risco')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRiscos(data || []);
    } catch (error) {
      console.error('Erro ao carregar riscos:', error);
      toast.error('Erro ao carregar riscos');
    } finally {
      setLoading(false);
    }
  };

  const addRisco = async (risco: RiscoInsert) => {
    try {
      const { data, error } = await supabase
        .from('risco')
        .insert([risco])
        .select()
        .single();

      if (error) throw error;
      setRiscos(prev => [data, ...prev]);
      toast.success('Risco registrado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao registrar risco:', error);
      toast.error('Erro ao registrar risco');
      throw error;
    }
  };

  const updateRisco = async (id: string, updates: Partial<Risco>) => {
    try {
      // Remove nivel_risco from updates as it's a generated column
      const { nivel_risco, ...safeUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('risco')
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRiscos(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Risco atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar risco:', error);
      toast.error('Erro ao atualizar risco');
      throw error;
    }
  };

  const deleteRisco = async (id: string) => {
    try {
      const { error } = await supabase
        .from('risco')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRiscos(prev => prev.filter(r => r.id !== id));
      toast.success('Risco excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir risco:', error);
      toast.error('Erro ao excluir risco');
      throw error;
    }
  };

  useEffect(() => {
    loadRiscos();

    const channel = supabase
      .channel('risco-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risco' }, () => {
        loadRiscos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { riscos, loading, addRisco, updateRisco, deleteRisco, loadRiscos };
};
