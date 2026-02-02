import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TreinamentoParticipante {
  id: string;
  treinamento_id: string;
  prestador_id: string;
  capacitado: boolean;
  created_at: string;
  updated_at: string;
  prestador?: { id: string; nome: string; nivel: string | null };
}

export interface Treinamento {
  id: string;
  codigo: number;
  nome: string;
  data_treinamento: string;
  ministrado_por_id: string | null;
  descricao: string | null;
  arquivo_path: string | null;
  arquivo_nome: string | null;
  arquivo_tipo: string | null;
  documento_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  ministrado_por?: { id: string; nome: string } | null;
  documento?: { id: string; nome: string; codigo: number } | null;
  participantes?: TreinamentoParticipante[];
}

export interface TreinamentoInsert {
  nome: string;
  data_treinamento?: string;
  ministrado_por_id?: string | null;
  descricao?: string | null;
  arquivo_path?: string | null;
  arquivo_nome?: string | null;
  arquivo_tipo?: string | null;
  documento_id?: string | null;
  status?: string;
}

export interface TreinamentoUpdate {
  id: string;
  nome?: string;
  data_treinamento?: string;
  ministrado_por_id?: string | null;
  descricao?: string | null;
  arquivo_path?: string | null;
  arquivo_nome?: string | null;
  arquivo_tipo?: string | null;
  documento_id?: string | null;
  status?: string;
}

export interface ParticipanteInput {
  prestador_id: string;
  capacitado: boolean;
}

export const useTreinamentos = () => {
  const queryClient = useQueryClient();

  const { data: treinamentos = [], isLoading } = useQuery({
    queryKey: ['treinamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treinamento')
        .select(`
          *,
          ministrado_por:pessoa!treinamento_ministrado_por_id_fkey(id, nome),
          documento:documento_id(id, nome, codigo)
        `)
        .order('data_treinamento', { ascending: false });
      
      if (error) throw error;
      return data as Treinamento[];
    },
  });

  const fetchParticipantes = async (treinamentoId: string): Promise<TreinamentoParticipante[]> => {
    const { data, error } = await supabase
      .from('treinamento_participante')
      .select(`
        *,
        prestador:prestador_id(id, nome, nivel)
      `)
      .eq('treinamento_id', treinamentoId);
    
    if (error) throw error;
    return data as TreinamentoParticipante[];
  };

  const uploadFile = async (file: File): Promise<{ path: string; name: string; type: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `treinamentos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return {
      path: filePath,
      name: file.name,
      type: file.type,
    };
  };

  const deleteFile = async (path: string) => {
    const { error } = await supabase.storage
      .from('documentos')
      .remove([path]);
    
    if (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  };

  const getFileUrl = (path: string): string => {
    const { data } = supabase.storage
      .from('documentos')
      .getPublicUrl(path);
    
    return data.publicUrl;
  };

  const addTreinamento = useMutation({
    mutationFn: async ({ treinamento, participantes }: { treinamento: TreinamentoInsert; participantes: ParticipanteInput[] }) => {
      // Insert treinamento
      const { data, error } = await supabase
        .from('treinamento')
        .insert(treinamento)
        .select()
        .single();
      
      if (error) throw error;

      // Insert participantes if any
      if (participantes.length > 0) {
        const participantesData = participantes.map(p => ({
          treinamento_id: data.id,
          prestador_id: p.prestador_id,
          capacitado: p.capacitado,
        }));

        const { error: partError } = await supabase
          .from('treinamento_participante')
          .insert(participantesData);
        
        if (partError) throw partError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinamentos'] });
      toast.success('Treinamento adicionado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao adicionar treinamento:', error);
      toast.error('Erro ao adicionar treinamento');
    },
  });

  const updateTreinamento = useMutation({
    mutationFn: async ({ treinamento, participantes }: { treinamento: TreinamentoUpdate; participantes: ParticipanteInput[] }) => {
      const { id, ...updateData } = treinamento;
      
      // Update treinamento
      const { data, error } = await supabase
        .from('treinamento')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Delete existing participantes
      const { error: deleteError } = await supabase
        .from('treinamento_participante')
        .delete()
        .eq('treinamento_id', id);
      
      if (deleteError) throw deleteError;

      // Insert new participantes if any
      if (participantes.length > 0) {
        const participantesData = participantes.map(p => ({
          treinamento_id: id,
          prestador_id: p.prestador_id,
          capacitado: p.capacitado,
        }));

        const { error: partError } = await supabase
          .from('treinamento_participante')
          .insert(participantesData);
        
        if (partError) throw partError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinamentos'] });
      toast.success('Treinamento atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar treinamento:', error);
      toast.error('Erro ao atualizar treinamento');
    },
  });

  const deleteTreinamento = useMutation({
    mutationFn: async ({ id, arquivoPath }: { id: string; arquivoPath?: string | null }) => {
      // Delete from database first (cascade will delete participantes)
      const { error } = await supabase
        .from('treinamento')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Then try to delete the file if exists
      if (arquivoPath) {
        await deleteFile(arquivoPath);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinamentos'] });
      toast.success('Treinamento removido com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover treinamento:', error);
      toast.error('Erro ao remover treinamento');
    },
  });

  return {
    treinamentos,
    isLoading,
    fetchParticipantes,
    uploadFile,
    deleteFile,
    getFileUrl,
    addTreinamento: addTreinamento.mutateAsync,
    updateTreinamento: updateTreinamento.mutateAsync,
    deleteTreinamento: deleteTreinamento.mutateAsync,
    isAdding: addTreinamento.isPending,
    isUpdating: updateTreinamento.isPending,
    isDeleting: deleteTreinamento.isPending,
  };
};
