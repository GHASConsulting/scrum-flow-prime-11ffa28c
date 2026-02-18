import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGhasPriorityLists } from '@/hooks/useGhasPriorityLists';

export default function PrioridadesGHAS() {
  const { priorityLists, createPriorityList, deletePriorityList } = useGhasPriorityLists();
  const [selectedPriorityListId, setSelectedPriorityListId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      toast.error('Nome da lista é obrigatório');
      return;
    }
    try {
      const newList = await createPriorityList.mutateAsync({
        nome: newListName.trim(),
        descricao: newListDesc.trim() || undefined,
      });
      setSelectedPriorityListId(newList.id);
      setIsDialogOpen(false);
      setNewListName('');
      setNewListDesc('');
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    }
  };

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
                        <Label htmlFor="listName">Nome da Lista *</Label>
                        <Input
                          id="listName"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder="Ex: Implantação Laboratório"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="listDesc">Descrição</Label>
                        <Input
                          id="listDesc"
                          value={newListDesc}
                          onChange={(e) => setNewListDesc(e.target.value)}
                          placeholder="Descrição opcional"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createPriorityList.isPending}>
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
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Lista selecionada. Em breve, o cronograma de tarefas estará disponível aqui.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
