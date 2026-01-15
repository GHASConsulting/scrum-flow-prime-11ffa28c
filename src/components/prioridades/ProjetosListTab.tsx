import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/integrations/supabase/types';
import { formatDate } from '@/lib/formatters';

type Project = Tables<'project'>;

interface ProjetosListTabProps {
  projects: Project[];
  loading: boolean;
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}

const statusColors: Record<string, string> = {
  planejamento: 'bg-yellow-500',
  ativo: 'bg-green-500',
  concluido: 'bg-blue-500',
  cancelado: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  planejamento: 'Planejamento',
  ativo: 'Ativo',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export function ProjetosListTab({ projects, loading, selectedProjectId, onSelectProject }: ProjetosListTabProps) {
  if (loading) {
    return <p className="text-muted-foreground">Carregando projetos...</p>;
  }

  if (projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum projeto encontrado. Crie um novo projeto para começar.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedProjectId === project.id ? 'ring-2 ring-primary' : ''}`}
          onClick={() => onSelectProject(project.id)}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{project.nome}</h3>
              <Badge className={statusColors[project.status || 'planejamento']}>
                {statusLabels[project.status || 'planejamento']}
              </Badge>
            </div>
            {project.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2">{project.descricao}</p>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              {project.data_inicio && (
                <p>Início: {formatDate(project.data_inicio)}</p>
              )}
              {project.data_fim && (
                <p>Fim: {formatDate(project.data_fim)}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
