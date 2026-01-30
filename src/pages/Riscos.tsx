import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Eye, X, History, Filter, ChevronDown, ChevronUp, Clock, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { useRiscos, type RiscoInsert, type Risco } from '@/hooks/useRiscos';
import { useRiscoHistory } from '@/hooks/useRiscoHistory';
import { useProfiles } from '@/hooks/useProfiles';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { calculateWorkingDays } from '@/lib/workingDays';

const AREAS_IMPACTADAS = ['Delivery', 'Comercial', 'Financeiro', 'CS/CX', 'TI', 'Operação'];
const TIPOS_RISCO_GHAS = ['GHAS - Perda de Contrato', 'GHAS - Multa Contratual', 'GHAS - Jurídico'];
const TIPOS_RISCO_CLIENTE = ['CLIENTE - Financeiro', 'CLIENTE - Assistencial', 'CLIENTE - Jurídico'];
const PROBABILIDADES = ['Baixa', 'Média', 'Alta'];
const IMPACTOS = ['Baixa', 'Média', 'Alta'];
const ORIGENS_RISCO = ['Interno GHAS', 'Cliente', 'Fornecedor', 'Contrato'];
const STATUS_RISCO = ['Aberto', 'Em mitigação', 'Mitigado', 'Materializado'];
const IMPACTOS_REAIS = ['Prazo', 'Financeiro', 'Qualidade', 'Cliente', 'Operação'];

const getNivelRiscoDisplay = (nivel: string) => {
  switch (nivel) {
    case 'Alto':
      return { emoji: '🔴', color: 'text-red-600' };
    case 'Médio':
      return { emoji: '🟡', color: 'text-yellow-600' };
    case 'Baixo':
      return { emoji: '🟢', color: 'text-green-600' };
    default:
      return { emoji: '', color: '' };
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Aberto':
      return 'bg-red-100 text-red-800';
    case 'Em mitigação':
      return 'bg-yellow-100 text-yellow-800';
    case 'Mitigado':
      return 'bg-green-100 text-green-800';
    case 'Materializado':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Component to display history in the detail dialog
const RiscoHistorySection = ({ riscoId }: { riscoId: string }) => {
  const { history, loading, addHistoryEntry } = useRiscoHistory(riscoId);
  const { userName } = useAuth();
  const [newEntry, setNewEntry] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;
    
    try {
      await addHistoryEntry(newEntry, userName || 'Usuário');
      setNewEntry('');
      setIsAdding(false);
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico de Acompanhamento
          </span>
          {!isAdding && (
            <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isAdding && (
          <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
            <Textarea
              placeholder="Descreva a atualização do acompanhamento..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setIsAdding(false); setNewEntry(''); }}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAddEntry} disabled={!newEntry.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum registro de acompanhamento.
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="p-3 border rounded-lg bg-muted/20">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {entry.usuario}
                  </span>
                </div>
                <p className="text-sm">{entry.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Riscos() {
  const { riscos, loading, addRisco, updateRisco, deleteRisco } = useRiscos();
  const { profiles } = useProfiles();
  const { records: clientes } = useClientAccessRecords();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisco, setEditingRisco] = useState<Risco | null>(null);
  const [viewingRisco, setViewingRisco] = useState<Risco | null>(null);
  const [tipoIdentificacao, setTipoIdentificacao] = useState<'Risco' | 'BO'>('Risco');
  
  // Filtros - estilo DashboardClientes
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterResponsavel, setFilterResponsavel] = useState<string>('all');
  const [filterNivelRisco, setFilterNivelRisco] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  
  // Date filters (year/month format)
  const currentDate = new Date();
  const currentYear = String(currentDate.getFullYear());
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  const [filterMesInicio, setFilterMesInicio] = useState<string>(currentMonth);
  const [filterAnoInicio, setFilterAnoInicio] = useState<string>(currentYear);
  const [filterMesFim, setFilterMesFim] = useState<string>(currentMonth);
  const [filterAnoFim, setFilterAnoFim] = useState<string>(currentYear);

  // Helper function to calculate calendar days
  const calculateCalendarDays = (startDate: Date, endDate: Date): number => {
    return differenceInDays(endDate, startDate);
  };

  // Helper function to get deadline status
  const getDeadlineStatus = (risco: Risco) => {
    if (risco.status_risco === 'Mitigado' || !risco.data_limite_acao) return null;
    
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const deadline = new Date(risco.data_limite_acao + 'T12:00:00');
    const daysUntilDeadline = differenceInDays(deadline, today);
    
    if (daysUntilDeadline < 0) {
      return { type: 'overdue', days: Math.abs(daysUntilDeadline) };
    } else {
      return { type: 'remaining', days: daysUntilDeadline };
    }
  };
  
  const [formData, setFormData] = useState<RiscoInsert>({
    cliente_id: null,
    projeto: '',
    area_impactada: '',
    tipo_risco_ghas: '',
    tipo_risco_cliente: '',
    descricao: '',
    probabilidade: '',
    impacto: '',
    origem_risco: '',
    responsavel: null,
    plano_mitigacao: null,
    status_risco: 'Aberto',
    data_identificacao: new Date().toISOString().split('T')[0],
    data_limite_acao: null,
    comentario_acompanhamento: null,
    historico: null,
    risco_ocorreu: false,
    impacto_real_ocorrido: null,
    licao_aprendida: null,
  });

  // Helper function to get client name from cliente_id
  const getClienteName = (risco: Risco) => {
    if (risco.cliente_id) {
      const cliente = clientes.find(c => c.id === risco.cliente_id);
      if (cliente) return cliente.cliente;
    }
    return risco.projeto || '-';
  };

  // Generate available months/years based on riscos
  const availableMonthYears = useMemo(() => {
    const monthYearSet = new Set<string>();
    
    riscos.forEach((r) => {
      const date = new Date(r.data_identificacao + 'T12:00:00');
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthYearSet.add(key);
    });
    
    // Always include current month/year
    monthYearSet.add(`${currentYear}-${currentMonth}`);
    
    return Array.from(monthYearSet).sort();
  }, [riscos, currentYear, currentMonth]);

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

  const handleMesInicioChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setFilterMesInicio(newValue);
    setFilterMesFim(newValue);
  };

  const handleAnoInicioChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setFilterAnoInicio(newValue);
    setFilterAnoFim(newValue);
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

  // Build date strings for filtering
  const filterDataInicio = useMemo(() => {
    if (filterAnoInicio && filterMesInicio) {
      return `${filterAnoInicio}-${filterMesInicio}-01`;
    }
    return undefined;
  }, [filterAnoInicio, filterMesInicio]);

  const filterDataFim = useMemo(() => {
    if (filterAnoFim && filterMesFim) {
      const year = parseInt(filterAnoFim);
      const month = parseInt(filterMesFim);
      const lastDay = new Date(year, month, 0).getDate();
      return `${filterAnoFim}-${filterMesFim}-${String(lastDay).padStart(2, '0')}`;
    }
    return undefined;
  }, [filterAnoFim, filterMesFim]);

  // Lista única de responsáveis
  const uniqueResponsaveis = useMemo(() => {
    return Array.from(new Set(riscos.map(r => r.responsavel).filter(Boolean))) as string[];
  }, [riscos]);

  // Lista única de clientes nos riscos
  const uniqueClientes = useMemo(() => {
    return Array.from(new Set(riscos.map(r => r.projeto).filter(Boolean))).sort();
  }, [riscos]);

  // Aplicar filtros
  const filteredRiscos = useMemo(() => {
    return riscos.filter(risco => {
      // Filtro por cliente/projeto
      if (filterCliente !== 'all' && risco.projeto !== filterCliente) return false;

      // Filtro por data de identificação (início)
      if (filterDataInicio) {
        const dataRisco = risco.data_identificacao;
        if (dataRisco < filterDataInicio) return false;
      }

      // Filtro por data de identificação (fim)
      if (filterDataFim) {
        const dataRisco = risco.data_identificacao;
        if (dataRisco > filterDataFim) return false;
      }

      // Filtro por responsável
      if (filterResponsavel !== 'all') {
        if (risco.responsavel !== filterResponsavel) return false;
      }

      // Filtro por nível de risco
      if (filterNivelRisco !== 'all') {
        if (risco.nivel_risco !== filterNivelRisco) return false;
      }

      // Filtro por status
      if (filterStatus !== 'all') {
        if (risco.status_risco !== filterStatus) return false;
      }

      return true;
    });
  }, [riscos, filterCliente, filterDataInicio, filterDataFim, filterResponsavel, filterNivelRisco, filterStatus]);

  // Sorting logic
  const sortedRiscos = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredRiscos;
    
    return [...filteredRiscos].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortColumn) {
        case 'codigo':
          aValue = a.codigo;
          bValue = b.codigo;
          break;
        case 'cliente':
          aValue = getClienteName(a).toLowerCase();
          bValue = getClienteName(b).toLowerCase();
          break;
        case 'area':
          aValue = a.area_impactada.toLowerCase();
          bValue = b.area_impactada.toLowerCase();
          break;
        case 'descricao':
          aValue = a.descricao.toLowerCase();
          bValue = b.descricao.toLowerCase();
          break;
        case 'nivel':
          const nivelOrder = { 'Alto': 3, 'Médio': 2, 'Baixo': 1 };
          aValue = nivelOrder[a.nivel_risco as keyof typeof nivelOrder] || 0;
          bValue = nivelOrder[b.nivel_risco as keyof typeof nivelOrder] || 0;
          break;
        case 'status':
          aValue = a.status_risco.toLowerCase();
          bValue = b.status_risco.toLowerCase();
          break;
        case 'responsavel':
          aValue = (a.responsavel || '').toLowerCase();
          bValue = (b.responsavel || '').toLowerCase();
          break;
        case 'data':
          aValue = a.data_identificacao;
          bValue = b.data_identificacao;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRiscos, sortColumn, sortDirection, clientes]);

  const handleSort = (column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4 ml-1" />;
    return null;
  };

  const clearFilters = () => {
    setFilterCliente('all');
    setFilterResponsavel('all');
    setFilterNivelRisco('all');
    setFilterStatus('all');
    setFilterMesInicio(currentMonth);
    setFilterAnoInicio(currentYear);
    setFilterMesFim(currentMonth);
    setFilterAnoFim(currentYear);
  };

  const resetForm = () => {
    setFormData({
      cliente_id: null,
      projeto: '',
      area_impactada: '',
      tipo_risco_ghas: '',
      tipo_risco_cliente: '',
      descricao: '',
      probabilidade: '',
      impacto: '',
      origem_risco: '',
      responsavel: null,
      plano_mitigacao: null,
      status_risco: 'Aberto',
      data_identificacao: new Date().toISOString().split('T')[0],
      data_limite_acao: null,
      comentario_acompanhamento: null,
      historico: null,
      risco_ocorreu: false,
      impacto_real_ocorrido: null,
      licao_aprendida: null,
    });
    setEditingRisco(null);
    setTipoIdentificacao('Risco');
  };

  const handleOpenDialog = (risco?: Risco) => {
    if (risco) {
      setEditingRisco(risco);
      setFormData({
        cliente_id: risco.cliente_id,
        projeto: risco.projeto,
        area_impactada: risco.area_impactada,
        tipo_risco_ghas: risco.tipo_risco_ghas,
        tipo_risco_cliente: risco.tipo_risco_cliente,
        descricao: risco.descricao,
        probabilidade: risco.probabilidade,
        impacto: risco.impacto,
        origem_risco: risco.origem_risco,
        responsavel: risco.responsavel,
        plano_mitigacao: risco.plano_mitigacao,
        status_risco: risco.status_risco,
        data_identificacao: risco.data_identificacao,
        data_limite_acao: risco.data_limite_acao,
        comentario_acompanhamento: risco.comentario_acompanhamento,
        historico: risco.historico,
        risco_ocorreu: risco.risco_ocorreu || false,
        impacto_real_ocorrido: risco.impacto_real_ocorrido,
        licao_aprendida: risco.licao_aprendida,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRisco) {
        await updateRisco(editingRisco.id, formData);
      } else {
        await addRisco(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRisco(id);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Riscos e BO's</h1>
            <p className="text-muted-foreground">Gerencie os riscos e BO's do projeto</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRisco ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bloco 1: Identificação */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">1. Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Identificação *</Label>
                      <RadioGroup 
                        value={tipoIdentificacao} 
                        onValueChange={(value) => setTipoIdentificacao(value as 'Risco' | 'BO')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Risco" id="tipo-risco" />
                          <Label htmlFor="tipo-risco" className="font-normal cursor-pointer">Risco (Possibilidade de Ocorrência)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="BO" id="tipo-bo" />
                          <Label htmlFor="tipo-bo" className="font-normal cursor-pointer">BO (Registro de Ocorrência)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cliente_id">Cliente *</Label>
                        <Select
                          value={formData.cliente_id || ''}
                          onValueChange={(value) => {
                            const cliente = clientes.find(c => c.id === value);
                            setFormData({ 
                              ...formData, 
                              cliente_id: value,
                              projeto: cliente?.cliente || '' 
                            });
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
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
                      <div className="space-y-2">
                        <Label htmlFor="area_impactada">Área Impactada *</Label>
                        <Select
                          value={formData.area_impactada}
                          onValueChange={(value) => setFormData({ ...formData, area_impactada: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                          <SelectContent>
                            {AREAS_IMPACTADAS.map((area) => (
                              <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo_risco_ghas">Tipo de Risco GHAS *</Label>
                        <Select
                          value={formData.tipo_risco_ghas}
                          onValueChange={(value) => setFormData({ ...formData, tipo_risco_ghas: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_RISCO_GHAS.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo_risco_cliente">Tipo de Risco Cliente *</Label>
                        <Select
                          value={formData.tipo_risco_cliente}
                          onValueChange={(value) => setFormData({ ...formData, tipo_risco_cliente: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_RISCO_CLIENTE.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição do Risco *</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Ex: Dependência de retorno do cliente para liberação de acesso ao ambiente."
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 2: Avaliação */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">2. Avaliação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="probabilidade">Probabilidade *</Label>
                        <Select
                          value={formData.probabilidade}
                          onValueChange={(value) => setFormData({ ...formData, probabilidade: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROBABILIDADES.map((prob) => (
                              <SelectItem key={prob} value={prob}>{prob}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impacto">Impacto *</Label>
                        <Select
                          value={formData.impacto}
                          onValueChange={(value) => setFormData({ ...formData, impacto: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {IMPACTOS.map((imp) => (
                              <SelectItem key={imp} value={imp}>{imp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nível de Risco (calculado)</Label>
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                          {formData.probabilidade && formData.impacto ? (
                            (() => {
                              const nivel = 
                                (formData.probabilidade === 'Alta' && formData.impacto === 'Alta') ||
                                (formData.probabilidade === 'Alta' && formData.impacto === 'Média') ||
                                (formData.probabilidade === 'Média' && formData.impacto === 'Alta')
                                  ? 'Alto'
                                  : (formData.probabilidade === 'Baixa' && formData.impacto === 'Baixa')
                                    ? 'Baixo'
                                    : 'Médio';
                              const { emoji, color } = getNivelRiscoDisplay(nivel);
                              return <span className={color}>{emoji} {nivel}</span>;
                            })()
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 3: Responsabilidade e Ação */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">3. Responsabilidade e Ação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="origem_risco">Origem do Risco *</Label>
                        <Select
                          value={formData.origem_risco}
                          onValueChange={(value) => setFormData({ ...formData, origem_risco: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIGENS_RISCO.map((origem) => (
                              <SelectItem key={origem} value={origem}>{origem}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Select
                          value={formData.responsavel || ''}
                          onValueChange={(value) => setFormData({ ...formData, responsavel: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.nome}>
                                {profile.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status_risco">Status do Risco *</Label>
                      <Select
                        value={formData.status_risco}
                        onValueChange={(value) => setFormData({ ...formData, status_risco: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_RISCO.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plano_mitigacao">Plano de Mitigação</Label>
                      <Textarea
                        id="plano_mitigacao"
                        placeholder="Descreva as ações para mitigar o risco"
                        value={formData.plano_mitigacao || ''}
                        onChange={(e) => setFormData({ ...formData, plano_mitigacao: e.target.value || null })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 4: Tempo e Controle */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">4. Tempo e Controle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Identificação *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.data_identificacao && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.data_identificacao
                                ? format(new Date(formData.data_identificacao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione a data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.data_identificacao ? new Date(formData.data_identificacao + 'T00:00:00') : undefined}
                              onSelect={(date) => setFormData({ ...formData, data_identificacao: date ? format(date, 'yyyy-MM-dd') : '' })}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Data Limite para Ação</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.data_limite_acao && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.data_limite_acao
                                ? format(new Date(formData.data_limite_acao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione a data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.data_limite_acao ? new Date(formData.data_limite_acao + 'T00:00:00') : undefined}
                              onSelect={(date) => setFormData({ ...formData, data_limite_acao: date ? format(date, 'yyyy-MM-dd') : null })}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 5: Resultado */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">5. Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="risco_ocorreu"
                        checked={formData.risco_ocorreu || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, risco_ocorreu: checked })}
                      />
                      <Label htmlFor="risco_ocorreu">O risco ocorreu?</Label>
                    </div>
                    
                    {formData.risco_ocorreu && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="impacto_real_ocorrido">Impacto Real Ocorrido</Label>
                          <Select
                            value={formData.impacto_real_ocorrido || ''}
                            onValueChange={(value) => setFormData({ ...formData, impacto_real_ocorrido: value || null })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o impacto" />
                            </SelectTrigger>
                            <SelectContent>
                              {IMPACTOS_REAIS.map((impacto) => (
                                <SelectItem key={impacto} value={impacto}>{impacto}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licao_aprendida">Lição Aprendida</Label>
                          <Textarea
                            id="licao_aprendida"
                            placeholder="O que foi aprendido com este risco?"
                            value={formData.licao_aprendida || ''}
                            onChange={(e) => setFormData({ ...formData, licao_aprendida: e.target.value || null })}
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full">
                  {editingRisco ? 'Salvar Alterações' : 'Registrar Risco'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros - estilo DashboardClientes */}
        <Card>
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
                      {uniqueClientes.map(cliente => (
                        <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
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
                      {uniqueResponsaveis.map(resp => (
                        <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nível</Label>
                  <Select value={filterNivelRisco} onValueChange={setFilterNivelRisco}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Alto">🔴 Alto</SelectItem>
                      <SelectItem value="Médio">🟡 Médio</SelectItem>
                      <SelectItem value="Baixo">🟢 Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="h-10 w-full">
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabela de Riscos */}
        <Card>
          <CardHeader>
            <CardTitle>Registros ({filteredRiscos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredRiscos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum risco encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="w-[60px] cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('codigo')}
                      >
                        <div className="flex items-center">
                          ID
                          {getSortIcon('codigo')}
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px] text-center">Ações</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('cliente')}
                      >
                        <div className="flex items-center">
                          Cliente
                          {getSortIcon('cliente')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('area')}
                      >
                        <div className="flex items-center">
                          Área
                          {getSortIcon('area')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('descricao')}
                      >
                        <div className="flex items-center">
                          Descrição
                          {getSortIcon('descricao')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('nivel')}
                      >
                        <div className="flex items-center">
                          Nível
                          {getSortIcon('nivel')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('responsavel')}
                      >
                        <div className="flex items-center">
                          Responsável
                          {getSortIcon('responsavel')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('data')}
                      >
                        <div className="flex items-center">
                          Data Identificação
                          {getSortIcon('data')}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRiscos.map((risco) => {
                      const { emoji, color } = getNivelRiscoDisplay(risco.nivel_risco);
                      return (
                        <TableRow key={risco.id}>
                          <TableCell className="font-medium">{risco.codigo}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewingRisco(risco)}
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Excluir">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este risco? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(risco.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{getClienteName(risco)}</TableCell>
                          <TableCell>{risco.area_impactada}</TableCell>
                          <TableCell className="max-w-xs truncate">{risco.descricao}</TableCell>
                          <TableCell>
                            <span className={color}>{emoji} {risco.nivel_risco}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(risco.status_risco)}`}>
                              {risco.status_risco}
                            </span>
                          </TableCell>
                          <TableCell>{risco.responsavel || '-'}</TableCell>
                          <TableCell>
                            {format(new Date(risco.data_identificacao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para visualização detalhada - Reordenado */}
        <Dialog open={!!viewingRisco} onOpenChange={() => setViewingRisco(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Risco</DialogTitle>
            </DialogHeader>
            {viewingRisco && (
              <div className="space-y-4">
                {/* 1. Tempo e Controle */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <span>Tempo e Controle</span>
                      {viewingRisco.status_risco !== 'Mitigado' && (
                        <>
                          <span className="flex items-center gap-1 text-sm font-normal bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {calculateCalendarDays(
                              new Date(viewingRisco.data_identificacao + 'T12:00:00'),
                              new Date()
                            )} dias corridos em aberto
                          </span>
                          {(() => {
                            const deadlineStatus = getDeadlineStatus(viewingRisco);
                            if (!deadlineStatus) return null;
                            
                            if (deadlineStatus.type === 'overdue') {
                              return (
                                <span className="flex items-center gap-1 text-sm font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="h-3 w-3" />
                                  {deadlineStatus.days} dias de atraso
                                </span>
                              );
                            } else {
                              return (
                                <span className="flex items-center gap-1 text-sm font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {deadlineStatus.days} dias para mitigar
                                </span>
                              );
                            }
                          })()}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Data Identificação:</strong> {format(new Date(viewingRisco.data_identificacao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}</div>
                      <div><strong>Data Limite:</strong> {viewingRisco.data_limite_acao ? format(new Date(viewingRisco.data_limite_acao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }) : '-'}</div>
                    </div>
                    <div><strong>Última Atualização:</strong> {format(new Date(viewingRisco.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                  </CardContent>
                </Card>

                {/* 2. Avaliação */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Avaliação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-sm">
                    <div><strong>Probabilidade:</strong> {viewingRisco.probabilidade}</div>
                    <div><strong>Impacto:</strong> {viewingRisco.impacto}</div>
                    <div>
                      <strong>Nível:</strong>{' '}
                      <span className={getNivelRiscoDisplay(viewingRisco.nivel_risco).color}>
                        {getNivelRiscoDisplay(viewingRisco.nivel_risco).emoji} {viewingRisco.nivel_risco}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Responsabilidade e Ação */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Responsabilidade e Ação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Origem:</strong> {viewingRisco.origem_risco}</div>
                      <div><strong>Responsável:</strong> {viewingRisco.responsavel || '-'}</div>
                    </div>
                    <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(viewingRisco.status_risco)}`}>{viewingRisco.status_risco}</span></div>
                    <div><strong>Plano de Mitigação:</strong> {viewingRisco.plano_mitigacao || '-'}</div>
                  </CardContent>
                </Card>

                {/* 4. Identificação */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {viewingRisco.codigo}</div>
                    <div><strong>Cliente:</strong> {getClienteName(viewingRisco)}</div>
                    <div><strong>Área Impactada:</strong> {viewingRisco.area_impactada}</div>
                    <div><strong>Tipo Risco GHAS:</strong> {viewingRisco.tipo_risco_ghas}</div>
                    <div><strong>Tipo Risco Cliente:</strong> {viewingRisco.tipo_risco_cliente}</div>
                    <div className="col-span-2"><strong>Descrição:</strong> {viewingRisco.descricao}</div>
                  </CardContent>
                </Card>

                {/* 5. Histórico de Acompanhamento */}
                <RiscoHistorySection riscoId={viewingRisco.id} />

                {/* Resultado (se o risco ocorreu) */}
                {viewingRisco.risco_ocorreu && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Resultado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Risco Ocorreu:</strong> Sim</div>
                      <div><strong>Impacto Real:</strong> {viewingRisco.impacto_real_ocorrido || '-'}</div>
                      <div><strong>Lição Aprendida:</strong> {viewingRisco.licao_aprendida || '-'}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
