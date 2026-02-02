import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, Eye, GraduationCap, Search, ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { useTreinamentos, Treinamento, TreinamentoInsert, TreinamentoUpdate, ParticipanteInput, TreinamentoParticipante } from '@/hooks/useTreinamentos';
import { useDocumentos } from '@/hooks/useDocumentos';
import { usePrestadorServico } from '@/hooks/usePrestadorServico';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

const SharepointTreinamentos = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador';
  
  const { treinamentos, isLoading, fetchParticipantes, addTreinamento, updateTreinamento, deleteTreinamento, isAdding, isUpdating } = useTreinamentos();
  const { documentos } = useDocumentos();
  const { prestadoresServico } = usePrestadorServico();

  // Dialogs state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null);
  const [selectedParticipantes, setSelectedParticipantes] = useState<TreinamentoParticipante[]>([]);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDataInicio, setFilterDataInicio] = useState<string>('');
  const [filterDataFim, setFilterDataFim] = useState<string>('');

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleColumnSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Form state
  const [formData, setFormData] = useState<{
    nome: string;
    data_treinamento: string;
    ministrado_por_id: string;
    descricao: string;
    status: string;
    documento_id: string;
    participantes: ParticipanteInput[];
  }>({
    nome: '',
    data_treinamento: new Date().toISOString().split('T')[0],
    ministrado_por_id: '',
    descricao: '',
    status: 'nao_concluido',
    documento_id: '',
    participantes: [],
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      data_treinamento: new Date().toISOString().split('T')[0],
      ministrado_por_id: '',
      descricao: '',
      status: 'nao_concluido',
      documento_id: '',
      participantes: [],
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = async (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    
    // Fetch participantes
    try {
      const participantes = await fetchParticipantes(treinamento.id);
      setFormData({
        nome: treinamento.nome,
        data_treinamento: treinamento.data_treinamento,
        ministrado_por_id: treinamento.ministrado_por_id || '',
        descricao: treinamento.descricao || '',
        status: treinamento.status,
        documento_id: treinamento.documento_id || '',
        participantes: participantes.map(p => ({
          prestador_id: p.prestador_id,
          capacitado: p.capacitado,
        })),
      });
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      setFormData({
        nome: treinamento.nome,
        data_treinamento: treinamento.data_treinamento,
        ministrado_por_id: treinamento.ministrado_por_id || '',
        descricao: treinamento.descricao || '',
        status: treinamento.status,
        documento_id: treinamento.documento_id || '',
        participantes: [],
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleOpenView = async (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    try {
      const participantes = await fetchParticipantes(treinamento.id);
      setSelectedParticipantes(participantes);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      setSelectedParticipantes([]);
    }
    setIsViewDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do Treinamento é obrigatório');
      return;
    }
    if (!formData.data_treinamento) {
      toast.error('Data do Treinamento é obrigatória');
      return;
    }
    if (!formData.ministrado_por_id) {
      toast.error('Ministrado Por é obrigatório');
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error('Descrição do Treinamento é obrigatória');
      return;
    }
    if (!formData.documento_id) {
      toast.error('Documento Vinculado é obrigatório');
      return;
    }
    if (formData.participantes.length === 0) {
      toast.error('Selecione pelo menos um participante');
      return;
    }

    try {
      const treinamento: TreinamentoInsert = {
        nome: formData.nome.trim(),
        data_treinamento: formData.data_treinamento,
        ministrado_por_id: formData.ministrado_por_id || null,
        descricao: formData.descricao.trim() || null,
        status: formData.status,
        documento_id: formData.documento_id || null,
      };

      await addTreinamento({ treinamento, participantes: formData.participantes });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar treinamento:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTreinamento) return;
    if (!formData.nome.trim()) {
      toast.error('Nome do Treinamento é obrigatório');
      return;
    }
    if (!formData.data_treinamento) {
      toast.error('Data do Treinamento é obrigatória');
      return;
    }
    if (!formData.ministrado_por_id) {
      toast.error('Ministrado Por é obrigatório');
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error('Descrição do Treinamento é obrigatória');
      return;
    }
    if (!formData.documento_id) {
      toast.error('Documento Vinculado é obrigatório');
      return;
    }
    if (formData.participantes.length === 0) {
      toast.error('Selecione pelo menos um participante');
      return;
    }

    try {
      const updateData: TreinamentoUpdate = {
        id: selectedTreinamento.id,
        nome: formData.nome.trim(),
        data_treinamento: formData.data_treinamento,
        ministrado_por_id: formData.ministrado_por_id || null,
        descricao: formData.descricao.trim() || null,
        status: formData.status,
        documento_id: formData.documento_id || null,
      };

      await updateTreinamento({ treinamento: updateData, participantes: formData.participantes });
      setIsEditDialogOpen(false);
      setSelectedTreinamento(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar treinamento:', error);
    }
  };

  const handleDelete = async (treinamento: Treinamento) => {
    if (!confirm('Tem certeza que deseja remover este treinamento?')) return;
    
    try {
      await deleteTreinamento({ id: treinamento.id, arquivoPath: treinamento.arquivo_path });
    } catch (error) {
      console.error('Erro ao remover treinamento:', error);
    }
  };

  // Função removida - agora usa documento vinculado ao invés de arquivo direto

  // Toggle participant in the list
  const toggleParticipante = (prestadorId: string) => {
    setFormData(prev => {
      const exists = prev.participantes.find(p => p.prestador_id === prestadorId);
      if (exists) {
        return {
          ...prev,
          participantes: prev.participantes.filter(p => p.prestador_id !== prestadorId),
        };
      } else {
        return {
          ...prev,
          participantes: [...prev.participantes, { prestador_id: prestadorId, capacitado: false }],
        };
      }
    });
  };

  // Toggle capacitado status
  const toggleCapacitado = (prestadorId: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.map(p => 
        p.prestador_id === prestadorId ? { ...p, capacitado: !p.capacitado } : p
      ),
    }));
  };

  // Filtered treinamentos
  const filteredTreinamentos = useMemo(() => {
    let filtered = [...treinamentos];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.nome.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Date range filter
    if (filterDataInicio) {
      filtered = filtered.filter(t => t.data_treinamento >= filterDataInicio);
    }
    if (filterDataFim) {
      filtered = filtered.filter(t => t.data_treinamento <= filterDataFim);
    }

    // Column sorting
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortColumn) {
          case 'nome':
            comparison = a.nome.localeCompare(b.nome);
            break;
          case 'data':
            comparison = new Date(a.data_treinamento).getTime() - new Date(b.data_treinamento).getTime();
            break;
          case 'ministrado_por':
            comparison = (a.ministrado_por?.nome || '').localeCompare(b.ministrado_por?.nome || '');
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          default:
            comparison = 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sorting by date descending
      filtered.sort((a, b) => new Date(b.data_treinamento).getTime() - new Date(a.data_treinamento).getTime());
    }

    return filtered;
  }, [treinamentos, searchTerm, filterStatus, filterDataInicio, filterDataFim, sortColumn, sortDirection]);

  const renderParticipantesForm = () => (
    <div className="grid gap-2">
      <Label>Lista de Prestadores *</Label>
      <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
        {prestadoresServico.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum prestador cadastrado</p>
        ) : (
          <div className="space-y-2">
            {prestadoresServico.map(prestador => {
              const isSelected = formData.participantes.some(p => p.prestador_id === prestador.id);
              const participante = formData.participantes.find(p => p.prestador_id === prestador.id);
              
              return (
                <div key={prestador.id} className="flex items-center justify-between gap-4 p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleParticipante(prestador.id)}
                    />
                    <span className="text-sm">{prestador.nome}</span>
                    {prestador.nivel && (
                      <Badge variant="outline" className="text-xs">{prestador.nivel}</Badge>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Capacitado:</Label>
                      <Select 
                        value={participante?.capacitado ? 'sim' : 'nao'} 
                        onValueChange={(v) => {
                          setFormData(prev => ({
                            ...prev,
                            participantes: prev.participantes.map(p => 
                              p.prestador_id === prestador.id ? { ...p, capacitado: v === 'sim' } : p
                            ),
                          }));
                        }}
                      >
                        <SelectTrigger className="w-20 h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {formData.participantes.length} prestador(es) selecionado(s)
      </p>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Treinamentos GHAS</h2>
            <p className="text-muted-foreground mt-1">Materiais de treinamento da GHAS</p>
          </div>
          {isAdmin && (
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Treinamento
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="relative">
                <Label className="text-xs text-muted-foreground mb-1 block">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="nao_concluido">Não Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Data Treinamento - Início</Label>
                <Input
                  type="date"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Data Treinamento - Fim</Label>
                <Input
                  type="date"
                  value={filterDataFim}
                  onChange={(e) => setFilterDataFim(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treinamentos Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredTreinamentos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {treinamentos.length === 0 ? 'Nenhum treinamento cadastrado' : 'Nenhum treinamento encontrado com os filtros aplicados'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">ID</TableHead>
                    <TableHead className="text-center w-40">Ações</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('nome')}>
                      <div className="flex items-center">
                        Nome
                        {getSortIcon('nome')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('data')}>
                      <div className="flex items-center">
                        Data do Treinamento
                        {getSortIcon('data')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('ministrado_por')}>
                      <div className="flex items-center">
                        Ministrado Por
                        {getSortIcon('ministrado_por')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('status')}>
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreinamentos.map(treinamento => (
                    <TableRow key={treinamento.id}>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {treinamento.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenView(treinamento)} title="Visualizar Detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(treinamento)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(treinamento)} title="Excluir">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          {treinamento.nome}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(treinamento.data_treinamento)}</TableCell>
                      <TableCell>{treinamento.ministrado_por?.nome || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={treinamento.status === 'concluido' ? 'default' : 'secondary'}>
                          {treinamento.status === 'concluido' ? 'Concluído' : 'Não Concluído'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {filteredTreinamentos.length > 0 && (
              <div className="flex justify-end pt-4 border-t mt-4">
                <span className="text-sm text-muted-foreground">
                  Total de treinamentos: <strong>{filteredTreinamentos.length}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Treinamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Treinamento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome do treinamento"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="data">Data do Treinamento *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data_treinamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_treinamento: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ministrado_por">Ministrado Por *</Label>
                <Select 
                  value={formData.ministrado_por_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, ministrado_por_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestadoresServico.map(prestador => (
                      <SelectItem key={prestador.id} value={prestador.id}>{prestador.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição do Treinamento *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do treinamento"
                rows={3}
              />
            </div>
            {renderParticipantesForm()}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="nao_concluido">Não Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="documento">Documento Vinculado *</Label>
                <Select 
                  value={formData.documento_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, documento_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentos.filter(d => d.status === 'ativo').map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.codigo} - {doc.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Treinamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome">Nome do Treinamento *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome do treinamento"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-data">Data do Treinamento *</Label>
                <Input
                  id="edit-data"
                  type="date"
                  value={formData.data_treinamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_treinamento: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ministrado_por">Ministrado Por *</Label>
                <Select 
                  value={formData.ministrado_por_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, ministrado_por_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestadoresServico.map(prestador => (
                      <SelectItem key={prestador.id} value={prestador.id}>{prestador.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descricao">Descrição do Treinamento *</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do treinamento"
                rows={3}
              />
            </div>
            {renderParticipantesForm()}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="nao_concluido">Não Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-documento">Documento Vinculado *</Label>
                <Select 
                  value={formData.documento_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, documento_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentos.filter(d => d.status === 'ativo').map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.codigo} - {doc.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTreinamento?.documento && (
                  <p className="text-xs text-muted-foreground">
                    Documento atual: {selectedTreinamento.documento.codigo} - {selectedTreinamento.documento.nome}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Treinamento</DialogTitle>
          </DialogHeader>
          {selectedTreinamento && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <p className="font-medium">{selectedTreinamento.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Data do Treinamento</Label>
                  <p className="font-medium">{formatDate(selectedTreinamento.data_treinamento)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Ministrado Por</Label>
                  <p className="font-medium">{selectedTreinamento.ministrado_por?.nome || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge variant={selectedTreinamento.status === 'concluido' ? 'default' : 'secondary'}>
                    {selectedTreinamento.status === 'concluido' ? 'Concluído' : 'Não Concluído'}
                  </Badge>
                </div>
              </div>
              {selectedTreinamento.descricao && (
                <div>
                  <Label className="text-muted-foreground text-xs">Descrição</Label>
                  <p className="font-medium">{selectedTreinamento.descricao}</p>
                </div>
              )}
              {selectedTreinamento.documento && (
                <div>
                  <Label className="text-muted-foreground text-xs">Documento Vinculado</Label>
                  <p className="font-medium">{selectedTreinamento.documento.codigo} - {selectedTreinamento.documento.nome}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs mb-2 block">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participantes ({selectedParticipantes.length})
                  </div>
                </Label>
                {selectedParticipantes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum participante registrado</p>
                ) : (
                  <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                    {selectedParticipantes.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{p.prestador?.nome}</span>
                          {p.prestador?.nivel && (
                            <Badge variant="outline" className="text-xs">{p.prestador.nivel}</Badge>
                          )}
                        </div>
                        <Badge variant={p.capacitado ? 'default' : 'secondary'} className="text-xs">
                          {p.capacitado ? 'Capacitado' : 'Não Capacitado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SharepointTreinamentos;
