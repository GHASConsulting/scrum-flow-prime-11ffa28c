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
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useTipoProduto } from '@/hooks/useTipoProduto';
import { toast } from 'sonner';

const CadastrosSistema = () => {
  const { tiposProduto, isLoading, addTipoProduto, updateTipoProduto, deleteTipoProduto } = useTipoProduto();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: string; nome: string; ativo: boolean } | null>(null);

  const handleAdd = async () => {
    if (!newNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await addTipoProduto(newNome.trim());
      setNewNome('');
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    if (!editingItem.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateTipoProduto({
        id: editingItem.id,
        nome: editingItem.nome.trim(),
        ativo: editingItem.ativo
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;

    try {
      await deleteTipoProduto(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoProduto({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cadastros do Sistema</h2>
          <p className="text-muted-foreground mt-1">Gerencie os cadastros utilizados na ferramenta</p>
        </div>

        <Accordion type="single" collapsible defaultValue="area" className="space-y-4">
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
                    <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {isLoading ? (
                    <p className="text-muted-foreground">Carregando...</p>
                  ) : tiposProduto.length === 0 ? (
                    <p className="text-muted-foreground">Nenhuma área cadastrada</p>
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
                        {tiposProduto.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={item.ativo}
                                onCheckedChange={() => handleToggleAtivo(item.id, item.ativo)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(item.id)}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Dialog Adicionar */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Área</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Digite o nome da área"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Área</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={editingItem.nome}
                    onChange={(e) => setEditingItem({ ...editingItem, nome: e.target.value })}
                    placeholder="Digite o nome da área"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativo</label>
                  <Switch
                    checked={editingItem.ativo}
                    onCheckedChange={(checked) => setEditingItem({ ...editingItem, ativo: checked })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CadastrosSistema;
