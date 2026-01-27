import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Eye, Download, FileText, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useDocumentos, Documento, DocumentoInsert, DocumentoUpdate } from '@/hooks/useDocumentos';
import { useTipoDocumento } from '@/hooks/useTipoDocumento';
import { useAreaDocumento } from '@/hooks/useAreaDocumento';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

const SharepointDocumentos = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrador';
  
  const { documentos, isLoading, uploadFile, getFileUrl, addDocumento, updateDocumento, deleteDocumento, isAdding, isUpdating } = useDocumentos();
  const { tiposDocumento } = useTipoDocumento();
  const { areasDocumento } = useAreaDocumento();

  // Dialogs state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
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
    tipo_documento_id: string;
    setores_ids: string[];
    versao: string;
    descricao: string;
    data_publicacao: string;
    status: 'ativo' | 'inativo';
    file: File | null;
  }>({
    nome: '',
    tipo_documento_id: '',
    setores_ids: [],
    versao: '',
    descricao: '',
    data_publicacao: new Date().toISOString().split('T')[0],
    status: 'ativo',
    file: null,
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo_documento_id: '',
      setores_ids: [],
      versao: '',
      descricao: '',
      data_publicacao: new Date().toISOString().split('T')[0],
      status: 'ativo',
      file: null,
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (doc: Documento) => {
    setSelectedDocumento(doc);
    setFormData({
      nome: doc.nome,
      tipo_documento_id: doc.tipo_documento_id || '',
      setores_ids: doc.setores_ids || [],
      versao: doc.versao || '',
      descricao: doc.descricao || '',
      data_publicacao: doc.data_publicacao,
      status: doc.status,
      file: null,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenView = (doc: Documento) => {
    setSelectedDocumento(doc);
    setIsViewDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.tipo_documento_id) {
      toast.error('Tipo de Documento é obrigatório');
      return;
    }
    if (!formData.versao.trim()) {
      toast.error('Versão é obrigatória');
      return;
    }
    if (!formData.descricao.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    if (!formData.data_publicacao) {
      toast.error('Data de Publicação é obrigatória');
      return;
    }
    if (!formData.file) {
      toast.error('Arquivo é obrigatório');
      return;
    }
    if (formData.setores_ids.length === 0) {
      toast.error('Selecione pelo menos um Setor Destino');
      return;
    }

    try {
      const fileInfo = await uploadFile(formData.file);
      
      const documento: DocumentoInsert = {
        nome: formData.nome.trim(),
        tipo_documento_id: formData.tipo_documento_id || null,
        setores_ids: formData.setores_ids,
        versao: formData.versao.trim() || null,
        descricao: formData.descricao.trim() || null,
        data_publicacao: formData.data_publicacao,
        status: formData.status,
        arquivo_path: fileInfo.path,
        arquivo_nome: fileInfo.name,
        arquivo_tipo: fileInfo.type,
      };

      await addDocumento(documento);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDocumento) return;
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const updateData: DocumentoUpdate = {
        id: selectedDocumento.id,
        nome: formData.nome.trim(),
        tipo_documento_id: formData.tipo_documento_id || null,
        setores_ids: formData.setores_ids,
        versao: formData.versao.trim() || null,
        descricao: formData.descricao.trim() || null,
        data_publicacao: formData.data_publicacao,
        status: formData.status,
      };

      // If new file uploaded, replace the old one
      if (formData.file) {
        const fileInfo = await uploadFile(formData.file);
        updateData.arquivo_path = fileInfo.path;
        updateData.arquivo_nome = fileInfo.name;
        updateData.arquivo_tipo = fileInfo.type;
      }

      await updateDocumento(updateData);
      setIsEditDialogOpen(false);
      setSelectedDocumento(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
    }
  };

  const handleDelete = async (doc: Documento) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) return;
    
    try {
      await deleteDocumento({ id: doc.id, arquivoPath: doc.arquivo_path });
    } catch (error) {
      console.error('Erro ao remover documento:', error);
    }
  };

  const handleDownload = (doc: Documento) => {
    const url = getFileUrl(doc.arquivo_path);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.arquivo_nome;
    link.click();
  };

  const handleViewFile = (doc: Documento) => {
    const url = getFileUrl(doc.arquivo_path);
    
    // PDFs open in a new tab for viewing
    if (doc.arquivo_tipo === 'application/pdf') {
      window.open(url, '_blank');
    } else {
      // Other formats trigger download
      handleDownload(doc);
    }
  };

  // Filtered documents
  const filteredDocumentos = useMemo(() => {
    let filtered = [...documentos];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.nome.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterTipo !== 'all') {
      filtered = filtered.filter(doc => doc.tipo_documento_id === filterTipo);
    }

    // Area/Setor filter
    if (filterArea !== 'all') {
      filtered = filtered.filter(doc => doc.setores_ids?.includes(filterArea));
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    // Date range filter
    if (filterDataInicio) {
      filtered = filtered.filter(doc => doc.data_publicacao >= filterDataInicio);
    }
    if (filterDataFim) {
      filtered = filtered.filter(doc => doc.data_publicacao <= filterDataFim);
    }

    // Column sorting
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortColumn) {
          case 'nome':
            comparison = a.nome.localeCompare(b.nome);
            break;
          case 'tipo':
            comparison = (a.tipo_documento?.nome || '').localeCompare(b.tipo_documento?.nome || '');
            break;
          case 'setor':
            comparison = (a.area_documento?.nome || '').localeCompare(b.area_documento?.nome || '');
            break;
          case 'versao':
            comparison = (a.versao || '').localeCompare(b.versao || '');
            break;
          case 'data':
            comparison = new Date(a.data_publicacao).getTime() - new Date(b.data_publicacao).getTime();
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
      filtered.sort((a, b) => new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime());
    }

    return filtered;
  }, [documentos, searchTerm, filterTipo, filterArea, filterStatus, filterDataInicio, filterDataFim, sortColumn, sortDirection]);

  const activeTipos = tiposDocumento.filter(t => t.ativo);
  const activeAreas = areasDocumento.filter(a => a.ativo);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Documentos GHAS</h2>
            <p className="text-muted-foreground mt-1">Documentos institucionais da GHAS</p>
          </div>
          {isAdmin && (
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
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
                <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {activeTipos.map(tipo => (
                      <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Setor</Label>
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {activeAreas.map(area => (
                      <SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Data Publicação - Início</Label>
                <Input
                  type="date"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Data Publicação - Fim</Label>
                <Input
                  type="date"
                  value={filterDataFim}
                  onChange={(e) => setFilterDataFim(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredDocumentos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {documentos.length === 0 ? 'Nenhum documento cadastrado' : 'Nenhum documento encontrado com os filtros aplicados'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">ID</TableHead>
                    <TableHead className="text-center w-32">Ações</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('nome')}>
                      <div className="flex items-center">
                        Nome
                        {getSortIcon('nome')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('tipo')}>
                      <div className="flex items-center">
                        Tipo
                        {getSortIcon('tipo')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('setor')}>
                      <div className="flex items-center">
                        Setores Destino
                        {getSortIcon('setor')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('versao')}>
                      <div className="flex items-center">
                        Versão
                        {getSortIcon('versao')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleColumnSort('data')}>
                      <div className="flex items-center">
                        Data de Publicação
                        {getSortIcon('data')}
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
                  {filteredDocumentos.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {doc.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewFile(doc)} title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(doc)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} title="Excluir">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.nome}
                        </div>
                      </TableCell>
                      <TableCell>{doc.tipo_documento?.nome || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.setores_ids && doc.setores_ids.length > 0 ? (
                            doc.setores_ids.map(setorId => {
                              const setor = areasDocumento.find(a => a.id === setorId);
                              return setor ? (
                                <Badge key={setorId} variant="outline" className="text-xs">
                                  {setor.nome}
                                </Badge>
                              ) : null;
                            })
                          ) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{doc.versao || '-'}</TableCell>
                      <TableCell>{formatDate(doc.data_publicacao)}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'ativo' ? 'default' : 'secondary'}>
                          {doc.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {filteredDocumentos.length > 0 && (
              <div className="flex justify-end pt-4 border-t mt-4">
                <span className="text-sm text-muted-foreground">
                  Total de documentos: <strong>{filteredDocumentos.length}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Documento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Documento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome do documento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Documento</Label>
              <Select 
                value={formData.tipo_documento_id} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_documento_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {activeTipos.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arquivo">Arquivo *</Label>
              <Input
                id="arquivo"
                type="file"
                accept=".pdf,.docx,.pptx,.xlsx"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
              <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, DOCX, PPTX, XLSX</p>
            </div>
            <div className="grid gap-2">
              <Label>Setores Destino</Label>
              <ScrollArea className="h-32 border rounded-md p-3">
                <div className="space-y-2">
                  {activeAreas.map(area => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`setor-add-${area.id}`}
                        checked={formData.setores_ids.includes(area.id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            setores_ids: checked 
                              ? [...prev.setores_ids, area.id]
                              : prev.setores_ids.filter(id => id !== area.id)
                          }));
                        }}
                      />
                      <label htmlFor={`setor-add-${area.id}`} className="text-sm cursor-pointer">
                        {area.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {formData.setores_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.setores_ids.map(id => {
                    const setor = activeAreas.find(a => a.id === id);
                    return setor ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {setor.nome}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="versao">Versão</Label>
                <Input
                  id="versao"
                  value={formData.versao}
                  onChange={(e) => setFormData(prev => ({ ...prev, versao: e.target.value }))}
                  placeholder="Ex: 1.0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data">Data de Publicação</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_publicacao: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as 'ativo' | 'inativo' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do documento"
                rows={3}
              />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome">Nome do Documento *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome do documento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tipo">Tipo de Documento</Label>
              <Select 
                value={formData.tipo_documento_id} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_documento_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {activeTipos.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-arquivo">Arquivo (deixe vazio para manter o atual)</Label>
              <Input
                id="edit-arquivo"
                type="file"
                accept=".pdf,.docx,.pptx,.xlsx"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
              {selectedDocumento && (
                <p className="text-xs text-muted-foreground">
                  Arquivo atual: {selectedDocumento.arquivo_nome}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Setores Destino</Label>
              <ScrollArea className="h-32 border rounded-md p-3">
                <div className="space-y-2">
                  {activeAreas.map(area => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`setor-edit-${area.id}`}
                        checked={formData.setores_ids.includes(area.id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            setores_ids: checked 
                              ? [...prev.setores_ids, area.id]
                              : prev.setores_ids.filter(id => id !== area.id)
                          }));
                        }}
                      />
                      <label htmlFor={`setor-edit-${area.id}`} className="text-sm cursor-pointer">
                        {area.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {formData.setores_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.setores_ids.map(id => {
                    const setor = activeAreas.find(a => a.id === id);
                    return setor ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {setor.nome}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-versao">Versão</Label>
                <Input
                  id="edit-versao"
                  value={formData.versao}
                  onChange={(e) => setFormData(prev => ({ ...prev, versao: e.target.value }))}
                  placeholder="Ex: 1.0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-data">Data de Publicação</Label>
                <Input
                  id="edit-data"
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_publicacao: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as 'ativo' | 'inativo' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do documento"
                rows={3}
              />
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
    </Layout>
  );
};

export default SharepointDocumentos;
