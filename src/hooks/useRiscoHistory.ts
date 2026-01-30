import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RiscoHistoryEntry {
  id: string;
  risco_id: string;
  descricao: string;
  usuario: string;
  created_at: string;
}

export const useRiscoHistory = (riscoId: string | null) => {
  const [history, setHistory] = useState<RiscoHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!riscoId) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('risco_history')
        .select('*')
        .eq('risco_id', riscoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async (descricao: string, usuario: string) => {
    if (!riscoId) return;

    try {
      const { data, error } = await supabase
        .from('risco_history')
        .insert({
          risco_id: riscoId,
          descricao,
          usuario
        })
        .select()
        .single();

      if (error) throw error;
      
      setHistory(prev => [data, ...prev]);
      toast.success('Histórico registrado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
      toast.error('Erro ao registrar histórico');
      throw error;
    }
  };

  const deleteHistoryEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('risco_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success('Registro excluído');
    } catch (error) {
      console.error('Erro ao excluir histórico:', error);
      toast.error('Erro ao excluir histórico');
    }
  };

  useEffect(() => {
    loadHistory();
  }, [riscoId]);

  return { history, loading, loadHistory, addHistoryEntry, deleteHistoryEntry };
};
