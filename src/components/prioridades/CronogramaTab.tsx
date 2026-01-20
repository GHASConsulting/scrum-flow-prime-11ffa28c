import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CronogramaTreeGrid } from './CronogramaTreeGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart } from './GanttChart';
import type { ClientAccessRecord } from '@/hooks/useClientAccessRecords';

interface CronogramaTabProps {
  projectId: string | null;
  clientes: ClientAccessRecord[];
  onSelectProject: (id: string) => void;
}

export function CronogramaTab({ projectId, clientes, onSelectProject }: CronogramaTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Label>Selecione um Projeto</Label>
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
      </Card>

      {projectId ? (
        <Tabs defaultValue="tabela" className="w-full">
          <TabsList>
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tabela">
            <CronogramaTreeGrid projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="gantt">
            <GanttChart projectId={projectId} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Selecione um projeto para visualizar o cronograma</p>
        </Card>
      )}
    </div>
  );
}
