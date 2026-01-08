import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface RoadmapFiltersProps {
  searchKR: string;
  onSearchKRChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  responsavelFilter: string;
  onResponsavelFilterChange: (value: string) => void;
  tipoTarefaFilter: string;
  onTipoTarefaFilterChange: (value: string) => void;
  onClearFilters: () => void;
  responsaveisUnicos: string[];
  tiposTarefaUnicos: string[];
}

export const RoadmapFilters = ({
  searchKR,
  onSearchKRChange,
  statusFilter,
  onStatusFilterChange,
  responsavelFilter,
  onResponsavelFilterChange,
  tipoTarefaFilter,
  onTipoTarefaFilterChange,
  onClearFilters,
  responsaveisUnicos,
  tiposTarefaUnicos,
}: RoadmapFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar tarefa..."
          value={searchKR}
          onChange={(e) => onSearchKRChange(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="NAO_INICIADO">Não iniciado</SelectItem>
          <SelectItem value="EM_DESENVOLVIMENTO">Em desenvolvimento</SelectItem>
          <SelectItem value="DESENVOLVIDO">Desenvolvido</SelectItem>
        </SelectContent>
      </Select>

      <Select value={responsavelFilter} onValueChange={onResponsavelFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os responsáveis</SelectItem>
          {responsaveisUnicos.map((responsavel) => (
            <SelectItem key={responsavel} value={responsavel}>
              {responsavel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tipoTarefaFilter} onValueChange={onTipoTarefaFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os tipos</SelectItem>
          {tiposTarefaUnicos.map((tipo) => (
            <SelectItem key={tipo} value={tipo}>
              {tipo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onClearFilters}>
        <X className="h-4 w-4 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );
};
