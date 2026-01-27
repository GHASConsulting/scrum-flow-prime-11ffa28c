import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Circle, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { useClientPrioridadesStatus } from '@/hooks/useClientPrioridadesStatus';
import { PrioridadesStatusTooltip } from '@/components/dashboard/PrioridadesStatusTooltip';

type StatusColor = 'verde' | 'amarelo' | 'vermelho';

type SortField = 'codigo' | 'nome' | 'geral' | 'scrum' | 'prioridades' | 'produtividade' | 'riscos';
type SortDirection = 'asc' | 'desc' | null;

interface ClienteStatus {
  id: string;
  codigo: number;
  nome: string;
  geral: StatusColor;
  scrum: StatusColor;
  prioridades: StatusColor;
  produtividade: StatusColor;
  riscos: StatusColor;
}

const getStatusColor = (status: StatusColor): string => {
  switch (status) {
    case 'verde':
      return 'text-green-500';
    case 'amarelo':
      return 'text-yellow-500';
    case 'vermelho':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusBgColor = (status: StatusColor): string => {
  switch (status) {
    case 'verde':
      return 'bg-green-500';
    case 'amarelo':
      return 'bg-yellow-500';
    case 'vermelho':
      return 'bg-red-500';
    default:
      return 'bg-muted';
  }
};

// Status priority for sorting (verde=1, amarelo=2, vermelho=3)
const getStatusPriority = (status: StatusColor): number => {
  switch (status) {
    case 'verde': return 1;
    case 'amarelo': return 2;
    case 'vermelho': return 3;
    default: return 0;
  }
};

const StatusIndicator = ({ status }: { status: StatusColor }) => (
  <div className="flex justify-center">
    <Circle className={`h-4 w-4 fill-current ${getStatusColor(status)}`} />
  </div>
);

const DashboardClientes = () => {
  const { records, isLoading } = useClientAccessRecords();
  const { data: prioridadesStatusMap, isLoading: isLoadingPrioridades } = useClientPrioridadesStatus();

  // Filtros
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterGeral, setFilterGeral] = useState<string>('all');
  const [filterScrum, setFilterScrum] = useState<string>('all');
  const [filterPrioridades, setFilterPrioridades] = useState<string>('all');
  const [filterProdutividade, setFilterProdutividade] = useState<string>('all');
  const [filterRiscos, setFilterRiscos] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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
      // Get prioridades status from the calculated map
      const prioridadesStatus = prioridadesStatusMap?.[record.id]?.status || 'verde';
      
      return {
        id: record.id,
        codigo: record.codigo,
        nome: record.cliente,
        // Por enquanto, os outros faróis ficam verdes (regras serão definidas posteriormente)
        geral: 'verde' as StatusColor,
        scrum: 'verde' as StatusColor,
        prioridades: prioridadesStatus,
        produtividade: 'verde' as StatusColor,
        riscos: 'verde' as StatusColor,
      };
    });
  }, [records, prioridadesStatusMap]);

  // Aplicar filtros e ordenação
  const filteredAndSortedClientes = useMemo(() => {
    let result = clientesStatus.filter(cliente => {
      if (filterCliente !== 'all' && cliente.id !== filterCliente) return false;
      if (filterGeral !== 'all' && cliente.geral !== filterGeral) return false;
      if (filterScrum !== 'all' && cliente.scrum !== filterScrum) return false;
      if (filterPrioridades !== 'all' && cliente.prioridades !== filterPrioridades) return false;
      if (filterProdutividade !== 'all' && cliente.produtividade !== filterProdutividade) return false;
      if (filterRiscos !== 'all' && cliente.riscos !== filterRiscos) return false;
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
        } else {
          // Status fields - sort by priority
          const aPriority = getStatusPriority(a[sortField]);
          const bPriority = getStatusPriority(b[sortField]);
          comparison = aPriority - bPriority;
        }

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [clientesStatus, filterCliente, filterGeral, filterScrum, filterPrioridades, filterProdutividade, filterRiscos, sortField, sortDirection]);

  const StatusFilterSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="verde">
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              Verde
            </div>
          </SelectItem>
          <SelectItem value="amarelo">
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              Amarelo
            </div>
          </SelectItem>
          <SelectItem value="vermelho">
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3 fill-red-500 text-red-500" />
              Vermelho
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const SortableHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 select-none ${className || ''}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-center">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground mt-1">Visão geral dos indicadores por cliente</p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select value={filterCliente} onValueChange={setFilterCliente}>
                  <SelectTrigger>
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
              <StatusFilterSelect value={filterGeral} onChange={setFilterGeral} label="Geral" />
              <StatusFilterSelect value={filterScrum} onChange={setFilterScrum} label="Scrum" />
              <StatusFilterSelect value={filterPrioridades} onChange={setFilterPrioridades} label="Prioridades" />
              <StatusFilterSelect value={filterProdutividade} onChange={setFilterProdutividade} label="Produtividade" />
              <StatusFilterSelect value={filterRiscos} onChange={setFilterRiscos} label="Riscos e BO's" />
            </div>
          </CardContent>
        </Card>

        {/* Grid de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isLoadingPrioridades ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredAndSortedClientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="codigo" className="w-16">Código</SortableHeader>
                    <SortableHeader field="nome" className="text-left">Cliente</SortableHeader>
                    <SortableHeader field="geral" className="w-24">Geral</SortableHeader>
                    <SortableHeader field="scrum" className="w-24">Scrum</SortableHeader>
                    <SortableHeader field="prioridades" className="w-24">Prioridades</SortableHeader>
                    <SortableHeader field="produtividade" className="w-24">Produtividade</SortableHeader>
                    <SortableHeader field="riscos" className="w-24">Riscos e BO's</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedClientes.map(cliente => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium text-center">{cliente.codigo}</TableCell>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell><StatusIndicator status={cliente.geral} /></TableCell>
                      <TableCell><StatusIndicator status={cliente.scrum} /></TableCell>
                      <TableCell>
                        <PrioridadesStatusTooltip 
                          status={cliente.prioridades} 
                          prioridadesData={prioridadesStatusMap?.[cliente.id]}
                        />
                      </TableCell>
                      <TableCell><StatusIndicator status={cliente.produtividade} /></TableCell>
                      <TableCell><StatusIndicator status={cliente.riscos} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardClientes;
