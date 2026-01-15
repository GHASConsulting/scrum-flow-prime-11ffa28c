import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Edit, Trash2, Package, Tag, Users, User } from 'lucide-react';
import { useTipoProduto } from '@/hooks/useTipoProduto';
import { useTipoTarefa } from '@/hooks/useTipoTarefa';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { usePrestadorServico } from '@/hooks/usePrestadorServico';
import { toast } from 'sonner';
const CadastrosSistema = () => {
  const {
    tiposProduto,
    isLoading: isLoadingArea,
    addTipoProduto,
    updateTipoProduto,
    deleteTipoProduto
  } = useTipoProduto();
  const {
    tiposTarefa,
    isLoading: isLoadingTipo,
    addTipoTarefa,
    updateTipoTarefa,
    deleteTipoTarefa
  } = useTipoTarefa();
  const {
    records: clientes,
    isLoading: isLoadingClientes,
    createRecord,
    updateRecord,
    deleteRecord
  } = useClientAccessRecords();
  const {
    prestadoresServico,
    isLoading: isLoadingPrestador,
    addPrestadorServico,
    updatePrestadorServico,
    deletePrestadorServico
  } = usePrestadorServico();

  // Estado para Área
  const [isAddAreaDialogOpen, setIsAddAreaDialogOpen] = useState(false);
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false);
  const [newAreaNome, setNewAreaNome] = useState('');
  const [editingArea, setEditingArea] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Tipo
  const [isAddTipoDialogOpen, setIsAddTipoDialogOpen] = useState(false);
  const [isEditTipoDialogOpen, setIsEditTipoDialogOpen] = useState(false);
  const [newTipoNome, setNewTipoNome] = useState('');
  const [editingTipo, setEditingTipo] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Cliente
  const [isAddClienteDialogOpen, setIsAddClienteDialogOpen] = useState(false);
  const [isEditClienteDialogOpen, setIsEditClienteDialogOpen] = useState(false);
  const [newClienteNome, setNewClienteNome] = useState('');
  const [editingCliente, setEditingCliente] = useState<{
    id: string;
    cliente: string;
  } | null>(null);

  // Estado para Prestador de Serviço
  const [isAddPrestadorDialogOpen, setIsAddPrestadorDialogOpen] = useState(false);
  const [isEditPrestadorDialogOpen, setIsEditPrestadorDialogOpen] = useState(false);
  const [newPrestadorNome, setNewPrestadorNome] = useState('');
  const [newPrestadorEmail, setNewPrestadorEmail] = useState('');
  const [editingPrestador, setEditingPrestador] = useState<{
    id: string;
    codigo: number;
    nome: string;
    email: string | null;
  } | null>(null);

  // Handlers para Área
  const handleAddArea = async () => {
    if (!newAreaNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoProduto(newAreaNome.trim());
      setNewAreaNome('');
      setIsAddAreaDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditArea = (item: {
    id: string;
    nome: string;
    ativo: boolean;
  }) => {
    setEditingArea({
      ...item
    });
    setIsEditAreaDialogOpen(true);
  };
  const handleUpdateArea = async () => {
    if (!editingArea) return;
    if (!editingArea.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoProduto({
        id: editingArea.id,
        nome: editingArea.nome.trim(),
        ativo: editingArea.ativo
      });
      setIsEditAreaDialogOpen(false);
      setEditingArea(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteArea = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoProduto(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleAreaAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoProduto({
        id,
        ativo: !ativo
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Tipo
  const handleAddTipo = async () => {
    if (!newTipoNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoTarefa(newTipoNome.trim());
      setNewTipoNome('');
      setIsAddTipoDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditTipo = (item: {
    id: string;
    nome: string;
    ativo: boolean;
  }) => {
    setEditingTipo({
      ...item
    });
    setIsEditTipoDialogOpen(true);
  };
  const handleUpdateTipo = async () => {
    if (!editingTipo) return;
    if (!editingTipo.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoTarefa({
        id: editingTipo.id,
        nome: editingTipo.nome.trim(),
        ativo: editingTipo.ativo
      });
      setIsEditTipoDialogOpen(false);
      setEditingTipo(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteTipo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoTarefa(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleTipoAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoTarefa({
        id,
        ativo: !ativo
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Cliente
  const handleAddCliente = async () => {
    if (!newClienteNome.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    try {
      await createRecord.mutateAsync({
        cliente: newClienteNome.trim(),
        vpn_access: [],
        server_access: [],
        docker_access: [],
        database_access: [],
        app_access: []
      });
      setNewClienteNome('');
      setIsAddClienteDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditCliente = (item: {
    id: string;
    cliente: string;
  }) => {
    setEditingCliente({
      ...item
    });
    setIsEditClienteDialogOpen(true);
  };
  const handleUpdateCliente = async () => {
    if (!editingCliente) return;
    if (!editingCliente.cliente.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    try {
      await updateRecord.mutateAsync({
        id: editingCliente.id,
        cliente: editingCliente.cliente.trim(),
        vpn_access: [],
        server_access: [],
        docker_access: [],
        database_access: [],
        app_access: []
      });
      setIsEditClienteDialogOpen(false);
      setEditingCliente(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteCliente = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    try {
      await deleteRecord.mutateAsync(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Prestador de Serviço
  const handleAddPrestador = async () => {
    if (!newPrestadorNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addPrestadorServico({
        nome: newPrestadorNome.trim(),
        email: newPrestadorEmail.trim() || undefined
      });
      setNewPrestadorNome('');
      setNewPrestadorEmail('');
      setIsAddPrestadorDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditPrestador = (item: {
    id: string;
    codigo: number;
    nome: string;
    email: string | null;
  }) => {
    setEditingPrestador({
      ...item
    });
    setIsEditPrestadorDialogOpen(true);
  };
  const handleUpdatePrestador = async () => {
    if (!editingPrestador) return;
    if (!editingPrestador.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updatePrestadorServico({
        id: editingPrestador.id,
        nome: editingPrestador.nome.trim(),
        email: editingPrestador.email?.trim() || undefined
      });
      setIsEditPrestadorDialogOpen(false);
      setEditingPrestador(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeletePrestador = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este prestador?')) return;
    try {
      await deletePrestadorServico(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  return <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cadastros do Sistema</h2>
          <p className="text-muted-foreground mt-1">Gerencie os cadastros utilizados na ferramenta</p>
        </div>

        <Accordion type="single" collapsible defaultValue="area" className="space-y-4">
          {/* Área */}
          <AccordionItem value="area" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Área</span>
                <Badge variant="secondary" className="ml-2">
                  {tiposProduto.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Áreas</CardTitle>
                    <Button onClick={() => setIsAddAreaDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingArea ? <p className="text-muted-foreground">Carregando...</p> : tiposProduto.length === 0 ? <p className="text-muted-foreground">Nenhuma área cadastrada</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ativo</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tiposProduto.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={item.ativo} onCheckedChange={() => handleToggleAreaAtivo(item.id, item.ativo)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditArea(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteArea(item.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Tipo */}
          <AccordionItem value="tipo" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Tipo</span>
                <Badge variant="secondary" className="ml-2">
                  {tiposTarefa.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Tipos</CardTitle>
                    <Button onClick={() => setIsAddTipoDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingTipo ? <p className="text-muted-foreground">Carregando...</p> : tiposTarefa.length === 0 ? <p className="text-muted-foreground">Nenhum tipo cadastrado</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ativo</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tiposTarefa.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={item.ativo} onCheckedChange={() => handleToggleTipoAtivo(item.id, item.ativo)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditTipo(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTipo(item.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Clientes */}
          <AccordionItem value="clientes" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Clientes</span>
                <Badge variant="secondary" className="ml-2">
                  {clientes.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Clientes</CardTitle>
                    <Button onClick={() => setIsAddClienteDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingClientes ? <p className="text-muted-foreground">Carregando...</p> : clientes.length === 0 ? <p className="text-muted-foreground">Nenhum cliente cadastrado</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientes.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.cliente}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditCliente(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCliente(item.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Prestador de Serviço */}
          <AccordionItem value="prestador-servico" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Prestador de Serviço</span>
                <Badge variant="secondary" className="ml-2">
                  {prestadoresServico.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Prestadores de Serviço</CardTitle>
                    <Button onClick={() => setIsAddPrestadorDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingPrestador ? <p className="text-muted-foreground">Carregando...</p> : prestadoresServico.length === 0 ? <p className="text-muted-foreground">Nenhum prestador de serviço cadastrado</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prestadoresServico.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.codigo}</TableCell>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-muted-foreground">{item.email || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditPrestador(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePrestador(item.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Dialog Adicionar Área */}
        <Dialog open={isAddAreaDialogOpen} onOpenChange={setIsAddAreaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Área</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={newAreaNome} onChange={e => setNewAreaNome(e.target.value)} placeholder="Digite o nome da área" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAreaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddArea}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Área */}
        <Dialog open={isEditAreaDialogOpen} onOpenChange={setIsEditAreaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Área</DialogTitle>
            </DialogHeader>
            {editingArea && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editingArea.nome} onChange={e => setEditingArea({
                ...editingArea,
                nome: e.target.value
              })} placeholder="Digite o nome da área" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativo</label>
                  <Switch checked={editingArea.ativo} onCheckedChange={checked => setEditingArea({
                ...editingArea,
                ativo: checked
              })} />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAreaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateArea}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Tipo */}
        <Dialog open={isAddTipoDialogOpen} onOpenChange={setIsAddTipoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Tipo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={newTipoNome} onChange={e => setNewTipoNome(e.target.value)} placeholder="Digite o nome do tipo" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTipoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTipo}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Tipo */}
        <Dialog open={isEditTipoDialogOpen} onOpenChange={setIsEditTipoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tipo</DialogTitle>
            </DialogHeader>
            {editingTipo && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editingTipo.nome} onChange={e => setEditingTipo({
                ...editingTipo,
                nome: e.target.value
              })} placeholder="Digite o nome do tipo" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativo</label>
                  <Switch checked={editingTipo.ativo} onCheckedChange={checked => setEditingTipo({
                ...editingTipo,
                ativo: checked
              })} />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditTipoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateTipo}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Cliente */}
        <Dialog open={isAddClienteDialogOpen} onOpenChange={setIsAddClienteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cliente</label>
                <Input value={newClienteNome} onChange={e => setNewClienteNome(e.target.value)} placeholder="Digite o nome do cliente" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddClienteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCliente}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Cliente */}
        <Dialog open={isEditClienteDialogOpen} onOpenChange={setIsEditClienteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            {editingCliente && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Cliente</label>
                  <Input value={editingCliente.cliente} onChange={e => setEditingCliente({
                ...editingCliente,
                cliente: e.target.value
              })} placeholder="Digite o nome do cliente" />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditClienteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateCliente}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Prestador de Serviço */}
        <Dialog open={isAddPrestadorDialogOpen} onOpenChange={setIsAddPrestadorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Prestador de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={newPrestadorNome} onChange={e => setNewPrestadorNome(e.target.value)} placeholder="Digite o nome" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={newPrestadorEmail} onChange={e => setNewPrestadorEmail(e.target.value)} placeholder="Digite o email" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPrestadorDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPrestador}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Prestador de Serviço */}
        <Dialog open={isEditPrestadorDialogOpen} onOpenChange={setIsEditPrestadorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Prestador de Serviço</DialogTitle>
            </DialogHeader>
            {editingPrestador && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código</label>
                  <Input value={editingPrestador.codigo} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editingPrestador.nome} onChange={e => setEditingPrestador({
                ...editingPrestador,
                nome: e.target.value
              })} placeholder="Digite o nome" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={editingPrestador.email || ''} onChange={e => setEditingPrestador({
                ...editingPrestador,
                email: e.target.value
              })} placeholder="Digite o email" />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPrestadorDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePrestador}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>;
};
export default CadastrosSistema;