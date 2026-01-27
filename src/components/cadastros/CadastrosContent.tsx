import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, Tag, Users, User, FileText, FolderOpen, Building2 } from 'lucide-react';
import type { CadastroType } from './CadastrosSidebar';

interface CadastrosContentProps {
  selectedCadastro: CadastroType | null;
  // Area Sprint (tipo_produto)
  tiposProduto: any[];
  isLoadingArea: boolean;
  isAddAreaDialogOpen: boolean;
  setIsAddAreaDialogOpen: (open: boolean) => void;
  isEditAreaDialogOpen: boolean;
  setIsEditAreaDialogOpen: (open: boolean) => void;
  newAreaNome: string;
  setNewAreaNome: (nome: string) => void;
  editingArea: any;
  setEditingArea: (area: any) => void;
  handleAddArea: () => void;
  handleEditArea: (item: any) => void;
  handleUpdateArea: () => void;
  handleDeleteArea: (id: string) => void;
  handleToggleAreaAtivo: (id: string, ativo: boolean) => void;
  // Tipo Sprint (tipo_tarefa)
  tiposTarefa: any[];
  isLoadingTipo: boolean;
  isAddTipoDialogOpen: boolean;
  setIsAddTipoDialogOpen: (open: boolean) => void;
  isEditTipoDialogOpen: boolean;
  setIsEditTipoDialogOpen: (open: boolean) => void;
  newTipoNome: string;
  setNewTipoNome: (nome: string) => void;
  editingTipo: any;
  setEditingTipo: (tipo: any) => void;
  handleAddTipo: () => void;
  handleEditTipo: (item: any) => void;
  handleUpdateTipo: () => void;
  handleDeleteTipo: (id: string) => void;
  handleToggleTipoAtivo: (id: string, ativo: boolean) => void;
  // Tipo Documento Cliente
  tiposDocumentoCliente: any[];
  isLoadingTipoDocCliente: boolean;
  isAddTipoDocClienteDialogOpen: boolean;
  setIsAddTipoDocClienteDialogOpen: (open: boolean) => void;
  isEditTipoDocClienteDialogOpen: boolean;
  setIsEditTipoDocClienteDialogOpen: (open: boolean) => void;
  newTipoDocClienteNome: string;
  setNewTipoDocClienteNome: (nome: string) => void;
  editingTipoDocCliente: any;
  setEditingTipoDocCliente: (tipo: any) => void;
  handleAddTipoDocCliente: () => void;
  handleEditTipoDocCliente: (item: any) => void;
  handleUpdateTipoDocCliente: () => void;
  handleDeleteTipoDocCliente: (id: string) => void;
  handleToggleTipoDocClienteAtivo: (id: string, ativo: boolean) => void;
  // Prestador de Serviço
  prestadoresServico: any[];
  isLoadingPrestador: boolean;
  isAddPrestadorDialogOpen: boolean;
  setIsAddPrestadorDialogOpen: (open: boolean) => void;
  isEditPrestadorDialogOpen: boolean;
  setIsEditPrestadorDialogOpen: (open: boolean) => void;
  newPrestadorNome: string;
  setNewPrestadorNome: (nome: string) => void;
  newPrestadorEmail: string;
  setNewPrestadorEmail: (email: string) => void;
  newPrestadorNivel: string;
  setNewPrestadorNivel: (nivel: string) => void;
  newPrestadorSetor: string;
  setNewPrestadorSetor: (setor: string) => void;
  editingPrestador: any;
  setEditingPrestador: (prestador: any) => void;
  handleAddPrestador: () => void;
  handleEditPrestador: (item: any) => void;
  handleUpdatePrestador: () => void;
  handleDeletePrestador: (id: string) => void;
  nivelOptions: readonly string[];
  areasDocumento: any[];
  // Clientes
  clientes: any[];
  isLoadingClientes: boolean;
  isAddClienteDialogOpen: boolean;
  setIsAddClienteDialogOpen: (open: boolean) => void;
  isEditClienteDialogOpen: boolean;
  setIsEditClienteDialogOpen: (open: boolean) => void;
  newClienteNome: string;
  setNewClienteNome: (nome: string) => void;
  editingCliente: any;
  setEditingCliente: (cliente: any) => void;
  handleAddCliente: () => void;
  handleEditCliente: (item: any) => void;
  handleUpdateCliente: () => void;
  handleDeleteCliente: (id: string) => void;
  // Setor (area_documento)
  isLoadingAreaDoc: boolean;
  isAddAreaDocDialogOpen: boolean;
  setIsAddAreaDocDialogOpen: (open: boolean) => void;
  isEditAreaDocDialogOpen: boolean;
  setIsEditAreaDocDialogOpen: (open: boolean) => void;
  newAreaDocNome: string;
  setNewAreaDocNome: (nome: string) => void;
  editingAreaDoc: any;
  setEditingAreaDoc: (area: any) => void;
  handleAddAreaDoc: () => void;
  handleEditAreaDoc: (item: any) => void;
  handleUpdateAreaDoc: () => void;
  handleDeleteAreaDoc: (id: string) => void;
  handleToggleAreaDocAtivo: (id: string, ativo: boolean) => void;
  // Tipo de Documento
  tiposDocumento: any[];
  isLoadingTipoDoc: boolean;
  isAddTipoDocDialogOpen: boolean;
  setIsAddTipoDocDialogOpen: (open: boolean) => void;
  isEditTipoDocDialogOpen: boolean;
  setIsEditTipoDocDialogOpen: (open: boolean) => void;
  newTipoDocNome: string;
  setNewTipoDocNome: (nome: string) => void;
  editingTipoDoc: any;
  setEditingTipoDoc: (tipo: any) => void;
  handleAddTipoDoc: () => void;
  handleEditTipoDoc: (item: any) => void;
  handleUpdateTipoDoc: () => void;
  handleDeleteTipoDoc: (id: string) => void;
  handleToggleTipoDocAtivo: (id: string, ativo: boolean) => void;
}

export const CadastrosContent = (props: CadastrosContentProps) => {
  const { selectedCadastro } = props;

  if (!selectedCadastro) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecione um cadastro no menu lateral</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedCadastro) {
      case 'area-sprint':
        return renderAreaSprint();
      case 'tipo-sprint':
        return renderTipoSprint();
      case 'tipo-documento-cliente':
        return renderTipoDocumentoCliente();
      case 'prestador-servico':
        return renderPrestadorServico();
      case 'clientes':
        return renderClientes();
      case 'setor':
        return renderSetor();
      case 'tipo-documento':
        return renderTipoDocumento();
      default:
        return null;
    }
  };

  // Render Área Sprint
  const renderAreaSprint = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle>Área Sprint</CardTitle>
            <Badge variant="secondary">{props.tiposProduto.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddAreaDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingArea ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.tiposProduto.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma área sprint cadastrada</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px] text-center">Ativo</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.tiposProduto.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={() => props.handleToggleAreaAtivo(item.id, item.ativo)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => props.handleEditArea(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => props.handleDeleteArea(item.id)}>
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
  );

  // Render Tipo Sprint
  const renderTipoSprint = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle>Tipo Sprint</CardTitle>
            <Badge variant="secondary">{props.tiposTarefa.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddTipoDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingTipo ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.tiposTarefa.length === 0 ? (
          <p className="text-muted-foreground">Nenhum tipo sprint cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px] text-center">Ativo</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.tiposTarefa.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={() => props.handleToggleTipoAtivo(item.id, item.ativo)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => props.handleEditTipo(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => props.handleDeleteTipo(item.id)}>
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
  );

  // Render Tipo Documento Cliente
  const renderTipoDocumentoCliente = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Tipo de Documento Cliente</CardTitle>
            <Badge variant="secondary">{props.tiposDocumentoCliente.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddTipoDocClienteDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingTipoDocCliente ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.tiposDocumentoCliente.length === 0 ? (
          <p className="text-muted-foreground">Nenhum tipo de documento cliente cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px] text-center">Ativo</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.tiposDocumentoCliente.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={() => props.handleToggleTipoDocClienteAtivo(item.id, item.ativo)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => props.handleEditTipoDocCliente(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => props.handleDeleteTipoDocCliente(item.id)}>
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
  );

  // Render Prestador de Serviço
  const renderPrestadorServico = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Prestador de Serviço</CardTitle>
            <Badge variant="secondary">{props.prestadoresServico.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddPrestadorDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingPrestador ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.prestadoresServico.length === 0 ? (
          <p className="text-muted-foreground">Nenhum prestador de serviço cadastrado</p>
        ) : (
          <Table>
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
              {props.prestadoresServico.map((item) => {
                const setor = props.areasDocumento.find((a) => a.id === item.setor_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.codigo}</TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{item.email || '-'}</TableCell>
                    <TableCell className="font-medium">{item.nivel || 'N1'}</TableCell>
                    <TableCell className="text-muted-foreground">{setor?.nome || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => props.handleEditPrestador(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => props.handleDeletePrestador(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  // Render Clientes
  const renderClientes = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Clientes</CardTitle>
            <Badge variant="secondary">{props.clientes.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddClienteDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingClientes ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.clientes.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.clientes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell className="font-medium">{item.cliente}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => props.handleEditCliente(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => props.handleDeleteCliente(item.id)}>
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
  );

  // Render Setor
  const renderSetor = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <CardTitle>Setor</CardTitle>
            <Badge variant="secondary">{props.areasDocumento.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddAreaDocDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingAreaDoc ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.areasDocumento.length === 0 ? (
          <p className="text-muted-foreground">Nenhum setor cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px] text-center">Ativo</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.areasDocumento.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={() => props.handleToggleAreaDocAtivo(item.id, item.ativo)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => props.handleEditAreaDoc(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => props.handleDeleteAreaDoc(item.id)}>
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
  );

  // Render Tipo de Documento
  const renderTipoDocumento = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Tipo de Documento</CardTitle>
            <Badge variant="secondary">{props.tiposDocumento.length} itens</Badge>
          </div>
          <Button onClick={() => props.setIsAddTipoDocDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {props.isLoadingTipoDoc ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : props.tiposDocumento.length === 0 ? (
          <p className="text-muted-foreground">Nenhum tipo de documento cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px] text-center">Ativo</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.tiposDocumento.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={() => props.handleToggleTipoDocAtivo(item.id, item.ativo)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => props.handleEditTipoDoc(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => props.handleDeleteTipoDoc(item.id)}>
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
  );

  return (
    <div className="flex-1 p-6 overflow-auto">
      {renderContent()}
    </div>
  );
};
