import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type ScheduleTask = Tables<'schedule_task'>;

interface TaskHistoryDialogProps {
  task: ScheduleTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskId: string, notes: string) => Promise<void>;
}

export function TaskHistoryDialog({ task, open, onOpenChange, onSave }: TaskHistoryDialogProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setNotes(task.notes || '');
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    
    setSaving(true);
    try {
      await onSave(task.id, notes);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Histórico e Andamento da Tarefa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-id">ID</Label>
              <Input 
                id="task-id" 
                value={task.order_index + 1} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div className="col-span-3 space-y-2">
              <Label htmlFor="task-name">Nome da Tarefa</Label>
              <Input 
                id="task-name" 
                value={task.name} 
                disabled 
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-notes">Histórico / Andamento</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Registre aqui o histórico e andamento da tarefa..."
              className="min-h-[200px]"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
