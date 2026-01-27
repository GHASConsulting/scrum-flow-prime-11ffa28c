import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentoCliente {
  id: string;
  codigo: number;
  cliente_id: string;
  tipo_documento_cliente_id: string | null;
  arquivo_path: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_publicacao: string;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: string;
    codigo: number;
    cliente: string;
  };
  tipo_documento_cliente?: {
    id: string;
    nome: string;
  };
}

export function useDocumentoCliente(clienteId?: string) {
  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documento_cliente', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('documento_cliente')
        .select(`
          *,
          cliente:client_access_records(id, codigo, cliente),
          tipo_documento_cliente(id, nome)
        `)
        .order('data_publicacao', { ascending: false });
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as DocumentoCliente[];
    },
    enabled: !!clienteId || clienteId === undefined,
  });

  const uploadFile = async (file: File, clienteId: string): Promise<{ path: string; nome: string; tipo: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clienteId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documentos-cliente')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    return {
      path: fileName,
      nome: file.name,
      tipo: fileExt?.toUpperCase() || 'UNKNOWN',
    };
  };

  const addDocumento = useMutation({
    mutationFn: async (doc: {
      cliente_id: string;
      tipo_documento_cliente_id: string;
      file: File;
      data_publicacao: string;
    }) => {
      // Upload file first
      const fileInfo = await uploadFile(doc.file, doc.cliente_id);
      
      // Then insert record
      const { data, error } = await supabase
        .from('documento_cliente')
        .insert({
          cliente_id: doc.cliente_id,
          tipo_documento_cliente_id: doc.tipo_documento_cliente_id,
          arquivo_path: fileInfo.path,
          arquivo_nome: fileInfo.nome,
          arquivo_tipo: fileInfo.tipo,
          data_publicacao: doc.data_publicacao,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documento_cliente'] });
      toast.success('Documento adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar documento: ' + error.message);
    },
  });

  const deleteDocumento = useMutation({
    mutationFn: async (doc: { id: string; arquivo_path: string }) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documentos-cliente')
        .remove([doc.arquivo_path]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
      
      // Delete record
      const { error } = await supabase
        .from('documento_cliente')
        .delete()
        .eq('id', doc.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documento_cliente'] });
      toast.success('Documento removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover documento: ' + error.message);
    },
  });

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage
      .from('documentos-cliente')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    documentos,
    isLoading,
    addDocumento: addDocumento.mutateAsync,
    deleteDocumento: deleteDocumento.mutateAsync,
    getFileUrl,
  };
}
