import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GhasPriorityList {
  id: string;
  codigo: number;
  nome: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export const useGhasPriorityLists = () => {
  const queryClient = useQueryClient();

  const { data: priorityLists = [], isLoading } = useQuery({
    queryKey: ["ghas-priority-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ghas_priority_list" as any)
        .select("*")
        .order("codigo", { ascending: true });
      if (error) throw error;
      return (data as unknown) as GhasPriorityList[];
    },
  });

  const createPriorityList = useMutation({
    mutationFn: async (data: { nome: string; descricao?: string }) => {
      const { data: newList, error } = await supabase
        .from("ghas_priority_list" as any)
        .insert({ nome: data.nome, descricao: data.descricao })
        .select()
        .single();
      if (error) throw error;
      return (newList as unknown) as GhasPriorityList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghas-priority-lists"] });
      toast.success("Lista criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar lista: " + error.message);
    },
  });

  const deletePriorityList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ghas_priority_list" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ghas-priority-lists"] });
      toast.success("Lista excluída com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir lista: " + error.message);
    },
  });

  return { priorityLists, isLoading, createPriorityList, deletePriorityList };
};
