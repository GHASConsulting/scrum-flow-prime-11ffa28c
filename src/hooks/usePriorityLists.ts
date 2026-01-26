import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PriorityList {
  id: string;
  project_id: string;
  codigo: number;
  nome: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export const usePriorityLists = (projectId: string | null) => {
  const queryClient = useQueryClient();

  const { data: priorityLists = [], isLoading } = useQuery({
    queryKey: ["priority-lists", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("priority_list")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PriorityList[];
    },
    enabled: !!projectId,
  });

  const createPriorityList = useMutation({
    mutationFn: async (data: { project_id: string; nome: string; descricao?: string }) => {
      const { data: newList, error } = await supabase
        .from("priority_list")
        .insert({ project_id: data.project_id, nome: data.nome, descricao: data.descricao } as any)
        .select()
        .single();

      if (error) throw error;
      return newList as PriorityList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priority-lists", projectId] });
      toast.success("Lista de Prioridades criada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao criar lista: " + error.message);
    },
  });

  const updatePriorityList = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; nome?: string; descricao?: string }) => {
      const { data: updated, error } = await supabase
        .from("priority_list")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as PriorityList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priority-lists", projectId] });
      toast.success("Lista atualizada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar lista: " + error.message);
    },
  });

  const deletePriorityList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("priority_list")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priority-lists", projectId] });
      toast.success("Lista excluída com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao excluir lista: " + error.message);
    },
  });

  return {
    priorityLists,
    isLoading,
    createPriorityList,
    updatePriorityList,
    deletePriorityList,
  };
};
