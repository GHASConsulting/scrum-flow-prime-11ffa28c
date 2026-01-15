import { useEffect, useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle, Clock, Star, Users, Filter, FileSpreadsheet, CalendarIcon, TableProperties } from 'lucide-react';
import { useSprints } from '@/hooks/useSprints';
import { useSprintTarefas } from '@/hooks/useSprintTarefas';
import { useBacklog } from '@/hooks/useBacklog';
import { useTipoProduto } from '@/hooks/useTipoProduto';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
const TIMEZONE = 'America/Sao_Paulo';
const Dashboard = () => {
  const {
    sprints
  } = useSprints();
  const {
    sprintTarefas
  } = useSprintTarefas();
  const {
    backlog
  } = useBacklog();
  const {
    tiposProdutoAtivos
  } = useTipoProduto();
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [selectedTipoProduto, setSelectedTipoProduto] = useState<string>('all');
  const [selectedSituacao, setSelectedSituacao] = useState<string>('all');
  const [dateFilterStart, setDateFilterStart] = useState<Date | undefined>();
  const [dateFilterEnd, setDateFilterEnd] = useState<Date | undefined>();
  const [metrics, setMetrics] = useState({
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    validated: 0,
    totalSP: 0
  });
  const [responsibleStats, setResponsibleStats] = useState<any[]>([]);
  const [responsibleSortOrder, setResponsibleSortOrder] = useState<string>('name');
  const [totalSprintSP, setTotalSprintSP] = useState<number>(0);

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
  useEffect(() => {
    if (selectedSprints.length === 0) {
      setMetrics({
        total: 0,
        todo: 0,
        doing: 0,
        done: 0,
        validated: 0,
        totalSP: 0
      });
      setResponsibleStats([]);
      setTotalSprintSP(0);
      return;
    }

    // Processar dados para todas as sprints selecionadas
    const selectedSprintsData = sprints.filter(s => selectedSprints.includes(s.id));
    if (selectedSprintsData.length > 0) {
      // Tarefas de todas as sprints selecionadas
      const allSprintTasks = sprintTarefas.filter(t => selectedSprints.includes(t.sprint_id));

      // Filtrar por tipo de produto se selecionado
      const filteredSprintTasks = allSprintTasks.filter(t => {
        if (selectedTipoProduto === 'all') return true;
        const task = backlog.find(b => b.id === t.backlog_id);
        return task?.tipo_produto === selectedTipoProduto;
      });
      const sprintSP = filteredSprintTasks.reduce((sum, t) => {
        const task = backlog.find(b => b.id === t.backlog_id);
        return sum + (task?.story_points || 0);
      }, 0);
      setTotalSprintSP(sprintSP);

      // Métricas combinadas de todas as sprints selecionadas
      const sprintBacklogIds = filteredSprintTasks.map(t => t.backlog_id);
      const sprintBacklogItems = backlog.filter(b => sprintBacklogIds.includes(b.id));
      const total = sprintBacklogItems.length;
      const todo = sprintBacklogItems.filter(i => i.status === 'todo').length;
      const doing = sprintBacklogItems.filter(i => i.status === 'doing').length;
      const done = sprintBacklogItems.filter(i => i.status === 'done').length;
      const validated = sprintBacklogItems.filter(i => i.status === 'validated').length;
      setMetrics({
        total,
        todo,
        doing,
        done,
        validated,
        totalSP: sprintSP
      });

      // Estatísticas por responsável (agrupadas de todas as sprints selecionadas)
      const responsibleMap = new Map();
      filteredSprintTasks.forEach(t => {
        const responsible = t.responsavel || 'Não atribuído';
        const backlogTask = backlog.find(b => b.id === t.backlog_id);
        if (!backlogTask) return;
        if (!responsibleMap.has(responsible)) {
          responsibleMap.set(responsible, {
            name: responsible,
            todo: 0,
            doing: 0,
            done: 0,
            validated: 0
          });
        }
        const stats = responsibleMap.get(responsible);
        stats[backlogTask.status]++;
      });
      setResponsibleStats(Array.from(responsibleMap.values()));
    }
  }, [backlog, sprints, sprintTarefas, selectedSprints, selectedTipoProduto]);
  const exportToExcel = () => {
    if (selectedSprints.length === 0 || responsibleStats.length === 0) return;
    const selectedSprintsData = sprints.filter(s => selectedSprints.includes(s.id));
    const sprintNames = selectedSprintsData.map(s => s.nome).join(', ');
    const headers = ['Sprint(s)', 'Responsável', 'Qtd Total Atividades', 'Qtd A Fazer', 'Qtd Fazendo', 'Qtd Feito', 'Qtd Validado', '% A Fazer', '% Fazendo', '% Feito + Validado'];
    const rows = responsibleStats.map(stat => {
      const total = stat.todo + stat.doing + stat.done + stat.validated;
      const pctTodo = total > 0 ? (stat.todo / total * 100).toFixed(1) : '0.0';
      const pctDoing = total > 0 ? (stat.doing / total * 100).toFixed(1) : '0.0';
      const pctDoneValidated = total > 0 ? ((stat.done + stat.validated) / total * 100).toFixed(1) : '0.0';
      return [sprintNames, stat.name, total, stat.todo, stat.doing, stat.done, stat.validated, `${pctTodo}%`, `${pctDoing}%`, `${pctDoneValidated}%`];
    });
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
    const fileName = selectedSprints.length === 1 ? `dashboard_${selectedSprintsData[0].nome.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx` : `dashboard_multiplas_sprints_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  return <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Scrum</h2>
          <p className="text-muted-foreground mt-1">Visão geral do projeto</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportToExcel} disabled={selectedSprints.length === 0 || responsibleStats.length === 0}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
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
                      {dateFilterStart ? format(dateFilterStart, "dd/MM/yyyy", {
                      locale: ptBR
                    }) : <span>Selecione</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFilterStart} onSelect={setDateFilterStart} initialFocus className={cn("p-3 pointer-events-auto")} locale={ptBR} />
                  </PopoverContent>
                </Popover>
                {dateFilterStart && <Button variant="ghost" size="sm" onClick={() => setDateFilterStart(undefined)} className="mt-1 w-full text-xs">
                    Limpar
                  </Button>}
              </div>
              <div>
                <label className="text-sm font-medium">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFilterEnd && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilterEnd ? format(dateFilterEnd, "dd/MM/yyyy", {
                      locale: ptBR
                    }) : <span>Selecione</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFilterEnd} onSelect={setDateFilterEnd} initialFocus className={cn("p-3 pointer-events-auto")} locale={ptBR} />
                  </PopoverContent>
                </Popover>
                {dateFilterEnd && <Button variant="ghost" size="sm" onClick={() => setDateFilterEnd(undefined)} className="mt-1 w-full text-xs">
                    Limpar
                  </Button>}
              </div>
              <div>
                <label className="text-sm font-medium">Sprint(s) *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal overflow-hidden">
                      <span className="truncate">
                        {selectedSprints.length === 0 ? "Selecione sprint(s)" : selectedSprints.length === 1 ? sprints.find(s => s.id === selectedSprints[0])?.nome || "1 sprint" : `${selectedSprints.length} sprints selecionadas`}
                      </span>
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
                      return <div key={sprint.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer" onClick={() => toggleSprintSelection(sprint.id)}>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSprintSelection(sprint.id)} />
                            <span className="text-sm flex-1">
                              {sprint.nome} ({format(dataInicio, 'dd/MM/yyyy', {
                            locale: ptBR
                          })} - {format(dataFim, 'dd/MM/yyyy', {
                            locale: ptBR
                          })}) - {sprint.status}
                            </span>
                          </div>;
                    })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium">Área</label>
                <Select value={selectedTipoProduto} onValueChange={setSelectedTipoProduto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {tiposProdutoAtivos.map(tipo => <SelectItem key={tipo.id} value={tipo.nome}>
                        {tipo.nome}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">A Fazer</CardTitle>
              <Circle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.todo}</div>
              <p className="text-xs text-muted-foreground">tarefas pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fazendo</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.doing}</div>
              <p className="text-xs text-muted-foreground">em progresso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Feito</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.done}</div>
              <p className="text-xs text-muted-foreground">
                concluídas • {metrics.total > 0 ? Math.round((metrics.done + metrics.validated) / metrics.total * 100) : 0}% conclusão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Validado</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.validated}</div>
              <p className="text-xs text-muted-foreground">
                validadas • {metrics.total > 0 ? Math.round((metrics.done + metrics.validated) / metrics.total * 100) : 0}% conclusão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Story Points</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSP}</div>
              <p className="text-xs text-muted-foreground">total da sprint</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TableProperties className="h-5 w-5" />
              Indicador Global dos Sprints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responsibleStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold">Responsável</th>
                      <th className="text-right p-3 font-semibold">Qtd Total</th>
                      <th className="text-right p-3 font-semibold">Qtd A Fazer</th>
                      <th className="text-right p-3 font-semibold">Qtd Fazendo</th>
                      <th className="text-right p-3 font-semibold">Qtd Feito</th>
                      <th className="text-right p-3 font-semibold">Qtd Validado</th>
                      <th className="text-right p-3 font-semibold">% A Fazer</th>
                      <th className="text-right p-3 font-semibold">% Fazendo</th>
                      <th className="text-right p-3 font-semibold">% Feito + Validado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...responsibleStats].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((stat, index) => {
                      const total = stat.todo + stat.doing + stat.done + stat.validated;
                      const pctTodo = total > 0 ? (stat.todo / total * 100).toFixed(1) : '0.0';
                      const pctDoing = total > 0 ? (stat.doing / total * 100).toFixed(1) : '0.0';
                      const pctDoneValidated = total > 0 ? ((stat.done + stat.validated) / total * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={stat.name} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="p-3 font-medium">{stat.name}</td>
                          <td className="text-right p-3">{total}</td>
                          <td className="text-right p-3">{stat.todo}</td>
                          <td className="text-right p-3">{stat.doing}</td>
                          <td className="text-right p-3">{stat.done}</td>
                          <td className="text-right p-3">{stat.validated}</td>
                          <td className="text-right p-3">{pctTodo}%</td>
                          <td className="text-right p-3">{pctDoing}%</td>
                          <td className="text-right p-3">{pctDoneValidated}%</td>
                        </tr>
                      );
                    })}
                    {/* Linha Totalizadora */}
                    {(() => {
                      const totals = responsibleStats.reduce((acc, stat) => ({
                        todo: acc.todo + stat.todo,
                        doing: acc.doing + stat.doing,
                        done: acc.done + stat.done,
                        validated: acc.validated + stat.validated
                      }), { todo: 0, doing: 0, done: 0, validated: 0 });
                      const grandTotal = totals.todo + totals.doing + totals.done + totals.validated;
                      const pctTodo = grandTotal > 0 ? (totals.todo / grandTotal * 100).toFixed(0) : '0';
                      const pctDoing = grandTotal > 0 ? (totals.doing / grandTotal * 100).toFixed(0) : '0';
                      const pctDoneValidated = grandTotal > 0 ? ((totals.done + totals.validated) / grandTotal * 100).toFixed(0) : '0';
                      return (
                        <tr className="border-t-2 border-foreground bg-muted font-bold">
                          <td className="p-3">TOTAL</td>
                          <td className="text-right p-3">{grandTotal}</td>
                          <td className="text-right p-3">{totals.todo}</td>
                          <td className="text-right p-3">{totals.doing}</td>
                          <td className="text-right p-3">{totals.done}</td>
                          <td className="text-right p-3">{totals.validated}</td>
                          <td className="text-right p-3">{pctTodo}%</td>
                          <td className="text-right p-3">{pctDoing}%</td>
                          <td className="text-right p-3">{pctDoneValidated}%</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Selecione sprint(s) para visualizar os indicadores globais
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tarefas por Responsável</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={responsibleSortOrder} onValueChange={setResponsibleSortOrder}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Ordenar por Nome</SelectItem>
                  <SelectItem value="completed_desc">Concluídas (Decrescente)</SelectItem>
                  <SelectItem value="completed_asc">Concluídas (Crescente)</SelectItem>
                </SelectContent>
              </Select>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {responsibleStats.length > 0 ? <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[...responsibleStats].sort((a, b) => {
                    const totalA = a.done + a.validated;
                    const totalB = b.done + b.validated;
                    if (responsibleSortOrder === 'completed_desc') return totalB - totalA;
                    if (responsibleSortOrder === 'completed_asc') return totalA - totalB;
                    return a.name.localeCompare(b.name, 'pt-BR');
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="todo" fill="hsl(var(--muted-foreground))" name="A Fazer" />
                    <Bar dataKey="doing" fill="hsl(var(--warning))" name="Fazendo" />
                    <Bar dataKey="done" fill="hsl(var(--success))" name="Feito" />
                    <Bar dataKey="validated" fill="hsl(var(--primary))" name="Validado" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 space-y-4">
                  {[...responsibleStats].sort((a, b) => {
                    const totalA = a.done + a.validated;
                    const totalB = b.done + b.validated;
                    if (responsibleSortOrder === 'completed_desc') return totalB - totalA;
                    if (responsibleSortOrder === 'completed_asc') return totalA - totalB;
                    return a.name.localeCompare(b.name, 'pt-BR');
                  }).map(stat => {
                const total = stat.todo + stat.doing + stat.done + stat.validated;
                const conclusao = total > 0 ? Math.round((stat.done + stat.validated) / total * 100) : 0;
                return <div key={stat.name} className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{stat.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {total} tarefas • {conclusao}% conclusão
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3 w-3" />
                            <span>{stat.todo} A Fazer</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-warning" />
                            <span>{stat.doing} Fazendo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            <span>{stat.done} Feito</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-primary" />
                            <span>{stat.validated} Validado</span>
                          </div>
                        </div>
                      </div>;
              })}
                </div>
              </> : <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Selecione sprint(s) para visualizar as tarefas por responsável
              </div>}
          </CardContent>
        </Card>
      </div>
    </Layout>;
};
export default Dashboard;