import { useState, useMemo, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CheckCircle, Building2, Upload, ArrowUp, ArrowDown, Download, FileSpreadsheet, FolderOpen, AlertCircle, Percent } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProdutividadeGlobal } from '@/hooks/useProdutividadeGlobal';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { useTemplateFiles } from '@/hooks/useTemplateFiles';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const ProdutividadeGlobal = () => {
  const { produtividades, isLoading, addProdutividade, addMultipleProdutividade, deleteProdutividade } = useProdutividadeGlobal();
  const { records: clientes, isLoading: isLoadingClientes } = useClientAccessRecords();
  const { downloadTemplate } = useTemplateFiles();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    data_inicio: '',
    data_fim: '',
    abertos: '',
    encerrados: '',
    backlog: '',
    percentual_incidentes: '',
    percentual_solicitacoes: '',
  });

  // Filter states
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterMesInicio, setFilterMesInicio] = useState<string>('');
  const [filterAnoInicio, setFilterAnoInicio] = useState<string>('');
  const [filterMesFim, setFilterMesFim] = useState<string>('');
  const [filterAnoFim, setFilterAnoFim] = useState<string>('');
  const [filterImportado, setFilterImportado] = useState<string>('all');

  // Sorting states
  type SortColumn = 'codigo' | 'cliente' | 'data_inicio' | 'data_fim' | 'abertos' | 'encerrados' | 'backlog' | 'percentual_incidentes' | 'percentual_solicitacoes' | 'importado';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sync initial values to final when initial changes
  const handleMesInicioChange = (value: string) => {
    setFilterMesInicio(value);
    setFilterMesFim(value);
  };

  const handleAnoInicioChange = (value: string) => {
    setFilterAnoInicio(value);
    setFilterAnoFim(value);
  };

  // Generate available months/years based on existing records
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

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      data_inicio: '',
      data_fim: '',
      abertos: '',
      encerrados: '',
      backlog: '',
      percentual_incidentes: '',
      percentual_solicitacoes: '',
    });
  };

  const checkOverlappingPeriod = (clienteId: string, dataInicio: string, dataFim: string) => {
    const newStart = new Date(dataInicio);
    const newEnd = new Date(dataFim);
    
    return produtividades.some((p) => {
      if (p.cliente_id !== clienteId) return false;
      
      const existingStart = new Date(p.data_inicio);
      const existingEnd = new Date(p.data_fim);
      
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  };

  const handleAdd = async () => {
    if (!formData.cliente_id || !formData.data_inicio || !formData.data_fim) {
      toast.error('Preencha os campos obrigatórios: Cliente, Data Início e Data Fim');
      return;
    }

    if (!formData.abertos) {
      toast.error('Preencha o campo Abertos');
      return;
    }

    if (!formData.encerrados) {
      toast.error('Preencha o campo Encerrados');
      return;
    }

    if (!formData.backlog) {
      toast.error('Preencha o campo Backlog');
      return;
    }

    if (!formData.percentual_incidentes) {
      toast.error('Preencha o campo % Incidentes');
      return;
    }

    if (!formData.percentual_solicitacoes) {
      toast.error('Preencha o campo % Solicitações');
      return;
    }

    if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
      toast.error('Data fim deve ser maior ou igual à data início');
      return;
    }

    const nowBrazil = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todayStr = `${nowBrazil.getFullYear()}-${String(nowBrazil.getMonth() + 1).padStart(2, '0')}-${String(nowBrazil.getDate()).padStart(2, '0')}`;
    
    if (formData.data_inicio > todayStr) {
      toast.error('Data de início não pode ser maior que a data atual');
      return;
    }
    
    if (formData.data_fim > todayStr) {
      toast.error('Data fim não pode ser maior que a data atual');
      return;
    }

    if (checkOverlappingPeriod(formData.cliente_id, formData.data_inicio, formData.data_fim)) {
      toast.error('Já existe um registro para este cliente com período que se sobrepõe');
      return;
    }

    // Validate percentages
    const percIncidentes = parseFloat(formData.percentual_incidentes) || 0;
    const percSolicitacoes = parseFloat(formData.percentual_solicitacoes) || 0;
    
    if (percIncidentes < 0 || percIncidentes > 100) {
      toast.error('% Incidentes deve estar entre 0 e 100');
      return;
    }
    
    if (percSolicitacoes < 0 || percSolicitacoes > 100) {
      toast.error('% Solicitações deve estar entre 0 e 100');
      return;
    }

    if (percIncidentes + percSolicitacoes > 100) {
      toast.error('A soma de % Incidentes e % Solicitações não pode ultrapassar 100%');
      return;
    }

    try {
      await addProdutividade({
        cliente_id: formData.cliente_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        abertos: parseInt(formData.abertos) || 0,
        encerrados: parseInt(formData.encerrados) || 0,
        backlog: parseInt(formData.backlog) || 0,
        percentual_incidentes: percIncidentes,
        percentual_solicitacoes: percSolicitacoes,
        importado: false,
      });
      toast.success('Produtividade registrada com sucesso!');
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const parseExcelDate = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        const year = date.y;
        const month = String(date.m).padStart(2, '0');
        const day = String(date.d).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return null;
    }
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      
      const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (brMatch) {
        const [, day, month, year] = brMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) {
        return trimmed;
      }
      
      return null;
    }
    
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return null;
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      const rows = data.slice(1).filter(row => row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== ''));

      if (rows.length === 0) {
        toast.error('Nenhum registro encontrado na planilha');
        return;
      }

      const errors: string[] = [];
      const validRecords: {
        cliente_id: string;
        data_inicio: string;
        data_fim: string;
        abertos: number;
        encerrados: number;
        backlog: number;
        percentual_incidentes: number;
        percentual_solicitacoes: number;
        importado: boolean;
      }[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;
        const rowErrors: string[] = [];

        // Column 0: Código do Cliente
        const codigoCliente = row[0];
        if (codigoCliente === null || codigoCliente === undefined || codigoCliente === '') {
          rowErrors.push('Código do Cliente está vazio');
        }
        const cliente = clientes.find(c => c.codigo === Number(codigoCliente));
        if (!cliente && codigoCliente !== null && codigoCliente !== undefined && codigoCliente !== '') {
          rowErrors.push(`Código do Cliente ${codigoCliente} não encontrado`);
        }

        // Column 1: Data Início
        const dataInicio = parseExcelDate(row[1]);
        if (!dataInicio) {
          rowErrors.push('Data de Início inválida ou vazia');
        }

        // Column 2: Data Fim
        const dataFim = parseExcelDate(row[2]);
        if (!dataFim) {
          rowErrors.push('Data Fim inválida ou vazia');
        }

        if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
          rowErrors.push('Data Fim deve ser maior ou igual à Data de Início');
        }

        const nowBrazil = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        const todayStr = `${nowBrazil.getFullYear()}-${String(nowBrazil.getMonth() + 1).padStart(2, '0')}-${String(nowBrazil.getDate()).padStart(2, '0')}`;
        
        if (dataInicio && dataInicio > todayStr) {
          rowErrors.push('Data de Início não pode ser maior que a data atual');
        }
        
        if (dataFim && dataFim > todayStr) {
          rowErrors.push('Data Fim não pode ser maior que a data atual');
        }

        // Column 3: Abertos
        const abertos = Number(row[3]) || 0;
        if (abertos < 0) {
          rowErrors.push('Abertos não pode ser negativo');
        }

        // Column 4: Encerrados
        const encerrados = Number(row[4]) || 0;
        if (encerrados < 0) {
          rowErrors.push('Encerrados não pode ser negativo');
        }

        // Column 5: Backlog
        const backlogVal = Number(row[5]) || 0;
        if (backlogVal < 0) {
          rowErrors.push('Backlog não pode ser negativo');
        }

        // Column 6: % Incidentes
        const percIncidentes = Number(row[6]) || 0;
        if (percIncidentes < 0 || percIncidentes > 100) {
          rowErrors.push('% Incidentes deve estar entre 0 e 100');
        }

        // Column 7: % Solicitações
        const percSolicitacoes = Number(row[7]) || 0;
        if (percSolicitacoes < 0 || percSolicitacoes > 100) {
          rowErrors.push('% Solicitações deve estar entre 0 e 100');
        }

        // Validate sum of percentages
        if (percIncidentes + percSolicitacoes > 100) {
          rowErrors.push('A soma de % Incidentes e % Solicitações não pode ultrapassar 100%');
        }

        if (cliente && dataInicio && dataFim) {
          const hasOverlap = produtividades.some((p) => {
            if (p.cliente_id !== cliente.id) return false;
            const existingStart = new Date(p.data_inicio);
            const existingEnd = new Date(p.data_fim);
            const newStart = new Date(dataInicio);
            const newEnd = new Date(dataFim);
            return newStart <= existingEnd && newEnd >= existingStart;
          });

          const hasOverlapInImport = validRecords.some((vr) => {
            if (vr.cliente_id !== cliente.id) return false;
            const existingStart = new Date(vr.data_inicio);
            const existingEnd = new Date(vr.data_fim);
            const newStart = new Date(dataInicio);
            const newEnd = new Date(dataFim);
            return newStart <= existingEnd && newEnd >= existingStart;
          });

          if (hasOverlap || hasOverlapInImport) {
            rowErrors.push('Período se sobrepõe com registro existente');
          }
        }

        if (rowErrors.length > 0) {
          errors.push(`Linha ${rowNumber}: ${rowErrors.join('; ')}`);
        } else if (cliente && dataInicio && dataFim) {
          validRecords.push({
            cliente_id: cliente.id,
            data_inicio: dataInicio,
            data_fim: dataFim,
            abertos,
            encerrados,
            backlog: backlogVal,
            percentual_incidentes: percIncidentes,
            percentual_solicitacoes: percSolicitacoes,
            importado: true,
          });
        }
      }

      if (errors.length > 0) {
        toast.error(
          <div className="max-h-96 overflow-auto">
            <p className="font-semibold mb-2">Erros encontrados na importação:</p>
            <ul className="list-disc pl-4 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>,
          { duration: 15000 }
        );
        return;
      }

      if (validRecords.length === 0) {
        toast.error('Nenhum registro válido para importar');
        return;
      }

      await addMultipleProdutividade(validRecords);
      toast.success(`${validRecords.length} registro(s) importado(s) com sucesso!`);
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Erro ao processar o arquivo. Verifique o formato da planilha.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;
    try {
      await deleteProdutividade(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR });
  };

  const filteredProdutividades = useMemo(() => {
    const filtered = produtividades.filter((p) => {
      if (filterCliente !== 'all' && p.cliente_id !== filterCliente) return false;
      if (filterImportado !== 'all') {
        const isImportado = filterImportado === 'sim';
        if (p.importado !== isImportado) return false;
      }
      
      if (filterMesInicio && filterAnoInicio) {
        const filterStartDate = `${filterAnoInicio}-${filterMesInicio}-01`;
        if (p.data_inicio < filterStartDate) return false;
      }
      if (filterMesFim && filterAnoFim) {
        const lastDay = new Date(parseInt(filterAnoFim), parseInt(filterMesFim), 0).getDate();
        const filterEndDate = `${filterAnoFim}-${filterMesFim}-${String(lastDay).padStart(2, '0')}`;
        if (p.data_fim > filterEndDate) return false;
      }
      return true;
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: string | number | boolean;
        let bValue: string | number | boolean;

        switch (sortColumn) {
          case 'codigo':
            aValue = a.codigo;
            bValue = b.codigo;
            break;
          case 'cliente':
            aValue = a.cliente ? `${a.cliente.codigo} - ${a.cliente.cliente}` : '';
            bValue = b.cliente ? `${b.cliente.codigo} - ${b.cliente.cliente}` : '';
            break;
          case 'data_inicio':
            aValue = a.data_inicio;
            bValue = b.data_inicio;
            break;
          case 'data_fim':
            aValue = a.data_fim;
            bValue = b.data_fim;
            break;
          case 'abertos':
            aValue = Number(a.abertos);
            bValue = Number(b.abertos);
            break;
          case 'encerrados':
            aValue = Number(a.encerrados);
            bValue = Number(b.encerrados);
            break;
          case 'backlog':
            aValue = Number(a.backlog);
            bValue = Number(b.backlog);
            break;
          case 'percentual_incidentes':
            aValue = Number(a.percentual_incidentes);
            bValue = Number(b.percentual_incidentes);
            break;
          case 'percentual_solicitacoes':
            aValue = Number(a.percentual_solicitacoes);
            bValue = Number(b.percentual_solicitacoes);
            break;
          case 'importado':
            aValue = a.importado ? 1 : 0;
            bValue = b.importado ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [produtividades, filterCliente, filterImportado, filterMesInicio, filterAnoInicio, filterMesFim, filterAnoFim, sortColumn, sortDirection]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  // KPIs
  const totalAbertos = filteredProdutividades.reduce((sum, p) => sum + Number(p.abertos), 0);
  const totalEncerrados = filteredProdutividades.reduce((sum, p) => sum + Number(p.encerrados), 0);
  const totalBacklog = filteredProdutividades.reduce((sum, p) => sum + Number(p.backlog), 0);
  const uniqueClientes = new Set(filteredProdutividades.map(p => p.cliente_id)).size;

  const clearFilters = () => {
    setFilterCliente('all');
    setFilterImportado('all');
    setFilterMesInicio('');
    setFilterAnoInicio('');
    setFilterMesFim('');
    setFilterAnoFim('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Produtividade Global</h2>
            <p className="text-muted-foreground mt-1">
              Visão consolidada da produtividade por cliente e período
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleImportFile}
              className="hidden"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isImporting}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importando...' : 'Importar Excel'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Registros
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadTemplate('produtividade', 'GHAS_-_Arquivo_Modelo_de_Importacao.xlsx')}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Modelo de Arquivo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={filterCliente} onValueChange={setFilterCliente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês/Ano Inicial</Label>
                <div className="flex gap-2">
                  <Select value={filterAnoInicio} onValueChange={handleAnoInicioChange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterMesInicio} onValueChange={handleMesInicioChange} disabled={!filterAnoInicio}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths(filterAnoInicio).map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mês/Ano Final</Label>
                <div className="flex gap-2">
                  <Select value={filterAnoFim} onValueChange={setFilterAnoFim}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterMesFim} onValueChange={setFilterMesFim} disabled={!filterAnoFim}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths(filterAnoFim).map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Importado</Label>
                <Select value={filterImportado} onValueChange={setFilterImportado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Abertos</p>
                  <p className="text-2xl font-bold">{totalAbertos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Encerrados</p>
                  <p className="text-2xl font-bold">{totalEncerrados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Backlog</p>
                  <p className="text-2xl font-bold">{totalBacklog}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold">{uniqueClientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isLoadingClientes ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredProdutividades.length === 0 ? (
              <p className="text-muted-foreground">Nenhum registro de produtividade encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50 w-[80px]" onClick={() => handleSort('codigo')}>
                      ID <SortIcon column="codigo" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('cliente')}>
                      Cliente <SortIcon column="cliente" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('data_inicio')}>
                      Data Início <SortIcon column="data_inicio" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('data_fim')}>
                      Data Fim <SortIcon column="data_fim" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('abertos')}>
                      Abertos <SortIcon column="abertos" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('encerrados')}>
                      Encerrados <SortIcon column="encerrados" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('backlog')}>
                      Backlog <SortIcon column="backlog" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('percentual_incidentes')}>
                      % Incidentes <SortIcon column="percentual_incidentes" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('percentual_solicitacoes')}>
                      % Solicitações <SortIcon column="percentual_solicitacoes" />
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort('importado')}>
                      Importado <SortIcon column="importado" />
                    </TableHead>
                    <TableHead className="w-[80px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutividades.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium">{prod.codigo}</TableCell>
                      <TableCell>
                        {prod.cliente ? `${prod.cliente.codigo} - ${prod.cliente.cliente}` : '-'}
                      </TableCell>
                      <TableCell>{formatDate(prod.data_inicio)}</TableCell>
                      <TableCell>{formatDate(prod.data_fim)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.abertos)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.encerrados)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.backlog)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.percentual_incidentes).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.percentual_solicitacoes).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={prod.importado ? 'default' : 'secondary'}>
                          {prod.importado ? 'Sim' : 'Não'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(prod.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Registro de Produtividade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data Fim *</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="abertos">Abertos</Label>
                  <Input
                    id="abertos"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.abertos}
                    onChange={(e) => setFormData({ ...formData, abertos: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="encerrados">Encerrados</Label>
                  <Input
                    id="encerrados"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.encerrados}
                    onChange={(e) => setFormData({ ...formData, encerrados: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backlog">Backlog</Label>
                  <Input
                    id="backlog"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.backlog}
                    onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentual_incidentes">% Incidentes</Label>
                  <Input
                    id="percentual_incidentes"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={formData.percentual_incidentes}
                    onChange={(e) => setFormData({ ...formData, percentual_incidentes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="percentual_solicitacoes">% Solicitações</Label>
                  <Input
                    id="percentual_solicitacoes"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={formData.percentual_solicitacoes}
                    onChange={(e) => setFormData({ ...formData, percentual_solicitacoes: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd}>Adicionar</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProdutividadeGlobal;
