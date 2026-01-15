import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle, Users, Building2 } from 'lucide-react';
import { useProdutividade } from '@/hooks/useProdutividade';
import { usePrestadorServico } from '@/hooks/usePrestadorServico';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Produtividade = () => {
  const { produtividades, isLoading, addProdutividade, deleteProdutividade } = useProdutividade();
  const { prestadoresServico, isLoading: isLoadingPrestadores } = usePrestadorServico();
  const { records: clientes, isLoading: isLoadingClientes } = useClientAccessRecords();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    prestador_id: '',
    cliente_id: '',
    data_inicio: '',
    data_fim: '',
    horas_trabalhadas: '',
  });

  // Filter states
  const [filterPrestador, setFilterPrestador] = useState<string>('all');
  const [filterCliente, setFilterCliente] = useState<string>('all');
  const [filterMesInicio, setFilterMesInicio] = useState<string>('');
  const [filterAnoInicio, setFilterAnoInicio] = useState<string>('');
  const [filterMesFim, setFilterMesFim] = useState<string>('');
  const [filterAnoFim, setFilterAnoFim] = useState<string>('');

  // Generate years for dropdown (from 2020 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => 2020 + i);
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const resetForm = () => {
    setFormData({
      prestador_id: '',
      cliente_id: '',
      data_inicio: '',
      data_fim: '',
      horas_trabalhadas: '',
    });
  };

  const checkOverlappingPeriod = (prestadorId: string, clienteId: string, dataInicio: string, dataFim: string) => {
    const newStart = new Date(dataInicio);
    const newEnd = new Date(dataFim);
    
    return produtividades.some((p) => {
      if (p.prestador_id !== prestadorId || p.cliente_id !== clienteId) return false;
      
      const existingStart = new Date(p.data_inicio);
      const existingEnd = new Date(p.data_fim);
      
      // Check if periods overlap: new period overlaps with existing if
      // newStart <= existingEnd AND newEnd >= existingStart
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  };

  const handleAdd = async () => {
    if (!formData.prestador_id || !formData.cliente_id || !formData.data_inicio || !formData.data_fim || !formData.horas_trabalhadas) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
      toast.error('Data fim deve ser maior ou igual à data início');
      return;
    }

    // Check for overlapping period
    if (checkOverlappingPeriod(formData.prestador_id, formData.cliente_id, formData.data_inicio, formData.data_fim)) {
      toast.error('Já existe um registro para este prestador e cliente com período que se sobrepõe');
      return;
    }

    try {
      await addProdutividade({
        prestador_id: formData.prestador_id,
        cliente_id: formData.cliente_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        horas_trabalhadas: parseFloat(formData.horas_trabalhadas),
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
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

  // Filtered data
  const filteredProdutividades = useMemo(() => {
    return produtividades.filter((p) => {
      if (filterPrestador !== 'all' && p.prestador_id !== filterPrestador) return false;
      if (filterCliente !== 'all' && p.cliente_id !== filterCliente) return false;
      
      // Filter by month/year range
      if (filterMesInicio && filterAnoInicio) {
        const filterStartDate = `${filterAnoInicio}-${filterMesInicio}-01`;
        if (p.data_inicio < filterStartDate) return false;
      }
      if (filterMesFim && filterAnoFim) {
        // Last day of the selected month
        const lastDay = new Date(parseInt(filterAnoFim), parseInt(filterMesFim), 0).getDate();
        const filterEndDate = `${filterAnoFim}-${filterMesFim}-${String(lastDay).padStart(2, '0')}`;
        if (p.data_fim > filterEndDate) return false;
      }
      return true;
    });
  }, [produtividades, filterPrestador, filterCliente, filterMesInicio, filterAnoInicio, filterMesFim, filterAnoFim]);

  // Calculate KPIs based on filtered data
  const totalChamados = filteredProdutividades.reduce((sum, p) => sum + Number(p.horas_trabalhadas), 0);
  const uniquePrestadores = new Set(filteredProdutividades.map(p => p.prestador_id)).size;
  const uniqueClientes = new Set(filteredProdutividades.map(p => p.cliente_id)).size;

  const clearFilters = () => {
    setFilterPrestador('all');
    setFilterCliente('all');
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
            <h2 className="text-3xl font-bold text-foreground">Produtividade</h2>
            <p className="text-muted-foreground mt-1">
              Registre a produtividade dos prestadores de serviço por cliente e período
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Prestador</Label>
                <Select value={filterPrestador} onValueChange={setFilterPrestador}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {prestadoresServico.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} - {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  <Select value={filterMesInicio} onValueChange={setFilterMesInicio}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterAnoInicio} onValueChange={setFilterAnoInicio}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mês/Ano Final</Label>
                <div className="flex gap-2">
                  <Select value={filterMesFim} onValueChange={setFilterMesFim}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterAnoFim} onValueChange={setFilterAnoFim}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Chamados Encerrados</p>
                  <p className="text-2xl font-bold">{totalChamados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prestadores</p>
                  <p className="text-2xl font-bold">{uniquePrestadores}</p>
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
            {isLoading || isLoadingPrestadores || isLoadingClientes ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredProdutividades.length === 0 ? (
              <p className="text-muted-foreground">Nenhum registro de produtividade encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead className="text-right">Total de Chamados Encerrados</TableHead>
                    <TableHead className="w-[80px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutividades.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium">
                        {prod.prestador ? `${prod.prestador.codigo} - ${prod.prestador.nome}` : '-'}
                      </TableCell>
                      <TableCell>{prod.cliente?.cliente || '-'}</TableCell>
                      <TableCell>{formatDate(prod.data_inicio)}</TableCell>
                      <TableCell>{formatDate(prod.data_fim)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.horas_trabalhadas)}
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
                <Label htmlFor="prestador">Prestador de Serviço *</Label>
                <Select
                  value={formData.prestador_id}
                  onValueChange={(value) => setFormData({ ...formData, prestador_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prestador" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestadoresServico.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} - {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="horas">Total de Chamados Encerrados *</Label>
                <Input
                  id="horas"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Ex: 10"
                  value={formData.horas_trabalhadas}
                  onChange={(e) => setFormData({ ...formData, horas_trabalhadas: e.target.value })}
                />
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

export default Produtividade;
