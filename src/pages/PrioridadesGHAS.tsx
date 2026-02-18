import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { CronogramaTab } from '@/components/prioridades/CronogramaTab';

export default function PrioridadesGHAS() {
  const { records: clientes } = useClientAccessRecords();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Prioridades</h1>
          <p className="text-muted-foreground">Gerencie listas de prioridades e cronogramas por projeto</p>
        </div>

        <CronogramaTab
          projectId={selectedProjectId}
          clientes={clientes}
          onSelectProject={setSelectedProjectId}
        />
      </div>
    </Layout>
  );
}
