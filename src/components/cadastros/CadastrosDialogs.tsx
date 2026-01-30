import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CadastrosDialogsProps {
  // Area Sprint (tipo_produto)
  isAddAreaDialogOpen: boolean;
  setIsAddAreaDialogOpen: (open: boolean) => void;
  isEditAreaDialogOpen: boolean;
  setIsEditAreaDialogOpen: (open: boolean) => void;
  newAreaNome: string;
  setNewAreaNome: (nome: string) => void;
  editingArea: any;
  setEditingArea: (area: any) => void;
  handleAddArea: () => void;
  handleUpdateArea: () => void;
  // Tipo Sprint (tipo_tarefa)
  isAddTipoDialogOpen: boolean;
  setIsAddTipoDialogOpen: (open: boolean) => void;
  isEditTipoDialogOpen: boolean;
  setIsEditTipoDialogOpen: (open: boolean) => void;
  newTipoNome: string;
  setNewTipoNome: (nome: string) => void;
  newTipoClienteObrigatorio: boolean;
  setNewTipoClienteObrigatorio: (obrigatorio: boolean) => void;
  editingTipo: any;
  setEditingTipo: (tipo: any) => void;
  handleAddTipo: () => void;
  handleUpdateTipo: () => void;
  // Tipo Documento Cliente
  isAddTipoDocClienteDialogOpen: boolean;
  setIsAddTipoDocClienteDialogOpen: (open: boolean) => void;
  isEditTipoDocClienteDialogOpen: boolean;
  setIsEditTipoDocClienteDialogOpen: (open: boolean) => void;
  newTipoDocClienteNome: string;
  setNewTipoDocClienteNome: (nome: string) => void;
  editingTipoDocCliente: any;
  setEditingTipoDocCliente: (tipo: any) => void;
  handleAddTipoDocCliente: () => void;
  handleUpdateTipoDocCliente: () => void;
  // Prestador de Serviço
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
  handleUpdatePrestador: () => void;
  nivelOptions: readonly string[];
  areasDocumento: any[];
  // Clientes
  isAddClienteDialogOpen: boolean;
  setIsAddClienteDialogOpen: (open: boolean) => void;
  isEditClienteDialogOpen: boolean;
  setIsEditClienteDialogOpen: (open: boolean) => void;
  newClienteNome: string;
  setNewClienteNome: (nome: string) => void;
  newClienteResponsavel: string;
  setNewClienteResponsavel: (responsavel: string) => void;
  editingCliente: any;
  setEditingCliente: (cliente: any) => void;
  handleAddCliente: () => void;
  handleUpdateCliente: () => void;
  profiles: any[];
  // Setor (area_documento)
  isAddAreaDocDialogOpen: boolean;
  setIsAddAreaDocDialogOpen: (open: boolean) => void;
  isEditAreaDocDialogOpen: boolean;
  setIsEditAreaDocDialogOpen: (open: boolean) => void;
  newAreaDocNome: string;
  setNewAreaDocNome: (nome: string) => void;
  editingAreaDoc: any;
  setEditingAreaDoc: (area: any) => void;
  handleAddAreaDoc: () => void;
  handleUpdateAreaDoc: () => void;
  // Tipo de Documento
  isAddTipoDocDialogOpen: boolean;
  setIsAddTipoDocDialogOpen: (open: boolean) => void;
  isEditTipoDocDialogOpen: boolean;
  setIsEditTipoDocDialogOpen: (open: boolean) => void;
  newTipoDocNome: string;
  setNewTipoDocNome: (nome: string) => void;
  editingTipoDoc: any;
  setEditingTipoDoc: (tipo: any) => void;
  handleAddTipoDoc: () => void;
  handleUpdateTipoDoc: () => void;
}

export const CadastrosDialogs = (props: CadastrosDialogsProps) => {
  return (
    <>
      {/* Dialog Adicionar Área Sprint */}
      <Dialog open={props.isAddAreaDialogOpen} onOpenChange={props.setIsAddAreaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Área Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={props.newAreaNome}
                onChange={(e) => props.setNewAreaNome(e.target.value)}
                placeholder="Digite o nome da área sprint"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddAreaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddArea}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Área Sprint */}
      <Dialog open={props.isEditAreaDialogOpen} onOpenChange={props.setIsEditAreaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Área Sprint</DialogTitle>
          </DialogHeader>
          {props.editingArea && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={props.editingArea.nome}
                  onChange={(e) =>
                    props.setEditingArea({ ...props.editingArea, nome: e.target.value })
                  }
                  placeholder="Digite o nome da área sprint"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ativo</label>
                <Switch
                  checked={props.editingArea.ativo}
                  onCheckedChange={(checked) =>
                    props.setEditingArea({ ...props.editingArea, ativo: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditAreaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdateArea}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Tipo Sprint */}
      <Dialog open={props.isAddTipoDialogOpen} onOpenChange={props.setIsAddTipoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tipo Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={props.newTipoNome}
                onChange={(e) => props.setNewTipoNome(e.target.value)}
                placeholder="Digite o nome do tipo sprint"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cliente Obrigatório no Sprint</label>
              <Switch
                checked={props.newTipoClienteObrigatorio}
                onCheckedChange={props.setNewTipoClienteObrigatorio}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddTipoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddTipo}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Tipo Sprint */}
      <Dialog open={props.isEditTipoDialogOpen} onOpenChange={props.setIsEditTipoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo Sprint</DialogTitle>
          </DialogHeader>
          {props.editingTipo && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={props.editingTipo.nome}
                  onChange={(e) =>
                    props.setEditingTipo({ ...props.editingTipo, nome: e.target.value })
                  }
                  placeholder="Digite o nome do tipo sprint"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Cliente Obrigatório no Sprint</label>
                <Switch
                  checked={props.editingTipo.cliente_obrigatorio}
                  onCheckedChange={(checked) =>
                    props.setEditingTipo({ ...props.editingTipo, cliente_obrigatorio: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ativo</label>
                <Switch
                  checked={props.editingTipo.ativo}
                  onCheckedChange={(checked) =>
                    props.setEditingTipo({ ...props.editingTipo, ativo: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditTipoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdateTipo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Tipo Documento Cliente */}
      <Dialog open={props.isAddTipoDocClienteDialogOpen} onOpenChange={props.setIsAddTipoDocClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tipo de Documento Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={props.newTipoDocClienteNome}
                onChange={(e) => props.setNewTipoDocClienteNome(e.target.value)}
                placeholder="Digite o nome do tipo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddTipoDocClienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddTipoDocCliente}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Tipo Documento Cliente */}
      <Dialog open={props.isEditTipoDocClienteDialogOpen} onOpenChange={props.setIsEditTipoDocClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Documento Cliente</DialogTitle>
          </DialogHeader>
          {props.editingTipoDocCliente && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={props.editingTipoDocCliente.nome}
                  onChange={(e) =>
                    props.setEditingTipoDocCliente({ ...props.editingTipoDocCliente, nome: e.target.value })
                  }
                  placeholder="Digite o nome do tipo"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ativo</label>
                <Switch
                  checked={props.editingTipoDocCliente.ativo}
                  onCheckedChange={(checked) =>
                    props.setEditingTipoDocCliente({ ...props.editingTipoDocCliente, ativo: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditTipoDocClienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdateTipoDocCliente}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Prestador de Serviço */}
      <Dialog open={props.isAddPrestadorDialogOpen} onOpenChange={props.setIsAddPrestadorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Prestador de Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={props.newPrestadorNome}
                onChange={(e) => props.setNewPrestadorNome(e.target.value)}
                placeholder="Digite o nome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={props.newPrestadorEmail}
                onChange={(e) => props.setNewPrestadorEmail(e.target.value)}
                placeholder="Digite o email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível</label>
              <Select value={props.newPrestadorNivel} onValueChange={props.setNewPrestadorNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {props.nivelOptions.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor</label>
              <Select value={props.newPrestadorSetor} onValueChange={props.setNewPrestadorSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {props.areasDocumento
                    .filter((a) => a.ativo)
                    .map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddPrestadorDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddPrestador}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Prestador de Serviço */}
      <Dialog open={props.isEditPrestadorDialogOpen} onOpenChange={props.setIsEditPrestadorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Prestador de Serviço</DialogTitle>
          </DialogHeader>
          {props.editingPrestador && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código</label>
                <Input value={props.editingPrestador.codigo} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={props.editingPrestador.nome}
                  onChange={(e) =>
                    props.setEditingPrestador({ ...props.editingPrestador, nome: e.target.value })
                  }
                  placeholder="Digite o nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={props.editingPrestador.email || ''}
                  onChange={(e) =>
                    props.setEditingPrestador({ ...props.editingPrestador, email: e.target.value })
                  }
                  placeholder="Digite o email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível</label>
                <Select
                  value={props.editingPrestador.nivel || 'N1'}
                  onValueChange={(nivel) =>
                    props.setEditingPrestador({ ...props.editingPrestador, nivel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {props.nivelOptions.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Setor</label>
                <Select
                  value={props.editingPrestador.setor_id || ''}
                  onValueChange={(setor_id) =>
                    props.setEditingPrestador({ ...props.editingPrestador, setor_id: setor_id || null })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {props.areasDocumento
                      .filter((a) => a.ativo)
                      .map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditPrestadorDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdatePrestador}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Cliente */}
      <Dialog open={props.isAddClienteDialogOpen} onOpenChange={props.setIsAddClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Cliente</label>
              <Input
                value={props.newClienteNome}
                onChange={(e) => props.setNewClienteNome(e.target.value)}
                placeholder="Digite o nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsável</label>
              <Select value={props.newClienteResponsavel} onValueChange={props.setNewClienteResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {props.profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddClienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddCliente}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Cliente */}
      <Dialog open={props.isEditClienteDialogOpen} onOpenChange={props.setIsEditClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {props.editingCliente && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cliente</label>
                <Input
                  value={props.editingCliente.cliente}
                  onChange={(e) =>
                    props.setEditingCliente({ ...props.editingCliente, cliente: e.target.value })
                  }
                  placeholder="Digite o nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Responsável</label>
                <Select 
                  value={props.editingCliente.responsavel_id || ''} 
                  onValueChange={(value) =>
                    props.setEditingCliente({ ...props.editingCliente, responsavel_id: value || null })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {props.profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditClienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdateCliente}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Setor */}
      <Dialog open={props.isAddAreaDocDialogOpen} onOpenChange={props.setIsAddAreaDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Setor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={props.newAreaDocNome}
                onChange={(e) => props.setNewAreaDocNome(e.target.value)}
                placeholder="Digite o nome do setor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddAreaDocDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddAreaDoc}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Setor */}
      <Dialog open={props.isEditAreaDocDialogOpen} onOpenChange={props.setIsEditAreaDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Setor</DialogTitle>
          </DialogHeader>
          {props.editingAreaDoc && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={props.editingAreaDoc.nome}
                  onChange={(e) =>
                    props.setEditingAreaDoc({ ...props.editingAreaDoc, nome: e.target.value })
                  }
                  placeholder="Digite o nome do setor"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ativo</label>
                <Switch
                  checked={props.editingAreaDoc.ativo}
                  onCheckedChange={(checked) =>
                    props.setEditingAreaDoc({ ...props.editingAreaDoc, ativo: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditAreaDocDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdateAreaDoc}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Tipo de Documento */}
      <Dialog open={props.isAddTipoDocDialogOpen} onOpenChange={props.setIsAddTipoDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tipo de Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={props.newTipoDocNome}
                onChange={(e) => props.setNewTipoDocNome(e.target.value)}
                placeholder="Digite o nome do tipo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsAddTipoDocDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleAddTipoDoc}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Tipo de Documento */}
      <Dialog open={props.isEditTipoDocDialogOpen} onOpenChange={props.setIsEditTipoDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Documento</DialogTitle>
          </DialogHeader>
          {props.editingTipoDoc && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={props.editingTipoDoc.nome}
                  onChange={(e) =>
                    props.setEditingTipoDoc({ ...props.editingTipoDoc, nome: e.target.value })
                  }
                  placeholder="Digite o nome do tipo"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ativo</label>
                <Switch
                  checked={props.editingTipoDoc.ativo}
                  onCheckedChange={(checked) =>
                    props.setEditingTipoDoc({ ...props.editingTipoDoc, ativo: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.setIsEditTipoDocDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={props.handleUpdateTipoDoc}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
