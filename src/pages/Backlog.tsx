import { Layout } from '@/components/Layout';
import { useBacklog } from '@/hooks/useBacklog';
import { useSprintTarefas } from '@/hooks/useSprintTarefas';
import { useSprints } from '@/hooks/useSprints';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { Status, BacklogItem } from '@/types/scrum';
import { statusLabels } from '@/lib/formatters';
import { BacklogCard } from '@/components/BacklogCard';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Filter, CalendarIcon } from 'lucide-react';

const TIMEZONE = 'America/Sao_Paulo';

const Backlog = () => {
  const { backlog, updateBacklogItem } = useBacklog();
  const { sprintTarefas } = useSprintTarefas();
  const { sprints } = useSprints();
  const { user, userRole } = useAuth();
  const { profiles } = useProfiles();
  
  // Filtros similares ao Dashboard
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [selectedSituacao, setSelectedSituacao] = useState<string>('all');
  const [dateFilterStart, setDateFilterStart] = useState<Date | undefined>();
  const [dateFilterEnd, setDateFilterEnd] = useState<Date | undefined>();
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>('');

  // Filtrar sprints por situação e intervalo de datas, ordenar por nome
  const filteredSprints = useMemo(() => {
    return sprints.filter(sprint => {
      // Filtro por situação
      if (selectedSituacao !== 'all' && sprint.status !== selectedSituacao) {
        return false;
      }

      // Filtro por intervalo de datas
      const sprintStart = startOfDay(toZonedTime(parseISO(sprint.data_inicio), TIMEZONE));
      const sprintEnd = endOfDay(toZonedTime(parseISO(sprint.data_fim), TIMEZONE));

      // Se data início do filtro está definida, a sprint deve terminar após ou igual a ela
      if (dateFilterStart) {
        const filterStart = startOfDay(dateFilterStart);
        if (sprintEnd < filterStart) {
          return false;
        }
      }

      // Se data fim do filtro está definida, a sprint deve começar antes ou igual a ela
      if (dateFilterEnd) {
        const filterEnd = endOfDay(dateFilterEnd);
        if (sprintStart > filterEnd) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [sprints, selectedSituacao, dateFilterStart, dateFilterEnd]);

  // Selecionar automaticamente a sprint ativa ao carregar
  useEffect(() => {
    const activeSprint = filteredSprints.find(s => s.status === 'ativo');
    if (activeSprint && selectedSprints.length === 0) {
      setSelectedSprints([activeSprint.id]);
    } else if (filteredSprints.length > 0) {
      // Remover sprints que não estão mais nos filtrados
      const validSprints = selectedSprints.filter(id => filteredSprints.some(s => s.id === id));
      if (validSprints.length !== selectedSprints.length) {
        setSelectedSprints(validSprints);
      }
    }
  }, [filteredSprints]);

  const toggleSprintSelection = (sprintId: string) => {
    setSelectedSprints(prev => prev.includes(sprintId) ? prev.filter(id => id !== sprintId) : [...prev, sprintId]);
  };

  const selectAllSprints = () => {
    setSelectedSprints(filteredSprints.map(s => s.id));
  };

  const clearSprintSelection = () => {
    setSelectedSprints([]);
  };

  // Definir responsável padrão para operadores
  useEffect(() => {
    if (userRole === 'operador' && user && profiles.length > 0) {
      const userProfile = profiles.find(p => p.user_id === user.id);
      if (userProfile) {
        setSelectedResponsavel(userProfile.nome);
      }
    }
  }, [userRole, user, profiles]);

  // Filtrar tarefas das sprints selecionadas
  let tarefasNasSprints: BacklogItem[] = backlog
    .filter(item => sprintTarefas.some(st => st.backlog_id === item.id && selectedSprints.includes(st.sprint_id)))
    .map(item => ({
      id: item.id,
      titulo: item.titulo,
      descricao: item.descricao || '',
      story_points: item.story_points,
      prioridade: item.prioridade as 'baixa' | 'media' | 'alta',
      status: item.status as Status,
      responsavel: item.responsavel || ''
    }));

  // Aplicar filtro por responsável (ignorar se for "all")
  if (selectedResponsavel && selectedResponsavel !== 'all') {
    tarefasNasSprints = tarefasNasSprints.filter(item => item.responsavel === selectedResponsavel);
  }

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await updateBacklogItem(id, { status: newStatus });
      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Sprint</h2>
          <p className="text-muted-foreground mt-1">Tarefas das sprints organizadas por status</p>
        </div>

        {/* Card de Filtros */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium">Situação do Sprint</label>
                <Select value={selectedSituacao} onValueChange={setSelectedSituacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as situações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as situações</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFilterStart && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilterStart ? format(dateFilterStart, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFilterStart} onSelect={setDateFilterStart} initialFocus className={cn("p-3 pointer-events-auto")} locale={ptBR} />
                  </PopoverContent>
                </Popover>
                {dateFilterStart && (
                  <Button variant="ghost" size="sm" onClick={() => setDateFilterStart(undefined)} className="mt-1 w-full text-xs">
                    Limpar
                  </Button>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFilterEnd && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilterEnd ? format(dateFilterEnd, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFilterEnd} onSelect={setDateFilterEnd} initialFocus className={cn("p-3 pointer-events-auto")} locale={ptBR} />
                  </PopoverContent>
                </Popover>
                {dateFilterEnd && (
                  <Button variant="ghost" size="sm" onClick={() => setDateFilterEnd(undefined)} className="mt-1 w-full text-xs">
                    Limpar
                  </Button>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Sprint(s) *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {selectedSprints.length === 0 ? "Selecione sprint(s)" : selectedSprints.length === 1 ? sprints.find(s => s.id === selectedSprints[0])?.nome || "1 sprint" : `${selectedSprints.length} sprints selecionadas`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-2 border-b flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAllSprints} className="flex-1">
                        Selecionar Todas
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSprintSelection} className="flex-1">
                        Limpar
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                      {filteredSprints.map(sprint => {
                        const dataInicio = toZonedTime(parseISO(sprint.data_inicio), TIMEZONE);
                        const dataFim = toZonedTime(parseISO(sprint.data_fim), TIMEZONE);
                        const isSelected = selectedSprints.includes(sprint.id);
                        return (
                          <div key={sprint.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer" onClick={() => toggleSprintSelection(sprint.id)}>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSprintSelection(sprint.id)} />
                            <span className="text-sm flex-1">
                              {sprint.nome} ({format(dataInicio, 'dd/MM/yyyy', { locale: ptBR })} - {format(dataFim, 'dd/MM/yyyy', { locale: ptBR })}) - {sprint.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Select 
                  value={selectedResponsavel || 'all'} 
                  onValueChange={setSelectedResponsavel}
                  disabled={userRole === 'operador'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.nome}>
                        {profile.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['todo', 'doing', 'done', 'validated'] as Status[]).map((status) => {
            const items = tarefasNasSprints.filter(item => item.status === status);
            return (
              <div key={status} className="space-y-3">
                <div className="bg-secondary rounded-lg p-3">
                  <h3 className="font-semibold text-foreground">{statusLabels[status]}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{items.length} tarefa(s)</p>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma tarefa
                    </p>
                  ) : (
                    items.map((item) => (
                      <BacklogCard
                        key={item.id}
                        item={item}
                        onStatusChange={handleStatusChange}
                        onUpdate={() => {}}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Backlog;
