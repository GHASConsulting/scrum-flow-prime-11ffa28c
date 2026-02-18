import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CronogramaTreeGrid } from '@/components/prioridades/CronogramaTreeGrid';
import { GanttChart } from '@/components/prioridades/GanttChart';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Busca todas as listas de prioridades sem filtro de cliente
function useAllPriorityLists() {
  const queryClient = useQueryClient();

  const { data: priorityLists = [], isLoading } = useQuery({
    queryKey: ['ghas-priority-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('priority_list')
        .select('*')
        .order('codigo', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const deletePriorityList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('priority_list').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghas-priority-lists'] });
      toast.success('Lista excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir lista: ' + error.message);
    },
  });

  return { priorityLists, isLoading, deletePriorityList };
}

export default function PrioridadesGHAS() {
  const { priorityLists, deletePriorityList } = useAllPriorityLists();
  const [selectedPriorityListId, setSelectedPriorityListId] = useState<string | null>(null);

  const handleDeleteList = async (listId: string) => {
    if (confirm('Tem certeza que deseja excluir esta lista de prioridades? Todas as tarefas serão excluídas.')) {
      await deletePriorityList.mutateAsync(listId);
      if (selectedPriorityListId === listId) setSelectedPriorityListId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Prioridades GHAS</h1>
          <p className="text-muted-foreground">Gerencie listas de prioridades e cronogramas internos</p>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Lista de Prioridades</Label>
              <div className="flex gap-2">
                <Select value={selectedPriorityListId || ''} onValueChange={setSelectedPriorityListId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione uma lista" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {String(list.codigo).padStart(2, '0')} - {list.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPriorityListId && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteList(selectedPriorityListId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {!selectedPriorityListId ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {priorityLists.length === 0
                ? 'Nenhuma lista de prioridades encontrada. Crie uma nova lista para começar.'
                : 'Selecione uma lista de prioridades para visualizar o cronograma'}
            </p>
          </Card>
        ) : (
          <Tabs defaultValue="tabela" className="w-full">
            <TabsList>
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
              <TabsTrigger value="gantt">Gantt</TabsTrigger>
            </TabsList>
            <TabsContent value="tabela">
              <CronogramaTreeGrid priorityListId={selectedPriorityListId} />
            </TabsContent>
            <TabsContent value="gantt">
              <GanttChart priorityListId={selectedPriorityListId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
