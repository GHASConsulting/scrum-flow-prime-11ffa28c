import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { prioridadeLabels } from '@/lib/formatters';
import type { Tables } from '@/integrations/supabase/types';

interface SprintTaskListViewProps {
  tarefas: Tables<'backlog'>[];
  subtarefasCount: Record<string, number>;
  onRemoveFromSprint: (backlogId: string) => void;
}

const prioridadeColors = {
  baixa: 'bg-info/20 text-info border-info/30',
  media: 'bg-warning/20 text-warning border-warning/30',
  alta: 'bg-destructive/20 text-destructive border-destructive/30'
};

export const SprintTaskListView = ({ tarefas, subtarefasCount, onRemoveFromSprint }: SprintTaskListViewProps) => {
  if (tarefas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma tarefa na sprint. Adicione tarefas do backlog.
      </p>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-center">Story Points</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Área</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tarefas.map((tarefa) => {
            const subtarefaCount = subtarefasCount[tarefa.id] || 0;
            return (
              <TableRow key={tarefa.id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {tarefa.titulo}
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-muted-foreground">
                  {tarefa.descricao || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {subtarefaCount > 0 ? subtarefaCount : tarefa.story_points}
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveFromSprint(tarefa.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
