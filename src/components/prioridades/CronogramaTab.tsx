import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CronogramaTreeGrid } from './CronogramaTreeGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart } from './GanttChart';
import { Plus, Trash2 } from 'lucide-react';
import { usePriorityLists } from '@/hooks/usePriorityLists';
import type { ClientAccessRecord } from '@/hooks/useClientAccessRecords';
import { toast } from 'sonner';

interface CronogramaTabProps {
  projectId: string | null;
  clientes: ClientAccessRecord[];
  onSelectProject: (id: string) => void;
}

export function CronogramaTab({ projectId, clientes, onSelectProject }: CronogramaTabProps) {
  const { priorityLists, createPriorityList, deletePriorityList } = usePriorityLists(projectId);
  const [selectedPriorityListId, setSelectedPriorityListId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Selecione um projeto primeiro');
      return;
    }
    if (!newListName.trim()) {
      toast.error('Nome da lista é obrigatório');
      return;
    }
    try {
      const newList = await createPriorityList.mutateAsync({
        project_id: projectId,
        nome: newListName.trim(),
      });
      setSelectedPriorityListId(newList.id);
      setIsDialogOpen(false);
      setNewListName('');
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Tem certeza que deseja excluir esta lista de prioridades? Todas as tarefas serão excluídas.')) {
      await deletePriorityList.mutateAsync(listId);
      if (selectedPriorityListId === listId) {
        setSelectedPriorityListId(null);
      }
    }
  };

  const selectedProject = clientes.find(c => c.id === projectId);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Projeto</Label>
            <Select value={projectId || ''} onValueChange={onSelectProject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projectId && (
            <>
              <div className="space-y-2">
                <Label>Lista de Prioridades</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedPriorityListId || ''} 
                    onValueChange={setSelectedPriorityListId}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Selecione uma lista" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Lista de Prioridades</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateList} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Projeto</Label>
                          <Input value={selectedProject?.cliente || ''} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="listName">Nome da Lista</Label>
                          <Input
                            id="listName"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Ex: Implantação Laboratório"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Criar Lista
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

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
            </>
          )}
        </div>
      </Card>

      {!projectId ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Selecione um projeto para visualizar as listas de prioridades</p>
        </Card>
      ) : !selectedPriorityListId ? (
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
  );
}
