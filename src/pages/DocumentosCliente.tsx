import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, FileText, Download, Building2 } from 'lucide-react';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { useDocumentoCliente } from '@/hooks/useDocumentoCliente';
import { useTipoDocumentoCliente } from '@/hooks/useTipoDocumentoCliente';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msword',
  'application/vnd.ms-powerpoint',
];

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx', 'xls', 'doc', 'ppt'];

const DocumentosCliente = () => {
  const { records: clientes, isLoading: isLoadingClientes } = useClientAccessRecords();
  const { activeTipos, isLoading: isLoadingTipos } = useTipoDocumentoCliente();
  
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const { documentos, isLoading: isLoadingDocs, addDocumento, deleteDocumento, getFileUrl } = useDocumentoCliente(selectedClienteId);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_documento_cliente_id: '',
    data_publicacao: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo_documento_cliente_id: '',
      data_publicacao: format(new Date(), 'yyyy-MM-dd'),
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error('Tipo de arquivo não permitido. Use: PDF, DOCX, PPTX, XLSX');
      e.target.value = '';
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error('Tipo de arquivo não permitido. Use: PDF, DOCX, PPTX, XLSX');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill name if empty
    if (!formData.nome) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, nome: nameWithoutExt }));
    }
  };

  const handleAdd = async () => {
    if (!selectedClienteId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (!formData.nome) {
      toast.error('Informe o nome do documento');
      return;
    }

    if (!formData.tipo_documento_cliente_id) {
      toast.error('Selecione o tipo de documento');
      return;
    }

    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    if (!formData.data_publicacao) {
      toast.error('Informe a data de publicação');
      return;
    }

    try {
      await addDocumento({
        cliente_id: selectedClienteId,
        tipo_documento_cliente_id: formData.tipo_documento_cliente_id,
        nome: formData.nome,
        file: selectedFile,
        data_publicacao: formData.data_publicacao,
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string, arquivo_path: string) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) return;
    try {
      await deleteDocumento({ id, arquivo_path });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDownload = (path: string, nome: string) => {
    const url = getFileUrl(path);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Documentos do Cliente</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os documentos relacionados aos projetos de cada cliente
          </p>
        </div>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Selecione o Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.codigo} - {cliente.cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section - Only show if client is selected */}
        {selectedClienteId && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos de {selectedCliente?.cliente}
              </CardTitle>
              <Button onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento do Cliente
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingDocs || isLoadingClientes || isLoadingTipos ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : documentos.length === 0 ? (
                <p className="text-muted-foreground">Nenhum documento encontrado para este cliente</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Data Publicação</TableHead>
                      <TableHead className="w-[120px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentos.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.codigo}</TableCell>
                        <TableCell className="font-medium">{doc.nome}</TableCell>
                        <TableCell>{doc.tipo_documento_cliente?.nome || '-'}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {doc.arquivo_nome} ({doc.arquivo_tipo})
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(doc.data_publicacao)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc.arquivo_path, doc.arquivo_nome)}
                              title="Baixar arquivo"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id, doc.arquivo_path)}
                              title="Remover documento"
                            >
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
        )}

        {/* Add Document Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Documento do Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input
                  value={selectedCliente ? `${selectedCliente.codigo} - ${selectedCliente.cliente}` : ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Documento *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Documento Cliente *</Label>
                <Select
                  value={formData.tipo_documento_cliente_id}
                  onValueChange={(value) => setFormData({ ...formData, tipo_documento_cliente_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTipos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeTipos.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum tipo cadastrado. Acesse Administração → Cadastros para adicionar.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo (PDF, DOCX, PPTX, XLSX) *</Label>
                <Input
                  id="arquivo"
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.pptx,.xlsx,.xls,.doc,.ppt"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_publicacao">Data de Publicação *</Label>
                <Input
                  id="data_publicacao"
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
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

export default DocumentosCliente;
