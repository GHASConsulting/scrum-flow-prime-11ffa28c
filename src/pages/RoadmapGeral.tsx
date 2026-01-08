import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useBacklogRoadmap } from '@/hooks/useBacklogRoadmap';
import { useTipoTarefa } from '@/hooks/useTipoTarefa';
import { RoadmapKPIs } from '@/components/roadmap/RoadmapKPIs';
import { RoadmapFilters } from '@/components/roadmap/RoadmapFilters';
import { RoadmapTable } from '@/components/roadmap/RoadmapTable';
import { RoadmapExport } from '@/components/roadmap/RoadmapExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoadmapGeral() {
  const { items, loading } = useBacklogRoadmap();
  const { tiposTarefa } = useTipoTarefa();
  
  const [searchTarefa, setSearchTarefa] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [responsavelFilter, setResponsavelFilter] = useState('todos');
  const [tipoTarefaFilter, setTipoTarefaFilter] = useState('todos');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchTarefa = item.titulo.toLowerCase().includes(searchTarefa.toLowerCase());
      const matchStatus = statusFilter === 'todos' || item.roadmapStatus === statusFilter;
      const matchResponsavel = responsavelFilter === 'todos' || item.responsavel === responsavelFilter;
      const matchTipoTarefa = tipoTarefaFilter === 'todos' || item.tipo_tarefa === tipoTarefaFilter;
      
      return matchTarefa && matchStatus && matchResponsavel && matchTipoTarefa;
    });
  }, [items, searchTarefa, statusFilter, responsavelFilter, tipoTarefaFilter]);

  const calculateKPIs = (itemsList: typeof items) => {
    const total = itemsList.length;
    const concluidos = itemsList.filter(item => item.roadmapStatus === 'ENTREGUE').length;
    
    return {
      total,
      concluidos,
      percentualConcluido: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      tempoMedioReal: 0,
      atrasoMedio: 0,
    };
  };

  const kpis = calculateKPIs(filteredItems);

  const responsaveisUnicos = useMemo(() => {
    const responsaveis = new Set<string>();
    items.forEach(item => {
      if (item.responsavel) responsaveis.add(item.responsavel);
    });
    return Array.from(responsaveis).sort();
  }, [items]);

  const tiposTarefaUnicos = useMemo(() => {
    return tiposTarefa.filter(t => t.ativo).map(t => t.nome).sort();
  }, [tiposTarefa]);

  const handleClearFilters = () => {
    setSearchTarefa('');
    setStatusFilter('todos');
    setResponsavelFilter('todos');
    setTipoTarefaFilter('todos');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando roadmap...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Roadmap</h1>
            <p className="text-muted-foreground">Visão completa de todas as tarefas</p>
          </div>
        </div>

        <RoadmapKPIs {...kpis} />

        <RoadmapFilters
          searchKR={searchTarefa}
          onSearchKRChange={setSearchTarefa}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          responsavelFilter={responsavelFilter}
          onResponsavelFilterChange={setResponsavelFilter}
          tipoTarefaFilter={tipoTarefaFilter}
          onTipoTarefaFilterChange={setTipoTarefaFilter}
          onClearFilters={handleClearFilters}
          responsaveisUnicos={responsaveisUnicos}
          tiposTarefaUnicos={tiposTarefaUnicos}
        />

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Tarefas
                <span className="text-sm text-muted-foreground ml-4">
                  ({kpis.total} tarefas • {kpis.percentualConcluido}% concluídos)
                </span>
              </CardTitle>
              <RoadmapExport items={filteredItems as any} titulo="Roadmap_Tarefas" />
            </div>
          </CardHeader>
          <CardContent>
            <RoadmapTable items={filteredItems} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
