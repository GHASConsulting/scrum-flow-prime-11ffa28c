import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { useClientPrioridadesStatus } from '@/hooks/useClientPrioridadesStatus';
import { useClientProdutividadeStatus } from '@/hooks/useClientProdutividadeStatus';
import { useClientMetodologiaStatus } from '@/hooks/useClientMetodologiaStatus';
import { useProdutividadeGlobal } from '@/hooks/useProdutividadeGlobal';
import { useProfiles } from '@/hooks/useProfiles';
import { PrioridadesStatusTooltip } from '@/components/dashboard/PrioridadesStatusTooltip';
import { ProdutividadeStatusTooltip } from '@/components/dashboard/ProdutividadeStatusTooltip';
import { MetodologiaStatusTooltip } from '@/components/dashboard/MetodologiaStatusTooltip';
import { SummaryStatusDialog } from '@/components/dashboard/SummaryStatusDialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getTrafficLightEmoji, getTrafficLightPriority, TrafficLightColor } from '@/components/ui/traffic-light';

type SortField = 'codigo' | 'nome' | 'responsavel' | 'geral' | 'metodologia' | 'prioridades' | 'produtividade' | 'riscos';
type SortDirection = 'asc' | 'desc' | null;

interface ClienteStatus {
  id: string;
  codigo: number;
  nome: string;
  responsavel: string;
  geral: TrafficLightColor;
  metodologia: TrafficLightColor;
  prioridades: TrafficLightColor;
  produtividade: TrafficLightColor;
  riscos: TrafficLightColor;
}

const ClickableStatusIndicator = ({ 
  status, 
  onClick 
}: { 
  status: TrafficLightColor; 
  onClick: () => void;
}) => (
  <div className="flex justify-center">
    <button
      onClick={onClick}
      className="p-1 rounded hover:bg-muted/50 transition-colors cursor-pointer hover:opacity-80"
      title="Clique para ver detalhes"
    >
      {getTrafficLightEmoji(status)}
    </button>
  </div>
);

const StatusIndicator = ({ status }: { status: TrafficLightColor }) => (
  <div className="flex justify-center">
    {getTrafficLightEmoji(status)}
  </div>
);

const DashboardClientes = () => {
  const { records, isLoading } = useClientAccessRecords();
  const { data: prioridadesStatusMap, isLoading: isLoadingPrioridades } = useClientPrioridadesStatus();
  const { produtividades } = useProdutividadeGlobal();
  const { profiles } = useProfiles();

  // Mapa de profiles para lookup rápido
  const profilesMap = useMemo(() => {
    const map: Record<string, string> = {};
    profiles.forEach(p => {
      map[p.id] = p.nome;
    });
    return map;
  }, [profiles]);

  // Filtros
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterResponsavel, setFilterResponsavel] = useState<string>('all');
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  
  // Date filters (year/month format like produtividade-global)
  // Default to current month/year
  const currentDate = new Date();
  const currentYear = String(currentDate.getFullYear());
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  const [filterMesInicio, setFilterMesInicio] = useState<string>(currentMonth);
  const [filterAnoInicio, setFilterAnoInicio] = useState<string>(currentYear);
  const [filterMesFim, setFilterMesFim] = useState<string>(currentMonth);
  const [filterAnoFim, setFilterAnoFim] = useState<string>(currentYear);

  // Dialog state for summary status
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummaryField, setSelectedSummaryField] = useState<'geral' | 'metodologia' | 'prioridades' | 'produtividade' | 'riscos'>('geral');

  const handleSummaryClick = (field: 'geral' | 'metodologia' | 'prioridades' | 'produtividade' | 'riscos') => {
    setSelectedSummaryField(field);
    setSummaryDialogOpen(true);
  };

  const fieldLabels: Record<string, string> = {
    geral: 'Geral',
    metodologia: 'Metodologia',
    prioridades: 'Prioridades',
    produtividade: 'Produtividade',
    riscos: 'Riscos e BO\'s',
  };

  // Generate available months/years based on produtividade records
  const availableMonthYears = useMemo(() => {
    const monthYearSet = new Set<string>();
    
    produtividades.forEach((p) => {
      const startDate = new Date(p.data_inicio + 'T12:00:00');
      const startKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      monthYearSet.add(startKey);
      
      const endDate = new Date(p.data_fim + 'T12:00:00');
      const endKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
      monthYearSet.add(endKey);
    });
    
    return Array.from(monthYearSet).sort();
  }, [produtividades]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    availableMonthYears.forEach((my) => {
      years.add(my.split('-')[0]);
    });
    return Array.from(years).sort();
  }, [availableMonthYears]);

  const getAvailableMonths = (selectedYear: string) => {
    if (!selectedYear) return [];
    
    const monthLabels: Record<string, string> = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
    };
    
    return availableMonthYears
      .filter((my) => my.startsWith(selectedYear))
      .map((my) => {
        const month = my.split('-')[1];
        return { value: month, label: monthLabels[month] };
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  // Sync initial values to final when initial changes
  const handleMesInicioChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setFilterMesInicio(newValue);
    setFilterMesFim(newValue);
  };

  const handleAnoInicioChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setFilterAnoInicio(newValue);
    setFilterAnoFim(newValue);
    // Reset month when year changes
    if (value === 'all') {
      setFilterMesInicio('');
      setFilterMesFim('');
    }
  };

  const handleAnoFimChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setFilterAnoFim(newValue);
    if (value === 'all') {
      setFilterMesFim('');
    }
  };

  const handleMesFimChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setFilterMesFim(newValue);
  };

  // Build date strings for the hook
  const filterDataInicio = useMemo(() => {
    if (filterAnoInicio && filterMesInicio) {
      return `${filterAnoInicio}-${filterMesInicio}-01`;
    }
    return undefined;
  }, [filterAnoInicio, filterMesInicio]);

  const filterDataFim = useMemo(() => {
    if (filterAnoFim && filterMesFim) {
      // Get last day of the month
      const year = parseInt(filterAnoFim);
      const month = parseInt(filterMesFim);
      const lastDay = new Date(year, month, 0).getDate();
      return `${filterAnoFim}-${filterMesFim}-${String(lastDay).padStart(2, '0')}`;
    }
    return undefined;
  }, [filterAnoFim, filterMesFim]);

  // Hook for produtividade status with date filters
  const { data: produtividadeStatusMap, isLoading: isLoadingProdutividade } = useClientProdutividadeStatus(
    filterDataInicio,
    filterDataFim
  );

  // Hook for metodologia status with date filters
  const { data: metodologiaStatusMap } = useClientMetodologiaStatus(
    filterDataInicio,
    filterDataFim
  );

  // Sorting - default to nome ascending
  const [sortField, setSortField] = useState<SortField | null>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3 ml-1" />;
    }
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
  };

  // Gerar status dos clientes
  const clientesStatus: ClienteStatus[] = useMemo(() => {
    return records.map(record => {
      // Get prioridades status from the calculated map (cinza if no data)
      const prioridadesStatus = prioridadesStatusMap?.[record.id]?.status || 'cinza';
      
      // Get produtividade status from the calculated map (cinza if no data)
      const produtividadeStatus = produtividadeStatusMap?.[record.id]?.status || 'cinza';
      
      // Get metodologia status from the calculated map (cinza if no data)
      const metodologiaStatus = metodologiaStatusMap?.[record.id]?.status || 'cinza';

      // Get responsável name from profiles map
      const responsavelNome = record.responsavel_id ? profilesMap[record.responsavel_id] || '' : '';
      
      return {
        id: record.id,
        codigo: record.codigo,
        nome: record.cliente,
        responsavel: responsavelNome,
        // Indicadores sem regras definidas ficam cinza (sem dados para calcular)
        geral: 'cinza' as TrafficLightColor,
        metodologia: metodologiaStatus,
        prioridades: prioridadesStatus,
        produtividade: produtividadeStatus,
        riscos: 'cinza' as TrafficLightColor,
      };
    });
  }, [records, prioridadesStatusMap, produtividadeStatusMap, metodologiaStatusMap, profilesMap]);

  // Aplicar filtros e ordenação
  const filteredAndSortedClientes = useMemo(() => {
    let result = clientesStatus.filter(cliente => {
      if (filterCliente !== 'all' && cliente.id !== filterCliente) return false;
      if (filterResponsavel !== 'all' && cliente.responsavel !== filterResponsavel) return false;
      return true;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'codigo') {
          comparison = a.codigo - b.codigo;
        } else if (sortField === 'nome') {
          comparison = a.nome.localeCompare(b.nome, 'pt-BR');
        } else if (sortField === 'responsavel') {
          comparison = a.responsavel.localeCompare(b.responsavel, 'pt-BR');
        } else {
          // Status fields - sort by priority
          const aPriority = getTrafficLightPriority(a[sortField]);
          const bPriority = getTrafficLightPriority(b[sortField]);
          comparison = aPriority - bPriority;
        }

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [clientesStatus, filterCliente, filterResponsavel, sortField, sortDirection]);

  // Calculate summary traffic light for each column
  const calculateSummaryStatus = (field: 'geral' | 'metodologia' | 'prioridades' | 'produtividade' | 'riscos'): TrafficLightColor => {
    const statuses = filteredAndSortedClientes.map(c => c[field]);
    
    // Filter out 'cinza' (no data) for percentage calculations
    const measuredStatuses = statuses.filter(s => s !== 'cinza');
    
    // If no measured data, return gray
    if (measuredStatuses.length === 0) {
      return 'cinza';
    }
    
    const total = measuredStatuses.length;
    const redCount = measuredStatuses.filter(s => s === 'vermelho').length;
    const yellowCount = measuredStatuses.filter(s => s === 'amarelo').length;
    const yellowOrRedCount = redCount + yellowCount;
    
    const yellowOrRedPercent = (yellowOrRedCount / total) * 100;
    const redPercent = (redCount / total) * 100;
    
    // Rule: 10% or more exclusively red → RED
    if (redPercent >= 10) {
      return 'vermelho';
    }
    
    // Rule: 18% or more yellow or red → RED
    if (yellowOrRedPercent >= 18) {
      return 'vermelho';
    }
    
    // Rule: 10% or more yellow or red → YELLOW
    if (yellowOrRedPercent >= 10) {
      return 'amarelo';
    }
    
    // Otherwise → GREEN
    return 'verde';
  };

  const summaryStatuses = useMemo(() => ({
    geral: calculateSummaryStatus('geral'),
    metodologia: calculateSummaryStatus('metodologia'),
    prioridades: calculateSummaryStatus('prioridades'),
    produtividade: calculateSummaryStatus('produtividade'),
    riscos: calculateSummaryStatus('riscos'),
  }), [filteredAndSortedClientes]);

  // Lista única de responsáveis para o filtro
  const uniqueResponsaveis = useMemo(() => {
    const responsaveis = new Set<string>();
    clientesStatus.forEach(c => {
      if (c.responsavel) {
        responsaveis.add(c.responsavel);
      }
    });
    return Array.from(responsaveis).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [clientesStatus]);

  const SortableHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => {
    const isLeftAligned = className?.includes('text-left');
    return (
      <TableHead 
        className={`cursor-pointer hover:bg-muted/50 select-none ${className || ''}`}
        onClick={() => handleSort(field)}
      >
        <div className={`flex items-center ${isLeftAligned ? 'justify-start' : 'justify-center'}`}>
          {children}
          <SortIcon field={field} />
        </div>
      </TableHead>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0">
          <h2 className="text-3xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground mt-1">Visão geral dos indicadores por cliente</p>
        </div>

        {/* Filtros - Collapsible */}
        <Card className="flex-shrink-0 mt-6">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {filtersExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          {filtersExpanded && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ano Início</Label>
                  <Select value={filterAnoInicio || 'all'} onValueChange={handleAnoInicioChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mês Início</Label>
                  <Select 
                    value={filterMesInicio || 'all'} 
                    onValueChange={handleMesInicioChange}
                    disabled={!filterAnoInicio}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {getAvailableMonths(filterAnoInicio).map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ano Fim</Label>
                  <Select value={filterAnoFim || 'all'} onValueChange={handleAnoFimChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mês Fim</Label>
                  <Select 
                    value={filterMesFim || 'all'} 
                    onValueChange={handleMesFimChange}
                    disabled={!filterAnoFim}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {getAvailableMonths(filterAnoFim).map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <Select value={filterCliente} onValueChange={setFilterCliente}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {records.map(record => (
                        <SelectItem key={record.id} value={record.id}>
                          {record.cliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueResponsaveis.map(responsavel => (
                        <SelectItem key={responsavel} value={responsavel}>
                          {responsavel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterMesInicio('');
                      setFilterAnoInicio('');
                      setFilterMesFim('');
                      setFilterAnoFim('');
                      setFilterCliente('all');
                      setFilterResponsavel('all');
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Grid de Clientes - Scrollable */}
        <Card className="flex-1 mt-6 min-h-0 flex flex-col overflow-hidden">
          {/* Header fixo - não se move com scroll */}
          <div className="flex-shrink-0 border-b">
            {/* Título */}
            <div className="px-6 py-3">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-semibold">Indicadores por Cliente</h3>
                <span className="text-base text-muted-foreground">
                  ({filteredAndSortedClientes.length} {filteredAndSortedClientes.length === 1 ? 'cliente' : 'clientes'})
                </span>
              </div>
            </div>
            {/* Cabeçalho da tabela - fixo */}
            <div className="overflow-x-auto overflow-y-hidden pr-[17px]">
              <Table className="table-fixed w-full min-w-[930px]">
                <colgroup>
                  <col style={{ width: '80px' }} />
                  <col style={{ width: '200px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <TableHeader className="text-base">
                  <TableRow className="bg-muted/30">
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead className="text-center">
                      <ClickableStatusIndicator status={summaryStatuses.geral} onClick={() => handleSummaryClick('geral')} />
                    </TableHead>
                    <TableHead className="text-center">
                      <ClickableStatusIndicator status={summaryStatuses.metodologia} onClick={() => handleSummaryClick('metodologia')} />
                    </TableHead>
                    <TableHead className="text-center">
                      <ClickableStatusIndicator status={summaryStatuses.prioridades} onClick={() => handleSummaryClick('prioridades')} />
                    </TableHead>
                    <TableHead className="text-center">
                      <ClickableStatusIndicator status={summaryStatuses.produtividade} onClick={() => handleSummaryClick('produtividade')} />
                    </TableHead>
                    <TableHead className="text-center">
                      <ClickableStatusIndicator status={summaryStatuses.riscos} onClick={() => handleSummaryClick('riscos')} />
                    </TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/30 border-b">
                    <SortableHeader field="codigo">Código</SortableHeader>
                    <SortableHeader field="nome" className="text-left">Cliente</SortableHeader>
                    <SortableHeader field="responsavel" className="text-left">Responsável</SortableHeader>
                    <SortableHeader field="geral">Geral</SortableHeader>
                    <SortableHeader field="metodologia">Metodologia</SortableHeader>
                    <SortableHeader field="prioridades">Prioridades</SortableHeader>
                    <SortableHeader field="produtividade">Produtividade</SortableHeader>
                    <SortableHeader field="riscos">Riscos e BO's</SortableHeader>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>
          {/* Corpo da tabela - scrollável */}
          <div className="flex-1 overflow-auto">
            {isLoading || isLoadingPrioridades || isLoadingProdutividade ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredAndSortedClientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>
            ) : (
              <Table className="table-fixed w-full min-w-[930px]">
                <colgroup>
                  <col style={{ width: '80px' }} />
                  <col style={{ width: '200px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <TableBody>
                  {filteredAndSortedClientes.map(cliente => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium text-center">{cliente.codigo}</TableCell>
                      <TableCell className="font-semibold">{cliente.nome}</TableCell>
                      <TableCell className="font-semibold">{cliente.responsavel}</TableCell>
                      <TableCell className="text-center"><StatusIndicator status={cliente.geral} /></TableCell>
                      <TableCell className="text-center">
                        <MetodologiaStatusTooltip 
                          status={cliente.metodologia} 
                          metodologiaData={metodologiaStatusMap?.[cliente.id]}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <PrioridadesStatusTooltip 
                          status={cliente.prioridades} 
                          prioridadesData={prioridadesStatusMap?.[cliente.id]}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <ProdutividadeStatusTooltip 
                          status={cliente.produtividade} 
                          produtividadeData={produtividadeStatusMap?.[cliente.id]}
                        />
                      </TableCell>
                      <TableCell className="text-center"><StatusIndicator status={cliente.riscos} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Summary Status Dialog */}
        <SummaryStatusDialog
          open={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
          field={selectedSummaryField}
          fieldLabel={fieldLabels[selectedSummaryField]}
          clientes={filteredAndSortedClientes}
          summaryStatus={summaryStatuses[selectedSummaryField]}
        />
      </div>
    </Layout>
  );
};

export default DashboardClientes;
