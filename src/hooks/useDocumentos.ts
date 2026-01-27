import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Documento {
  id: string;
  codigo: number;
  nome: string;
  tipo_documento_id: string | null;
  area_documento_id: string | null;
  versao: string | null;
  descricao: string | null;
  arquivo_path: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_publicacao: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
  tipo_documento?: { id: string; nome: string } | null;
  area_documento?: { id: string; nome: string } | null;
}

export interface DocumentoInsert {
  nome: string;
  tipo_documento_id?: string | null;
  area_documento_id?: string | null;
  versao?: string | null;
  descricao?: string | null;
  arquivo_path: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_publicacao?: string;
  status?: 'ativo' | 'inativo';
}

export interface DocumentoUpdate {
  id: string;
  nome?: string;
  tipo_documento_id?: string | null;
  area_documento_id?: string | null;
  versao?: string | null;
  descricao?: string | null;
  arquivo_path?: string;
  arquivo_nome?: string;
  arquivo_tipo?: string;
  data_publicacao?: string;
  status?: 'ativo' | 'inativo';
}

export const useDocumentos = () => {
  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documento')
        .select(`
          *,
          tipo_documento:tipo_documento_id(id, nome),
          area_documento:area_documento_id(id, nome)
        `)
        .order('data_publicacao', { ascending: false });
      
      if (error) throw error;
      return data as Documento[];
    },
  });

  const uploadFile = async (file: File): Promise<{ path: string; name: string; type: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

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

  const addDocumento = useMutation({
    mutationFn: async (documento: DocumentoInsert) => {
      const { data, error } = await supabase
        .from('documento')
        .insert(documento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast.success('Documento adicionado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao adicionar documento:', error);
      toast.error('Erro ao adicionar documento');
    },
  });

  const updateDocumento = useMutation({
    mutationFn: async ({ id, ...updateData }: DocumentoUpdate) => {
      const { data, error } = await supabase
        .from('documento')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast.success('Documento atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao atualizar documento:', error);
      toast.error('Erro ao atualizar documento');
    },
  });

  const deleteDocumento = useMutation({
    mutationFn: async ({ id, arquivoPath }: { id: string; arquivoPath: string }) => {
      // Delete from database first
      const { error } = await supabase
        .from('documento')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Then try to delete the file
      await deleteFile(arquivoPath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast.success('Documento removido com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao remover documento:', error);
      toast.error('Erro ao remover documento');
    },
  });

  return {
    documentos,
    isLoading,
    uploadFile,
    deleteFile,
    getFileUrl,
    addDocumento: addDocumento.mutateAsync,
    updateDocumento: updateDocumento.mutateAsync,
    deleteDocumento: deleteDocumento.mutateAsync,
    isAdding: addDocumento.isPending,
    isUpdating: updateDocumento.isPending,
    isDeleting: deleteDocumento.isPending,
  };
};
