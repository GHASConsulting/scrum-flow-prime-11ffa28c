import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { prioridadeLabels } from '@/lib/formatters';
import type { Tables } from '@/integrations/supabase/types';

interface BacklogTaskListViewProps {
  tarefas: Tables<'backlog'>[];
  selectedTasks: string[];
  onToggleTaskSelection: (taskId: string) => void;
  onEditTask: (task: Tables<'backlog'>) => void;
  onAddToSprint: (backlogId: string) => void;
  onDeleteTask: (backlogId: string) => void;
  getSprintDaTarefa: (backlogId: string) => { nome: string } | null;
}

const prioridadeColors = {
  baixa: 'bg-info/20 text-info border-info/30',
  media: 'bg-warning/20 text-warning border-warning/30',
  alta: 'bg-destructive/20 text-destructive border-destructive/30'
};

export const BacklogTaskListView = ({ 
  tarefas, 
  selectedTasks,
  onToggleTaskSelection,
  onEditTask,
  onAddToSprint,
  onDeleteTask,
  getSprintDaTarefa
}: BacklogTaskListViewProps) => {
  if (tarefas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma tarefa disponível no backlog.
      </p>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-center">Story Points</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Sprint</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tarefas.map((tarefa) => {
            const isSelected = selectedTasks.includes(tarefa.id);
            const sprintDaTarefa = getSprintDaTarefa(tarefa.id);
            return (
              <TableRow 
                key={tarefa.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEditTask(tarefa)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleTaskSelection(tarefa.id)}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[150px] truncate">
                  {tarefa.titulo}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {tarefa.descricao || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {tarefa.story_points}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs border ${prioridadeColors[tarefa.prioridade as keyof typeof prioridadeColors]}`}>
                    {prioridadeLabels[tarefa.prioridade as keyof typeof prioridadeLabels]}
                  </Badge>
                </TableCell>
                <TableCell>{tarefa.responsavel || '-'}</TableCell>
                <TableCell>
                  {(tarefa as any).tipo_produto ? (
                    <Badge variant="secondary" className="text-xs">
                      {(tarefa as any).tipo_produto}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {sprintDaTarefa ? (
                    <Badge variant="secondary" className="text-xs">
                      {sprintDaTarefa.nome}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Fora</Badge>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Button 
                      onClick={() => onAddToSprint(tarefa.id)} 
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                          onDeleteTask(tarefa.id);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
