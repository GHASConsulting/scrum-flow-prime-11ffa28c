import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SubtarefaTemp {
  id: string;
  titulo: string;
  responsavel: string;
  inicio: Date | undefined;
  fim: Date | undefined;
}

interface SubtarefasFormProps {
  subtarefas: SubtarefaTemp[];
  onSubtarefasChange: (subtarefas: SubtarefaTemp[]) => void;
  defaultResponsavel?: string;
}

export const SubtarefasForm = ({ subtarefas, onSubtarefasChange, defaultResponsavel = '' }: SubtarefasFormProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSubtarefa, setNewSubtarefa] = useState<SubtarefaTemp>({
    id: '',
    titulo: '',
    responsavel: defaultResponsavel,
    inicio: undefined,
    fim: undefined
  });

  const handleAddSubtarefa = () => {
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

    const novaSubtarefa: SubtarefaTemp = {
      ...newSubtarefa,
      id: crypto.randomUUID()
    };

    onSubtarefasChange([...subtarefas, novaSubtarefa]);
    setNewSubtarefa({
      id: '',
      titulo: '',
      responsavel: defaultResponsavel,
      inicio: undefined,
      fim: undefined
    });
    setIsAddingNew(false);
    toast.success('Subtarefa adicionada');
  };

  const handleRemoveSubtarefa = (id: string) => {
    onSubtarefasChange(subtarefas.filter(s => s.id !== id));
    toast.success('Subtarefa removida');
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h4 className="font-semibold">Subtarefas ({subtarefas.length})</h4>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3">
          {subtarefas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhuma subtarefa cadastrada
            </p>
          ) : (
            <div className="space-y-2">
              {subtarefas.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{sub.titulo}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Responsável: {sub.responsavel || 'N/A'}</span>
                      {sub.inicio && <span>Início: {format(sub.inicio, 'dd/MM/yyyy', { locale: ptBR })}</span>}
                      {sub.fim && <span>Fim: {format(sub.fim, 'dd/MM/yyyy', { locale: ptBR })}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubtarefa(sub.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isAddingNew ? (
            <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Subtarefa
            </Button>
          ) : (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
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
                <Button onClick={handleAddSubtarefa} className="flex-1">
                  Adicionar
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewSubtarefa({
                      id: '',
                      titulo: '',
                      responsavel: defaultResponsavel,
                      inicio: undefined,
                      fim: undefined
                    });
                  }}
                  variant="outline"
                  className="flex-1"
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
