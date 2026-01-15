import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useRiscos, type RiscoInsert, type Risco } from '@/hooks/useRiscos';
import { useProfiles } from '@/hooks/useProfiles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const AREAS_IMPACTADAS = ['Delivery', 'Comercial', 'Financeiro', 'CS/CX', 'TI', 'Operação'];
const TIPOS_RISCO_GHAS = ['GHAS - Perda de Contrato', 'GHAS - Multa Contratual', 'GHAS - Jurídico'];
const TIPOS_RISCO_CLIENTE = ['CLIENTE - Financeiro', 'CLIENTE - Assistencial', 'CLIENTE - Jurídico'];
const PROBABILIDADES = ['Baixa', 'Média', 'Alta'];
const IMPACTOS = ['Baixa', 'Média', 'Alta'];
const ORIGENS_RISCO = ['Interno GHAS', 'Cliente', 'Fornecedor', 'Contrato'];
const STATUS_RISCO = ['Aberto', 'Em mitigação', 'Mitigado', 'Materializado'];
const IMPACTOS_REAIS = ['Prazo', 'Financeiro', 'Qualidade', 'Cliente', 'Operação'];

const getNivelRiscoDisplay = (nivel: string) => {
  switch (nivel) {
    case 'Alto':
      return { emoji: '🔴', color: 'text-red-600' };
    case 'Médio':
      return { emoji: '🟡', color: 'text-yellow-600' };
    case 'Baixo':
      return { emoji: '🟢', color: 'text-green-600' };
    default:
      return { emoji: '', color: '' };
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Aberto':
      return 'bg-red-100 text-red-800';
    case 'Em mitigação':
      return 'bg-yellow-100 text-yellow-800';
    case 'Mitigado':
      return 'bg-green-100 text-green-800';
    case 'Materializado':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Riscos() {
  const { riscos, loading, addRisco, updateRisco, deleteRisco } = useRiscos();
  const { profiles } = useProfiles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisco, setEditingRisco] = useState<Risco | null>(null);
  const [viewingRisco, setViewingRisco] = useState<Risco | null>(null);
  const [tipoIdentificacao, setTipoIdentificacao] = useState<'Risco' | 'BO'>('Risco');
  
  const [formData, setFormData] = useState<RiscoInsert>({
    projeto: '',
    area_impactada: '',
    tipo_risco_ghas: '',
    tipo_risco_cliente: '',
    descricao: '',
    probabilidade: '',
    impacto: '',
    origem_risco: '',
    responsavel: null,
    plano_mitigacao: null,
    status_risco: 'Aberto',
    data_identificacao: new Date().toISOString().split('T')[0],
    data_limite_acao: null,
    comentario_acompanhamento: null,
    historico: null,
    risco_ocorreu: false,
    impacto_real_ocorrido: null,
    licao_aprendida: null,
  });

  const resetForm = () => {
    setFormData({
      projeto: '',
      area_impactada: '',
      tipo_risco_ghas: '',
      tipo_risco_cliente: '',
      descricao: '',
      probabilidade: '',
      impacto: '',
      origem_risco: '',
      responsavel: null,
      plano_mitigacao: null,
      status_risco: 'Aberto',
      data_identificacao: new Date().toISOString().split('T')[0],
      data_limite_acao: null,
      comentario_acompanhamento: null,
      historico: null,
      risco_ocorreu: false,
      impacto_real_ocorrido: null,
      licao_aprendida: null,
    });
    setEditingRisco(null);
    setTipoIdentificacao('Risco');
  };

  const handleOpenDialog = (risco?: Risco) => {
    if (risco) {
      setEditingRisco(risco);
      setFormData({
        projeto: risco.projeto,
        area_impactada: risco.area_impactada,
        tipo_risco_ghas: risco.tipo_risco_ghas,
        tipo_risco_cliente: risco.tipo_risco_cliente,
        descricao: risco.descricao,
        probabilidade: risco.probabilidade,
        impacto: risco.impacto,
        origem_risco: risco.origem_risco,
        responsavel: risco.responsavel,
        plano_mitigacao: risco.plano_mitigacao,
        status_risco: risco.status_risco,
        data_identificacao: risco.data_identificacao,
        data_limite_acao: risco.data_limite_acao,
        comentario_acompanhamento: risco.comentario_acompanhamento,
        historico: risco.historico,
        risco_ocorreu: risco.risco_ocorreu || false,
        impacto_real_ocorrido: risco.impacto_real_ocorrido,
        licao_aprendida: risco.licao_aprendida,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRisco) {
        await updateRisco(editingRisco.id, formData);
      } else {
        await addRisco(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRisco(id);
  };

  const riscosAbertos = riscos.filter(r => r.status_risco === 'Aberto' || r.status_risco === 'Em mitigação');
  const riscosResolvidos = riscos.filter(r => r.status_risco === 'Mitigado' || r.status_risco === 'Materializado');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Riscos/BO</h1>
            <p className="text-muted-foreground">Gerencie os riscos e BOs do projeto</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRisco ? 'Editar Risco' : 'Novo Risco'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bloco 1: Identificação */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">1. Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Identificação *</Label>
                      <RadioGroup 
                        value={tipoIdentificacao} 
                        onValueChange={(value) => setTipoIdentificacao(value as 'Risco' | 'BO')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Risco" id="tipo-risco" />
                          <Label htmlFor="tipo-risco" className="font-normal cursor-pointer">Risco (Possibilidade de Ocorrência)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="BO" id="tipo-bo" />
                          <Label htmlFor="tipo-bo" className="font-normal cursor-pointer">BO (Registro de Ocorrência)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projeto">Projeto *</Label>
                        <Input
                          id="projeto"
                          placeholder="Ex: Cliente / Instituição"
                          value={formData.projeto}
                          onChange={(e) => setFormData({ ...formData, projeto: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area_impactada">Área Impactada *</Label>
                        <Select
                          value={formData.area_impactada}
                          onValueChange={(value) => setFormData({ ...formData, area_impactada: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                          <SelectContent>
                            {AREAS_IMPACTADAS.map((area) => (
                              <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo_risco_ghas">Tipo de Risco GHAS *</Label>
                        <Select
                          value={formData.tipo_risco_ghas}
                          onValueChange={(value) => setFormData({ ...formData, tipo_risco_ghas: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_RISCO_GHAS.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo_risco_cliente">Tipo de Risco Cliente *</Label>
                        <Select
                          value={formData.tipo_risco_cliente}
                          onValueChange={(value) => setFormData({ ...formData, tipo_risco_cliente: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_RISCO_CLIENTE.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição do Risco *</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Ex: Dependência de retorno do cliente para liberação de acesso ao ambiente."
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 2: Avaliação */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">2. Avaliação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="probabilidade">Probabilidade *</Label>
                        <Select
                          value={formData.probabilidade}
                          onValueChange={(value) => setFormData({ ...formData, probabilidade: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROBABILIDADES.map((prob) => (
                              <SelectItem key={prob} value={prob}>{prob}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impacto">Impacto *</Label>
                        <Select
                          value={formData.impacto}
                          onValueChange={(value) => setFormData({ ...formData, impacto: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {IMPACTOS.map((imp) => (
                              <SelectItem key={imp} value={imp}>{imp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nível de Risco (calculado)</Label>
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                          {formData.probabilidade && formData.impacto ? (
                            (() => {
                              const nivel = 
                                (formData.probabilidade === 'Alta' && formData.impacto === 'Alta') ||
                                (formData.probabilidade === 'Alta' && formData.impacto === 'Média') ||
                                (formData.probabilidade === 'Média' && formData.impacto === 'Alta')
                                  ? 'Alto'
                                  : (formData.probabilidade === 'Baixa' && formData.impacto === 'Baixa') ||
                                    (formData.probabilidade === 'Baixa' && formData.impacto === 'Média') ||
                                    (formData.probabilidade === 'Média' && formData.impacto === 'Baixa')
                                    ? 'Baixo'
                                    : 'Médio';
                              const { emoji, color } = getNivelRiscoDisplay(nivel);
                              return <span className={color}>{emoji} {nivel}</span>;
                            })()
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 3: Responsabilidade e Ação */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">3. Responsabilidade e Ação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="origem_risco">Origem do Risco *</Label>
                        <Select
                          value={formData.origem_risco}
                          onValueChange={(value) => setFormData({ ...formData, origem_risco: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIGENS_RISCO.map((origem) => (
                              <SelectItem key={origem} value={origem}>{origem}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsavel">Responsável pelo Risco</Label>
                        <Select
                          value={formData.responsavel || ''}
                          onValueChange={(value) => setFormData({ ...formData, responsavel: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.nome}>{profile.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plano_mitigacao">Plano de Mitigação</Label>
                      <Textarea
                        id="plano_mitigacao"
                        placeholder="O que será feito para reduzir ou evitar o risco"
                        value={formData.plano_mitigacao || ''}
                        onChange={(e) => setFormData({ ...formData, plano_mitigacao: e.target.value || null })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status_risco">Status do Risco *</Label>
                      <Select
                        value={formData.status_risco}
                        onValueChange={(value) => setFormData({ ...formData, status_risco: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_RISCO.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 4: Tempo e Controle */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">4. Tempo e Controle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Identificação *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.data_identificacao && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.data_identificacao
                                ? format(new Date(formData.data_identificacao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione a data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.data_identificacao ? new Date(formData.data_identificacao + 'T00:00:00') : undefined}
                              onSelect={(date) => setFormData({ ...formData, data_identificacao: date ? format(date, 'yyyy-MM-dd') : '' })}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Data Limite para Ação</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.data_limite_acao && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.data_limite_acao
                                ? format(new Date(formData.data_limite_acao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione a data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.data_limite_acao ? new Date(formData.data_limite_acao + 'T00:00:00') : undefined}
                              onSelect={(date) => setFormData({ ...formData, data_limite_acao: date ? format(date, 'yyyy-MM-dd') : null })}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comentario_acompanhamento">Comentário de Acompanhamento</Label>
                      <Textarea
                        id="comentario_acompanhamento"
                        placeholder="Adicione comentários sobre o acompanhamento do risco"
                        value={formData.comentario_acompanhamento || ''}
                        onChange={(e) => setFormData({ ...formData, comentario_acompanhamento: e.target.value || null })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="historico">Histórico</Label>
                      <Textarea
                        id="historico"
                        placeholder="Campo livre para histórico curto"
                        value={formData.historico || ''}
                        onChange={(e) => setFormData({ ...formData, historico: e.target.value || null })}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 5: Resultado */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">5. Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="risco_ocorreu"
                        checked={formData.risco_ocorreu || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, risco_ocorreu: checked })}
                      />
                      <Label htmlFor="risco_ocorreu">O risco ocorreu?</Label>
                    </div>
                    
                    {formData.risco_ocorreu && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="impacto_real_ocorrido">Impacto Real Ocorrido</Label>
                          <Select
                            value={formData.impacto_real_ocorrido || ''}
                            onValueChange={(value) => setFormData({ ...formData, impacto_real_ocorrido: value || null })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o impacto" />
                            </SelectTrigger>
                            <SelectContent>
                              {IMPACTOS_REAIS.map((impacto) => (
                                <SelectItem key={impacto} value={impacto}>{impacto}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licao_aprendida">Lição Aprendida</Label>
                          <Textarea
                            id="licao_aprendida"
                            placeholder="O que foi aprendido com este risco?"
                            value={formData.licao_aprendida || ''}
                            onChange={(e) => setFormData({ ...formData, licao_aprendida: e.target.value || null })}
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full">
                  {editingRisco ? 'Salvar Alterações' : 'Registrar Risco'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="registro" className="w-full">
          <TabsList>
            <TabsTrigger value="registro">Registro de Riscos</TabsTrigger>
            <TabsTrigger value="acompanhamento">Acompanhamento dos Riscos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registro">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Riscos Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : riscos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum risco registrado ainda.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Projeto</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Nível</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Data Identificação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riscos.map((risco) => {
                          const { emoji, color } = getNivelRiscoDisplay(risco.nivel_risco);
                          return (
                            <TableRow key={risco.id}>
                              <TableCell className="font-medium">{risco.projeto}</TableCell>
                              <TableCell>{risco.area_impactada}</TableCell>
                              <TableCell className="max-w-xs truncate">{risco.descricao}</TableCell>
                              <TableCell>
                                <span className={color}>{emoji} {risco.nivel_risco}</span>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(risco.status_risco)}`}>
                                  {risco.status_risco}
                                </span>
                              </TableCell>
                              <TableCell>{risco.responsavel || '-'}</TableCell>
                              <TableCell>
                                {format(new Date(risco.data_identificacao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewingRisco(risco)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDialog(risco)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir este risco? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(risco.id)}>
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="acompanhamento">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Riscos em Aberto / Em Mitigação ({riscosAbertos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {riscosAbertos.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum risco em aberto ou em mitigação.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Projeto</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Nível</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Limite</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Última Atualização</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {riscosAbertos.map((risco) => {
                            const { emoji, color } = getNivelRiscoDisplay(risco.nivel_risco);
                            return (
                              <TableRow key={risco.id}>
                                <TableCell className="font-medium">{risco.projeto}</TableCell>
                                <TableCell className="max-w-xs truncate">{risco.descricao}</TableCell>
                                <TableCell>
                                  <span className={color}>{emoji} {risco.nivel_risco}</span>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(risco.status_risco)}`}>
                                    {risco.status_risco}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {risco.data_limite_acao
                                    ? format(new Date(risco.data_limite_acao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                    : '-'}
                                </TableCell>
                                <TableCell>{risco.responsavel || '-'}</TableCell>
                                <TableCell>
                                  {format(new Date(risco.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Riscos Resolvidos ({riscosResolvidos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {riscosResolvidos.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum risco resolvido ainda.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Projeto</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Status Final</TableHead>
                            <TableHead>Risco Ocorreu?</TableHead>
                            <TableHead>Impacto Real</TableHead>
                            <TableHead>Lição Aprendida</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {riscosResolvidos.map((risco) => (
                            <TableRow key={risco.id}>
                              <TableCell className="font-medium">{risco.projeto}</TableCell>
                              <TableCell className="max-w-xs truncate">{risco.descricao}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(risco.status_risco)}`}>
                                  {risco.status_risco}
                                </span>
                              </TableCell>
                              <TableCell>{risco.risco_ocorreu ? 'Sim' : 'Não'}</TableCell>
                              <TableCell>{risco.impacto_real_ocorrido || '-'}</TableCell>
                              <TableCell className="max-w-xs truncate">{risco.licao_aprendida || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog para visualização detalhada */}
        <Dialog open={!!viewingRisco} onOpenChange={() => setViewingRisco(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Risco</DialogTitle>
            </DialogHeader>
            {viewingRisco && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Projeto:</strong> {viewingRisco.projeto}</div>
                    <div><strong>Área Impactada:</strong> {viewingRisco.area_impactada}</div>
                    <div><strong>Tipo Risco GHAS:</strong> {viewingRisco.tipo_risco_ghas}</div>
                    <div><strong>Tipo Risco Cliente:</strong> {viewingRisco.tipo_risco_cliente}</div>
                    <div className="col-span-2"><strong>Descrição:</strong> {viewingRisco.descricao}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Avaliação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-sm">
                    <div><strong>Probabilidade:</strong> {viewingRisco.probabilidade}</div>
                    <div><strong>Impacto:</strong> {viewingRisco.impacto}</div>
                    <div>
                      <strong>Nível:</strong>{' '}
                      <span className={getNivelRiscoDisplay(viewingRisco.nivel_risco).color}>
                        {getNivelRiscoDisplay(viewingRisco.nivel_risco).emoji} {viewingRisco.nivel_risco}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Responsabilidade e Ação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Origem:</strong> {viewingRisco.origem_risco}</div>
                      <div><strong>Responsável:</strong> {viewingRisco.responsavel || '-'}</div>
                    </div>
                    <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(viewingRisco.status_risco)}`}>{viewingRisco.status_risco}</span></div>
                    <div><strong>Plano de Mitigação:</strong> {viewingRisco.plano_mitigacao || '-'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tempo e Controle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Data Identificação:</strong> {format(new Date(viewingRisco.data_identificacao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}</div>
                      <div><strong>Data Limite:</strong> {viewingRisco.data_limite_acao ? format(new Date(viewingRisco.data_limite_acao + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }) : '-'}</div>
                    </div>
                    <div><strong>Última Atualização:</strong> {format(new Date(viewingRisco.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                    <div><strong>Comentário:</strong> {viewingRisco.comentario_acompanhamento || '-'}</div>
                    <div><strong>Histórico:</strong> {viewingRisco.historico || '-'}</div>
                  </CardContent>
                </Card>
                {viewingRisco.risco_ocorreu && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Resultado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Risco Ocorreu:</strong> Sim</div>
                      <div><strong>Impacto Real:</strong> {viewingRisco.impacto_real_ocorrido || '-'}</div>
                      <div><strong>Lição Aprendida:</strong> {viewingRisco.licao_aprendida || '-'}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
