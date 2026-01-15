import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Clock, Users, Building2 } from 'lucide-react';
import { useProdutividade } from '@/hooks/useProdutividade';
import { usePrestadorServico } from '@/hooks/usePrestadorServico';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Produtividade = () => {
  const { produtividades, isLoading, addProdutividade, updateProdutividade, deleteProdutividade } = useProdutividade();
  const { prestadoresServico, isLoading: isLoadingPrestadores } = usePrestadorServico();
  const { records: clientes, isLoading: isLoadingClientes } = useClientAccessRecords();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    prestador_id: '',
    cliente_id: '',
    data_inicio: '',
    data_fim: '',
    horas_trabalhadas: '',
    descricao: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      prestador_id: '',
      cliente_id: '',
      data_inicio: '',
      data_fim: '',
      horas_trabalhadas: '',
      descricao: '',
    });
    setEditingId(null);
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

    try {
      await addProdutividade({
        prestador_id: formData.prestador_id,
        cliente_id: formData.cliente_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        horas_trabalhadas: parseFloat(formData.horas_trabalhadas),
        descricao: formData.descricao || undefined,
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (prod: typeof produtividades[0]) => {
    setFormData({
      prestador_id: prod.prestador_id,
      cliente_id: prod.cliente_id,
      data_inicio: prod.data_inicio,
      data_fim: prod.data_fim,
      horas_trabalhadas: String(prod.horas_trabalhadas),
      descricao: prod.descricao || '',
    });
    setEditingId(prod.id);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.prestador_id || !formData.cliente_id || !formData.data_inicio || !formData.data_fim || !formData.horas_trabalhadas) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
      toast.error('Data fim deve ser maior ou igual à data início');
      return;
    }

    try {
      await updateProdutividade({
        id: editingId,
        prestador_id: formData.prestador_id,
        cliente_id: formData.cliente_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        horas_trabalhadas: parseFloat(formData.horas_trabalhadas),
        descricao: formData.descricao || undefined,
      });
      resetForm();
      setIsEditDialogOpen(false);
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

  const DialogForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
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
        <Label htmlFor="horas">Horas Trabalhadas *</Label>
        <Input
          id="horas"
          type="number"
          step="0.5"
          min="0"
          placeholder="Ex: 8.5"
          value={formData.horas_trabalhadas}
          onChange={(e) => setFormData({ ...formData, horas_trabalhadas: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Descrição das atividades realizadas..."
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => {
          resetForm();
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  );

  // Calculate totals
  const totalHoras = produtividades.reduce((acc, p) => acc + Number(p.horas_trabalhadas), 0);

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

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Horas</p>
                  <p className="text-2xl font-bold">{totalHoras.toFixed(1)}h</p>
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
                  <p className="text-2xl font-bold">{prestadoresServico.length}</p>
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
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-2xl font-bold">{produtividades.length}</p>
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
            ) : produtividades.length === 0 ? (
              <p className="text-muted-foreground">Nenhum registro de produtividade encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtividades.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium">
                        {prod.prestador ? `${prod.prestador.codigo} - ${prod.prestador.nome}` : '-'}
                      </TableCell>
                      <TableCell>{prod.cliente?.cliente || '-'}</TableCell>
                      <TableCell>
                        {formatDate(prod.data_inicio)} - {formatDate(prod.data_fim)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(prod.horas_trabalhadas).toFixed(1)}h
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {prod.descricao || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(prod)}>
                            <Edit className="h-4 w-4" />
                          </Button>
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
            <DialogForm onSubmit={handleAdd} submitLabel="Adicionar" />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Registro de Produtividade</DialogTitle>
            </DialogHeader>
            <DialogForm onSubmit={handleUpdate} submitLabel="Salvar" />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Produtividade;
