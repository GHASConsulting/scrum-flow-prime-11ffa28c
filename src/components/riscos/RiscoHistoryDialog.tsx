import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus } from 'lucide-react';
import { useRiscoHistory, RiscoHistoryEntry } from '@/hooks/useRiscoHistory';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

interface RiscoHistoryDialogProps {
  riscoId: string | null;
  riscoDescricao: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RiscoHistoryDialog({ riscoId, riscoDescricao, open, onOpenChange }: RiscoHistoryDialogProps) {
  const { history, loading, addHistoryEntry, deleteHistoryEntry } = useRiscoHistory(riscoId);
  const { user, userName } = useAuth();
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const zonedDate = toZonedTime(date, BRAZIL_TIMEZONE);
      return format(zonedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !riscoId) return;

    setSaving(true);
    try {
      const userDisplayName = userName || user?.email || 'Usuário';
      await addHistoryEntry(newDescription.trim(), userDisplayName);
      setNewDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Acompanhamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Risco info */}
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-xs text-muted-foreground">Risco</Label>
            <p className="text-sm mt-1">{riscoDescricao}</p>
          </div>

          {/* New entry form */}
          <form onSubmit={handleSubmit} className="space-y-3 border-b pb-4">
            <div className="space-y-2">
              <Label htmlFor="new-history">Novo Registro de Acompanhamento</Label>
              <Textarea
                id="new-history"
                placeholder="Descreva o acompanhamento realizado..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Registrando como: {userName || user?.email || 'Usuário'}
              </span>
              <Button type="submit" disabled={saving || !newDescription.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Adicionar Registro'}
              </Button>
            </div>
          </form>

          {/* History list */}
          <div className="space-y-2">
            <Label>Registros Anteriores</Label>
            {loading ? (
              <div className="py-4 text-center text-muted-foreground">
                Carregando histórico...
              </div>
            ) : history.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                Nenhum registro de acompanhamento encontrado.
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {history.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="p-3 border rounded-lg space-y-2 bg-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{entry.descricao}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este registro de histórico?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteHistoryEntry(entry.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(entry.created_at)}</span>
                        <span>•</span>
                        <span>{entry.usuario}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
