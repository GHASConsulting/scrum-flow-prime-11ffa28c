import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSubtarefas } from '@/hooks/useSubtarefas';
import { useSprintTarefas } from '@/hooks/useSprintTarefas';

interface SubtarefasEditPanelProps {
  backlogId: string;
  defaultResponsavel?: string;
  selectedSprintId?: string;
}

export const SubtarefasEditPanel = ({ backlogId, defaultResponsavel = '', selectedSprintId }: SubtarefasEditPanelProps) => {
  const { subtarefas, addSubtarefa, updateSubtarefa, deleteSubtarefa } = useSubtarefas();
  const { sprintTarefas, addSprintTarefa } = useSprintTarefas();
  
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAddingToSprint, setIsAddingToSprint] = useState(false);
  const [newSubtarefa, setNewSubtarefa] = useState({
    titulo: '',
    responsavel: defaultResponsavel,
    inicio: undefined as Date | undefined,
    fim: undefined as Date | undefined
  });

  // Encontrar a sprint_tarefa associada a este backlog
  const sprintTarefa = sprintTarefas.find(st => st.backlog_id === backlogId);
  
  // Filtrar subtarefas desta tarefa
  const subtarefasDaTarefa = sprintTarefa 
    ? subtarefas.filter(sub => sub.sprint_tarefa_id === sprintTarefa.id)
    : [];

  const handleAddSubtarefa = async () => {
    if (!newSubtarefa.titulo.trim()) {
      toast.error('O título da subtarefa é obrigatório');
      return;
    }

    if (!newSubtarefa.inicio) {
      toast.error('A data de início é obrigatória');
      return;
    }

    if (!newSubtarefa.fim) {
      toast.error('A data de fim é obrigatória');
      return;
    }

    if (newSubtarefa.fim < newSubtarefa.inicio) {
      toast.error('Data fim deve ser posterior à data início');
      return;
    }

    try {
      setIsAddingToSprint(true);
      
      let targetSprintTarefaId = sprintTarefa?.id;

      // Se a tarefa não está em uma sprint, adicionar à sprint selecionada primeiro
      if (!targetSprintTarefaId) {
        if (!selectedSprintId) {
          toast.error('Selecione uma sprint primeiro no campo "Sprint Selecionada"');
          setIsAddingToSprint(false);
          return;
        }

        // Adicionar tarefa à sprint
        const newSprintTarefa = await addSprintTarefa({
          sprint_id: selectedSprintId,
          backlog_id: backlogId,
          responsavel: defaultResponsavel || null,
          status: 'todo'
        });

        targetSprintTarefaId = newSprintTarefa.id;
        toast.success('Tarefa adicionada à sprint automaticamente');
      }

      const dataInicio = new Date(newSubtarefa.inicio);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(newSubtarefa.fim);
      dataFim.setHours(23, 59, 59, 999);

      await addSubtarefa({
        sprint_tarefa_id: targetSprintTarefaId,
        titulo: newSubtarefa.titulo.trim(),
        responsavel: newSubtarefa.responsavel?.trim() || null,
        inicio: dataInicio.toISOString(),
        fim: dataFim.toISOString(),
        status: 'todo'
      });

      setNewSubtarefa({
        titulo: '',
        responsavel: defaultResponsavel,
        inicio: undefined,
        fim: undefined
      });
      setIsAddingNew(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsAddingToSprint(false);
    }
  };

  const handleToggleStatus = async (subtarefaId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await updateSubtarefa(subtarefaId, { status: newStatus });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteSubtarefa = async (subtarefaId: string) => {
    try {
      await deleteSubtarefa(subtarefaId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const canAddSubtarefas = !!sprintTarefa || !!selectedSprintId;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h4 className="font-semibold">Subtarefas ({subtarefasDaTarefa.length})</h4>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3">
          {subtarefasDaTarefa.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhuma subtarefa cadastrada
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {subtarefasDaTarefa.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    checked={sub.status === 'done'}
                    onCheckedChange={() => handleToggleStatus(sub.id, sub.status)}
                  />
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium text-sm",
                      sub.status === 'done' && "line-through text-muted-foreground"
                    )}>
                      {sub.titulo}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Responsável: {sub.responsavel || 'N/A'}</span>
                      <span>Fim: {format(new Date(sub.fim), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtarefa(sub.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {canAddSubtarefas && !isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Subtarefa
            </Button>
          )}

          {isAddingNew && (
            <div className="space-y-3 p-3 border rounded-lg bg-background">
              <div>
                <Label>Título *</Label>
                <Input
                  value={newSubtarefa.titulo}
                  onChange={(e) => setNewSubtarefa({ ...newSubtarefa, titulo: e.target.value })}
                  placeholder="Título da subtarefa"
                />
              </div>

              <div>
                <Label>Responsável</Label>
                <Input
                  value={newSubtarefa.responsavel}
                  onChange={(e) => setNewSubtarefa({ ...newSubtarefa, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newSubtarefa.inicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSubtarefa.inicio ? format(newSubtarefa.inicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newSubtarefa.inicio}
                        onSelect={(date) => setNewSubtarefa({ ...newSubtarefa, inicio: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Data Fim *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newSubtarefa.fim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSubtarefa.fim ? format(newSubtarefa.fim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newSubtarefa.fim}
                        onSelect={(date) => setNewSubtarefa({ ...newSubtarefa, fim: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddSubtarefa} className="flex-1" disabled={isAddingToSprint}>
                  {isAddingToSprint ? 'Adicionando...' : 'Adicionar'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewSubtarefa({
                      titulo: '',
                      responsavel: defaultResponsavel,
                      inicio: undefined,
                      fim: undefined
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isAddingToSprint}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
