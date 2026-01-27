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
import { Plus, Edit, Trash2, Package, Tag, Users, User, FileText, FolderOpen, Building2 } from 'lucide-react';
import { useTipoProduto } from '@/hooks/useTipoProduto';
import { useTipoTarefa } from '@/hooks/useTipoTarefa';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { usePrestadorServico, NIVEL_OPTIONS } from '@/hooks/usePrestadorServico';
import { useTipoDocumento } from '@/hooks/useTipoDocumento';
import { useAreaDocumento } from '@/hooks/useAreaDocumento';
import { useTipoDocumentoCliente } from '@/hooks/useTipoDocumentoCliente';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const {
    tiposDocumento,
    isLoading: isLoadingTipoDoc,
    addTipoDocumento,
    updateTipoDocumento,
    deleteTipoDocumento
  } = useTipoDocumento();
  const {
    areasDocumento,
    isLoading: isLoadingAreaDoc,
    addAreaDocumento,
    updateAreaDocumento,
    deleteAreaDocumento
  } = useAreaDocumento();
  const {
    tiposDocumentoCliente,
    isLoading: isLoadingTipoDocCliente,
    addTipoDocumentoCliente,
    updateTipoDocumentoCliente,
    deleteTipoDocumentoCliente
  } = useTipoDocumentoCliente();

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
    codigo: number;
    cliente: string;
  } | null>(null);

  // Estado para Prestador de Serviço
  const [isAddPrestadorDialogOpen, setIsAddPrestadorDialogOpen] = useState(false);
  const [isEditPrestadorDialogOpen, setIsEditPrestadorDialogOpen] = useState(false);
  const [newPrestadorNome, setNewPrestadorNome] = useState('');
  const [newPrestadorEmail, setNewPrestadorEmail] = useState('');
  const [newPrestadorNivel, setNewPrestadorNivel] = useState('N1');
  const [newPrestadorSetor, setNewPrestadorSetor] = useState('');
  const [editingPrestador, setEditingPrestador] = useState<{
    id: string;
    codigo: number;
    nome: string;
    email: string | null;
    nivel: string | null;
    setor_id: string | null;
  } | null>(null);

  // Estado para Tipo de Documento
  const [isAddTipoDocDialogOpen, setIsAddTipoDocDialogOpen] = useState(false);
  const [isEditTipoDocDialogOpen, setIsEditTipoDocDialogOpen] = useState(false);
  const [newTipoDocNome, setNewTipoDocNome] = useState('');
  const [editingTipoDoc, setEditingTipoDoc] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Área de Documento
  const [isAddAreaDocDialogOpen, setIsAddAreaDocDialogOpen] = useState(false);
  const [isEditAreaDocDialogOpen, setIsEditAreaDocDialogOpen] = useState(false);
  const [newAreaDocNome, setNewAreaDocNome] = useState('');
  const [editingAreaDoc, setEditingAreaDoc] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Tipo de Documento Cliente
  const [isAddTipoDocClienteDialogOpen, setIsAddTipoDocClienteDialogOpen] = useState(false);
  const [isEditTipoDocClienteDialogOpen, setIsEditTipoDocClienteDialogOpen] = useState(false);
  const [newTipoDocClienteNome, setNewTipoDocClienteNome] = useState('');
  const [editingTipoDocCliente, setEditingTipoDocCliente] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
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
    codigo: number;
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
        email: newPrestadorEmail.trim() || undefined,
        nivel: newPrestadorNivel,
        setor_id: newPrestadorSetor || undefined
      });
      setNewPrestadorNome('');
      setNewPrestadorEmail('');
      setNewPrestadorNivel('N1');
      setNewPrestadorSetor('');
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
    nivel: string | null;
    setor_id: string | null;
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
        email: editingPrestador.email?.trim() || undefined,
        nivel: editingPrestador.nivel || 'N1',
        setor_id: editingPrestador.setor_id
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

  // Handlers para Tipo de Documento
  const handleAddTipoDoc = async () => {
    if (!newTipoDocNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoDocumento(newTipoDocNome.trim());
      setNewTipoDocNome('');
      setIsAddTipoDocDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditTipoDoc = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingTipoDoc({ ...item });
    setIsEditTipoDocDialogOpen(true);
  };
  const handleUpdateTipoDoc = async () => {
    if (!editingTipoDoc) return;
    if (!editingTipoDoc.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoDocumento({
        id: editingTipoDoc.id,
        nome: editingTipoDoc.nome.trim(),
        ativo: editingTipoDoc.ativo
      });
      setIsEditTipoDocDialogOpen(false);
      setEditingTipoDoc(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteTipoDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoDocumento(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleTipoDocAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoDocumento({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Área de Documento
  const handleAddAreaDoc = async () => {
    if (!newAreaDocNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addAreaDocumento(newAreaDocNome.trim());
      setNewAreaDocNome('');
      setIsAddAreaDocDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditAreaDoc = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingAreaDoc({ ...item });
    setIsEditAreaDocDialogOpen(true);
  };
  const handleUpdateAreaDoc = async () => {
    if (!editingAreaDoc) return;
    if (!editingAreaDoc.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateAreaDocumento({
        id: editingAreaDoc.id,
        nome: editingAreaDoc.nome.trim(),
        ativo: editingAreaDoc.ativo
      });
      setIsEditAreaDocDialogOpen(false);
      setEditingAreaDoc(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteAreaDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteAreaDocumento(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleAreaDocAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateAreaDocumento({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Tipo de Documento Cliente
  const handleAddTipoDocCliente = async () => {
    if (!newTipoDocClienteNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoDocumentoCliente(newTipoDocClienteNome.trim());
      setNewTipoDocClienteNome('');
      setIsAddTipoDocClienteDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditTipoDocCliente = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingTipoDocCliente({ ...item });
    setIsEditTipoDocClienteDialogOpen(true);
  };
  const handleUpdateTipoDocCliente = async () => {
    if (!editingTipoDocCliente) return;
    if (!editingTipoDocCliente.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoDocumentoCliente({
        id: editingTipoDocCliente.id,
        nome: editingTipoDocCliente.nome.trim(),
        ativo: editingTipoDocCliente.ativo
      });
      setIsEditTipoDocClienteDialogOpen(false);
      setEditingTipoDocCliente(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteTipoDocCliente = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoDocumentoCliente(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleTipoDocClienteAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoDocumentoCliente({ id, ativo: !ativo });
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
                          <TableHead className="w-[80px]">Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientes.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.codigo}</TableCell>
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
                          <TableHead className="w-[100px]">Nível</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prestadoresServico.map(item => {
                          const setor = areasDocumento.find(a => a.id === item.setor_id);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.codigo}</TableCell>
                              <TableCell className="font-medium">{item.nome}</TableCell>
                              <TableCell className="text-muted-foreground">{item.email || '-'}</TableCell>
                              <TableCell className="font-medium">{item.nivel || 'N1'}</TableCell>
                              <TableCell className="text-muted-foreground">{setor?.nome || '-'}</TableCell>
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
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Tipo de Documento */}
          <AccordionItem value="tipo-documento" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Tipo de Documento</span>
                <Badge variant="secondary" className="ml-2">
                  {tiposDocumento.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Tipos de Documento</CardTitle>
                    <Button onClick={() => setIsAddTipoDocDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingTipoDoc ? <p className="text-muted-foreground">Carregando...</p> : tiposDocumento.length === 0 ? <p className="text-muted-foreground">Nenhum tipo de documento cadastrado</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ativo</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tiposDocumento.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={item.ativo} onCheckedChange={() => handleToggleTipoDocAtivo(item.id, item.ativo)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditTipoDoc(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTipoDoc(item.id)}>
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

          {/* Área de Documento */}
          <AccordionItem value="area-documento" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Área de Documento</span>
                <Badge variant="secondary" className="ml-2">
                  {areasDocumento.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Áreas de Documento</CardTitle>
                    <Button onClick={() => setIsAddAreaDocDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingAreaDoc ? <p className="text-muted-foreground">Carregando...</p> : areasDocumento.length === 0 ? <p className="text-muted-foreground">Nenhuma área de documento cadastrada</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ativo</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {areasDocumento.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={item.ativo} onCheckedChange={() => handleToggleAreaDocAtivo(item.id, item.ativo)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditAreaDoc(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAreaDoc(item.id)}>
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

          {/* Tipo de Documento Cliente */}
          <AccordionItem value="tipo-documento-cliente" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Tipo de Documento Cliente</span>
                <Badge variant="secondary" className="ml-2">
                  {tiposDocumentoCliente.length} itens
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lista de Tipos de Documento Cliente</CardTitle>
                    <Button onClick={() => setIsAddTipoDocClienteDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoadingTipoDocCliente ? <p className="text-muted-foreground">Carregando...</p> : tiposDocumentoCliente.length === 0 ? <p className="text-muted-foreground">Nenhum tipo de documento cliente cadastrado</p> : <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="w-[100px] text-center">Ativo</TableHead>
                          <TableHead className="w-[100px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tiposDocumentoCliente.map(item => <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <Switch checked={item.ativo} onCheckedChange={() => handleToggleTipoDocClienteAtivo(item.id, item.ativo)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditTipoDocCliente(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTipoDocCliente(item.id)}>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível</label>
                <Select value={newPrestadorNivel} onValueChange={setNewPrestadorNivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEL_OPTIONS.map(nivel => (
                      <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Setor</label>
                <Select value={newPrestadorSetor} onValueChange={setNewPrestadorSetor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {areasDocumento.filter(a => a.ativo).map(area => (
                      <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nível</label>
                  <Select value={editingPrestador.nivel || 'N1'} onValueChange={nivel => setEditingPrestador({
                ...editingPrestador,
                nivel
              })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVEL_OPTIONS.map(nivel => (
                        <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Setor</label>
                  <Select value={editingPrestador.setor_id || ''} onValueChange={setor_id => setEditingPrestador({
                ...editingPrestador,
                setor_id: setor_id || null
              })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasDocumento.filter(a => a.ativo).map(area => (
                        <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

        {/* Dialog Adicionar Tipo de Documento */}
        <Dialog open={isAddTipoDocDialogOpen} onOpenChange={setIsAddTipoDocDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Tipo de Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={newTipoDocNome} onChange={e => setNewTipoDocNome(e.target.value)} placeholder="Digite o nome do tipo" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTipoDocDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTipoDoc}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Tipo de Documento */}
        <Dialog open={isEditTipoDocDialogOpen} onOpenChange={setIsEditTipoDocDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tipo de Documento</DialogTitle>
            </DialogHeader>
            {editingTipoDoc && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editingTipoDoc.nome} onChange={e => setEditingTipoDoc({
                ...editingTipoDoc,
                nome: e.target.value
              })} placeholder="Digite o nome do tipo" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativo</label>
                  <Switch checked={editingTipoDoc.ativo} onCheckedChange={checked => setEditingTipoDoc({
                ...editingTipoDoc,
                ativo: checked
              })} />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditTipoDocDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateTipoDoc}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Área de Documento */}
        <Dialog open={isAddAreaDocDialogOpen} onOpenChange={setIsAddAreaDocDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Área de Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={newAreaDocNome} onChange={e => setNewAreaDocNome(e.target.value)} placeholder="Digite o nome da área" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAreaDocDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAreaDoc}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Área de Documento */}
        <Dialog open={isEditAreaDocDialogOpen} onOpenChange={setIsEditAreaDocDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Área de Documento</DialogTitle>
            </DialogHeader>
            {editingAreaDoc && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editingAreaDoc.nome} onChange={e => setEditingAreaDoc({
                ...editingAreaDoc,
                nome: e.target.value
              })} placeholder="Digite o nome da área" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativo</label>
                  <Switch checked={editingAreaDoc.ativo} onCheckedChange={checked => setEditingAreaDoc({
                ...editingAreaDoc,
                ativo: checked
              })} />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAreaDocDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateAreaDoc}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Tipo de Documento Cliente */}
        <Dialog open={isAddTipoDocClienteDialogOpen} onOpenChange={setIsAddTipoDocClienteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Tipo de Documento Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={newTipoDocClienteNome} onChange={e => setNewTipoDocClienteNome(e.target.value)} placeholder="Digite o nome do tipo" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTipoDocClienteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTipoDocCliente}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Tipo de Documento Cliente */}
        <Dialog open={isEditTipoDocClienteDialogOpen} onOpenChange={setIsEditTipoDocClienteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tipo de Documento Cliente</DialogTitle>
            </DialogHeader>
            {editingTipoDocCliente && <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editingTipoDocCliente.nome} onChange={e => setEditingTipoDocCliente({
                ...editingTipoDocCliente,
                nome: e.target.value
              })} placeholder="Digite o nome do tipo" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativo</label>
                  <Switch checked={editingTipoDocCliente.ativo} onCheckedChange={checked => setEditingTipoDocCliente({
                ...editingTipoDocCliente,
                ativo: checked
              })} />
                </div>
              </div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditTipoDocClienteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateTipoDocCliente}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>;
};
export default CadastrosSistema;