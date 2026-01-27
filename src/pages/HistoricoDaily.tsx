import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, History, X } from 'lucide-react';
import { useDailies } from '@/hooks/useDailies';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { cn } from '@/lib/utils';

const HistoricoDailyPage = () => {
  const { dailies } = useDailies();
  const { records: clientes } = useClientAccessRecords();
  
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('all');
  const [filtroData, setFiltroData] = useState<Date | undefined>();

  // Filtrar dailies
  const filteredDailies = selectedCliente 
    ? dailies.filter(d => {
        if (d.cliente_id !== selectedCliente) return false;
        
        // Filtro por responsável
        if (filtroResponsavel !== 'all' && d.usuario !== filtroResponsavel) return false;
        
        // Filtro por data
        if (filtroData) {
          const dailyDate = format(parseISO(d.data), 'yyyy-MM-dd');
          const filterDate = format(filtroData, 'yyyy-MM-dd');
          if (dailyDate !== filterDate) return false;
        }
        
        return true;
      }).sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      )
    : [];

  // Lista única de responsáveis para o filtro
  const responsaveisUnicos = selectedCliente
    ? Array.from(new Set(
        dailies.filter(d => d.cliente_id === selectedCliente).map(d => d.usuario)
      ))
    : [];

  const handleClearFilters = () => {
    setFiltroResponsavel('all');
    setFiltroData(undefined);
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.cliente || 'Cliente não encontrado';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Histórico de Dailies</h2>
          <p className="text-muted-foreground mt-1">Consulte os registros de dailies por cliente</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Select 
                  value={filtroResponsavel} 
                  onValueChange={setFiltroResponsavel}
                  disabled={!selectedCliente}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {responsaveisUnicos.map(resp => (
                      <SelectItem key={resp} value={resp}>
                        {resp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Data do Registro</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!selectedCliente}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtroData && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtroData ? format(filtroData, "dd/MM/yyyy", { locale: ptBR }) : <span>Todas as datas</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtroData}
                      onSelect={setFiltroData}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedCliente && (filtroResponsavel !== 'all' || filtroData) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registros Encontrados ({filteredDailies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCliente ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecione um cliente para visualizar o histórico
                </p>
              </div>
            ) : filteredDailies.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma daily encontrada com os filtros selecionados
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredDailies.map((daily) => (
                  <div key={daily.id} className="p-4 border rounded-lg space-y-3 bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{daily.usuario}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(daily.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">O que foi feito ontem</p>
                        <p className="text-sm">{daily.ontem}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">O que será feito hoje</p>
                        <p className="text-sm">{daily.hoje}</p>
                      </div>

                      {daily.impedimentos && (
                        <div>
                          <p className="text-xs font-medium text-destructive">Impedimentos</p>
                          <p className="text-sm text-destructive">{daily.impedimentos}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HistoricoDailyPage;
