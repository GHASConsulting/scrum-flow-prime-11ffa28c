import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateFile {
  id: string;
  nome: string;
  tipo: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export function useTemplateFiles() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['template_files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TemplateFile[];
    },
  });

  const getTemplateByTipo = (tipo: string) => {
    return templates.find(t => t.tipo === tipo);
  };

  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('templates')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const downloadTemplate = async (tipo: string, fileName: string) => {
    // First try to get from database/storage
    const template = getTemplateByTipo(tipo);
    
    if (template) {
      const publicUrl = getPublicUrl(template.storage_path);
      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback to static file
      const link = document.createElement('a');
      link.href = '/templates/GHAS_-_Arquivo_Modelo_de_Importacao.xlsx';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    templates,
    isLoading,
    getTemplateByTipo,
    getPublicUrl,
    downloadTemplate,
  };
}
