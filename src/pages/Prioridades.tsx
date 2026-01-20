import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { CronogramaTab } from '@/components/prioridades/CronogramaTab';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Prioridades() {
  const { records: clientes, createRecord } = useClientAccessRecords();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClienteNome, setNewClienteNome] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClienteNome.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }
    try {
      const newCliente = await createRecord.mutateAsync({
        cliente: newClienteNome.trim(),
        vpn_access: [],
        server_access: [],
        docker_access: [],
        database_access: [],
        app_access: []
      });
      setSelectedProjectId(newCliente.id);
      setIsDialogOpen(false);
      setNewClienteNome('');
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lista de Prioridades</h1>
            <p className="text-muted-foreground">Gerencie projetos e cronogramas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Projeto</Label>
                  <Input
                    id="nome"
                    value={newClienteNome}
                    onChange={(e) => setNewClienteNome(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Criar Projeto</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <CronogramaTab
          projectId={selectedProjectId}
          clientes={clientes}
          onSelectProject={setSelectedProjectId}
        />
      </div>
    </Layout>
  );
}
