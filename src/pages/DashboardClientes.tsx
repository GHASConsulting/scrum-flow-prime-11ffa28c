import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Circle } from 'lucide-react';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';

type StatusColor = 'verde' | 'amarelo' | 'vermelho';

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

const StatusIndicator = ({ status }: { status: StatusColor }) => (
  <div className="flex justify-center">
    <Circle className={`h-4 w-4 fill-current ${getStatusColor(status)}`} />
  </div>
);

const DashboardClientes = () => {
  const { records, isLoading } = useClientAccessRecords();

  // Filtros
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterGeral, setFilterGeral] = useState<string>('all');
  const [filterScrum, setFilterScrum] = useState<string>('all');
  const [filterPrioridades, setFilterPrioridades] = useState<string>('all');
  const [filterProdutividade, setFilterProdutividade] = useState<string>('all');
  const [filterRiscos, setFilterRiscos] = useState<string>('all');

  // Gerar status dos clientes (regras serão especificadas depois - por agora, todos verde)
  const clientesStatus: ClienteStatus[] = useMemo(() => {
    return records.map(record => ({
      id: record.id,
      codigo: record.codigo,
      nome: record.cliente,
      // Por enquanto, todos os faróis ficam verdes (regras serão definidas posteriormente)
      geral: 'verde' as StatusColor,
      scrum: 'verde' as StatusColor,
      prioridades: 'verde' as StatusColor,
      produtividade: 'verde' as StatusColor,
      riscos: 'verde' as StatusColor,
    }));
  }, [records]);

  // Aplicar filtros
  const filteredClientes = useMemo(() => {
    return clientesStatus.filter(cliente => {
      if (filterCliente !== 'all' && cliente.id !== filterCliente) return false;
      if (filterGeral !== 'all' && cliente.geral !== filterGeral) return false;
      if (filterScrum !== 'all' && cliente.scrum !== filterScrum) return false;
      if (filterPrioridades !== 'all' && cliente.prioridades !== filterPrioridades) return false;
      if (filterProdutividade !== 'all' && cliente.produtividade !== filterProdutividade) return false;
      if (filterRiscos !== 'all' && cliente.riscos !== filterRiscos) return false;
      return true;
    });
  }, [clientesStatus, filterCliente, filterGeral, filterScrum, filterPrioridades, filterProdutividade, filterRiscos]);

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
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredClientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center w-24">Geral</TableHead>
                    <TableHead className="text-center w-24">Scrum</TableHead>
                    <TableHead className="text-center w-24">Prioridades</TableHead>
                    <TableHead className="text-center w-24">Produtividade</TableHead>
                    <TableHead className="text-center w-24">Riscos e BO's</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map(cliente => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.codigo}</TableCell>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell><StatusIndicator status={cliente.geral} /></TableCell>
                      <TableCell><StatusIndicator status={cliente.scrum} /></TableCell>
                      <TableCell><StatusIndicator status={cliente.prioridades} /></TableCell>
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
