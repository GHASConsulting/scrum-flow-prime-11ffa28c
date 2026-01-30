import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Circle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type StatusColor = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

interface ClienteStatus {
  id: string;
  codigo: number;
  nome: string;
  geral: StatusColor;
  metodologia: StatusColor;
  prioridades: StatusColor;
  produtividade: StatusColor;
  riscos: StatusColor;
}

interface SummaryStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: 'geral' | 'metodologia' | 'prioridades' | 'produtividade' | 'riscos';
  fieldLabel: string;
  clientes: ClienteStatus[];
  summaryStatus: StatusColor;
}

const getStatusColor = (status: StatusColor): string => {
  switch (status) {
    case 'verde':
      return 'text-green-500';
    case 'amarelo':
      return 'text-yellow-500';
    case 'vermelho':
      return 'text-red-500';
    case 'cinza':
      return 'text-gray-400';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: StatusColor): string => {
  switch (status) {
    case 'verde':
      return 'Verde';
    case 'amarelo':
      return 'Amarelo';
    case 'vermelho':
      return 'Vermelho';
    case 'cinza':
      return 'Cinza (Sem dados)';
    default:
      return status;
  }
};

export const SummaryStatusDialog = ({
  open,
  onOpenChange,
  field,
  fieldLabel,
  clientes,
  summaryStatus,
}: SummaryStatusDialogProps) => {
  // Calculate statistics
  const statuses = clientes.map(c => c[field]);
  const totalClientes = clientes.length;
  
  const greenCount = statuses.filter(s => s === 'verde').length;
  const yellowCount = statuses.filter(s => s === 'amarelo').length;
  const redCount = statuses.filter(s => s === 'vermelho').length;
  const grayCount = statuses.filter(s => s === 'cinza').length;
  
  const measuredTotal = totalClientes - grayCount;
  const yellowOrRedCount = yellowCount + redCount;
  
  const yellowOrRedPercent = measuredTotal > 0 ? ((yellowOrRedCount / measuredTotal) * 100).toFixed(1) : '0';
  const redPercent = measuredTotal > 0 ? ((redCount / measuredTotal) * 100).toFixed(1) : '0';

  // Determine which rule was applied
  const getAppliedRule = (): string => {
    if (measuredTotal === 0) {
      return 'Nenhum cliente com dados mensurados - exibindo cinza';
    }
    
    const yellowOrRedPct = (yellowOrRedCount / measuredTotal) * 100;
    const redPct = (redCount / measuredTotal) * 100;
    
    if (redPct >= 10) {
      return `≥10% dos clientes estão exclusivamente vermelho (${redPercent}%) - exibindo vermelho`;
    }
    
    if (yellowOrRedPct >= 18) {
      return `≥18% dos clientes estão amarelo ou vermelho (${yellowOrRedPercent}%) - exibindo vermelho`;
    }
    
    if (yellowOrRedPct >= 10) {
      return `≥10% dos clientes estão amarelo ou vermelho (${yellowOrRedPercent}%) - exibindo amarelo`;
    }
    
    return 'Todos os clientes estão dentro dos parâmetros - exibindo verde';
  };

  // Get clients with issues (yellow or red)
  const clientesWithIssues = clientes.filter(c => c[field] === 'amarelo' || c[field] === 'vermelho');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Circle className={`h-5 w-5 fill-current ${getStatusColor(summaryStatus)}`} />
            Resumo do Indicador: {fieldLabel}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Rules Section */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Regras do Farol Consolidado</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <span className="text-red-500 font-medium">Vermelho</span>: ≥10% exclusivamente vermelho OU ≥18% amarelo/vermelho</li>
              <li>• <span className="text-yellow-500 font-medium">Amarelo</span>: ≥10% amarelo ou vermelho</li>
              <li>• <span className="text-green-500 font-medium">Verde</span>: Menos de 10% amarelo/vermelho</li>
              <li>• <span className="text-gray-400 font-medium">Cinza</span>: Nenhum dado mensurado</li>
            </ul>
          </div>

          {/* Applied Rule */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Regra Aplicada</h4>
            <p className="text-sm">{getAppliedRule()}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-500/10 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                <span className="text-sm font-medium">Verde</span>
              </div>
              <span className="text-lg font-bold">{greenCount}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({measuredTotal > 0 ? ((greenCount / measuredTotal) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">Amarelo</span>
              </div>
              <span className="text-lg font-bold">{yellowCount}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({measuredTotal > 0 ? ((yellowCount / measuredTotal) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Circle className="h-3 w-3 fill-red-500 text-red-500" />
                <span className="text-sm font-medium">Vermelho</span>
              </div>
              <span className="text-lg font-bold">{redCount}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({measuredTotal > 0 ? ((redCount / measuredTotal) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="bg-gray-500/10 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
                <span className="text-sm font-medium">Sem dados</span>
              </div>
              <span className="text-lg font-bold">{grayCount}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({totalClientes > 0 ? ((grayCount / totalClientes) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>

          {/* Total Info */}
          <div className="text-sm text-muted-foreground text-center">
            Total de clientes filtrados: <span className="font-medium">{totalClientes}</span> | 
            Com dados mensurados: <span className="font-medium">{measuredTotal}</span>
          </div>

          {/* Clients with Issues */}
          {clientesWithIssues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Clientes com Atenção ({clientesWithIssues.length})</h4>
              <div className="max-h-48 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-16">Código</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesWithIssues.map(cliente => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.codigo}</TableCell>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Circle className={`h-3 w-3 fill-current ${getStatusColor(cliente[field])}`} />
                            <span className="text-sm">{getStatusLabel(cliente[field])}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
