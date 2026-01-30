import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useTipoProduto } from '@/hooks/useTipoProduto';
import { useTipoTarefa } from '@/hooks/useTipoTarefa';
import { useClientAccessRecords } from '@/hooks/useClientAccessRecords';
import { usePrestadorServico, NIVEL_OPTIONS } from '@/hooks/usePrestadorServico';
import { useTipoDocumento } from '@/hooks/useTipoDocumento';
import { useAreaDocumento } from '@/hooks/useAreaDocumento';
import { useTipoDocumentoCliente } from '@/hooks/useTipoDocumentoCliente';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { CadastrosSidebar, type CadastroType } from '@/components/cadastros/CadastrosSidebar';
import { CadastrosContent } from '@/components/cadastros/CadastrosContent';
import { CadastrosDialogs } from '@/components/cadastros/CadastrosDialogs';

const CadastrosSistema = () => {
  const [selectedCadastro, setSelectedCadastro] = useState<CadastroType | null>(null);

  const {
    tiposProduto,
    isLoading: isLoadingArea,
    addTipoProduto,
    updateTipoProduto,
    deleteTipoProduto
  } = useTipoProduto();
  const {
    tiposTarefa,
    isLoading: isLoadingTipo,
    addTipoTarefa,
    updateTipoTarefa,
    deleteTipoTarefa
  } = useTipoTarefa();
  const {
    records: clientes,
    isLoading: isLoadingClientes,
    createRecord,
    updateRecord,
    deleteRecord,
    toggleAtivo: toggleClienteAtivo
  } = useClientAccessRecords(true); // includeInactive=true para mostrar todos no cadastro
  const {
    prestadoresServico,
    isLoading: isLoadingPrestador,
    addPrestadorServico,
    updatePrestadorServico,
    deletePrestadorServico
  } = usePrestadorServico();
  const {
    tiposDocumento,
    isLoading: isLoadingTipoDoc,
    addTipoDocumento,
    updateTipoDocumento,
    deleteTipoDocumento
  } = useTipoDocumento();
  const {
    areasDocumento,
    isLoading: isLoadingAreaDoc,
    addAreaDocumento,
    updateAreaDocumento,
    deleteAreaDocumento
  } = useAreaDocumento();
  const {
    tiposDocumentoCliente,
    isLoading: isLoadingTipoDocCliente,
    addTipoDocumentoCliente,
    updateTipoDocumentoCliente,
    deleteTipoDocumentoCliente
  } = useTipoDocumentoCliente();
  const { profiles } = useProfiles();
  // Estado para Área Sprint
  const [isAddAreaDialogOpen, setIsAddAreaDialogOpen] = useState(false);
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false);
  const [newAreaNome, setNewAreaNome] = useState('');
  const [editingArea, setEditingArea] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Tipo Sprint
  const [isAddTipoDialogOpen, setIsAddTipoDialogOpen] = useState(false);
  const [isEditTipoDialogOpen, setIsEditTipoDialogOpen] = useState(false);
  const [newTipoNome, setNewTipoNome] = useState('');
  const [newTipoClienteObrigatorio, setNewTipoClienteObrigatorio] = useState(false);
  const [editingTipo, setEditingTipo] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
    cliente_obrigatorio: boolean;
  } | null>(null);

  // Estado para Cliente
  const [isAddClienteDialogOpen, setIsAddClienteDialogOpen] = useState(false);
  const [isEditClienteDialogOpen, setIsEditClienteDialogOpen] = useState(false);
  const [newClienteNome, setNewClienteNome] = useState('');
  const [newClienteResponsavel, setNewClienteResponsavel] = useState('');
  const [editingCliente, setEditingCliente] = useState<{
    id: string;
    codigo: number;
    cliente: string;
    ativo: boolean;
    responsavel_id: string | null;
  } | null>(null);

  // Estado para Prestador de Serviço
  const [isAddPrestadorDialogOpen, setIsAddPrestadorDialogOpen] = useState(false);
  const [isEditPrestadorDialogOpen, setIsEditPrestadorDialogOpen] = useState(false);
  const [newPrestadorNome, setNewPrestadorNome] = useState('');
  const [newPrestadorEmail, setNewPrestadorEmail] = useState('');
  const [newPrestadorNivel, setNewPrestadorNivel] = useState('N1');
  const [newPrestadorSetor, setNewPrestadorSetor] = useState('');
  const [editingPrestador, setEditingPrestador] = useState<{
    id: string;
    codigo: number;
    nome: string;
    email: string | null;
    nivel: string | null;
    setor_id: string | null;
  } | null>(null);

  // Estado para Tipo de Documento
  const [isAddTipoDocDialogOpen, setIsAddTipoDocDialogOpen] = useState(false);
  const [isEditTipoDocDialogOpen, setIsEditTipoDocDialogOpen] = useState(false);
  const [newTipoDocNome, setNewTipoDocNome] = useState('');
  const [editingTipoDoc, setEditingTipoDoc] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Setor (Área de Documento)
  const [isAddAreaDocDialogOpen, setIsAddAreaDocDialogOpen] = useState(false);
  const [isEditAreaDocDialogOpen, setIsEditAreaDocDialogOpen] = useState(false);
  const [newAreaDocNome, setNewAreaDocNome] = useState('');
  const [editingAreaDoc, setEditingAreaDoc] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Estado para Tipo de Documento Cliente
  const [isAddTipoDocClienteDialogOpen, setIsAddTipoDocClienteDialogOpen] = useState(false);
  const [isEditTipoDocClienteDialogOpen, setIsEditTipoDocClienteDialogOpen] = useState(false);
  const [newTipoDocClienteNome, setNewTipoDocClienteNome] = useState('');
  const [editingTipoDocCliente, setEditingTipoDocCliente] = useState<{
    id: string;
    nome: string;
    ativo: boolean;
  } | null>(null);

  // Handlers para Área Sprint
  const handleAddArea = async () => {
    if (!newAreaNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoProduto(newAreaNome.trim());
      setNewAreaNome('');
      setIsAddAreaDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditArea = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingArea({ ...item });
    setIsEditAreaDialogOpen(true);
  };
  const handleUpdateArea = async () => {
    if (!editingArea) return;
    if (!editingArea.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoProduto({
        id: editingArea.id,
        nome: editingArea.nome.trim(),
        ativo: editingArea.ativo
      });
      setIsEditAreaDialogOpen(false);
      setEditingArea(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteArea = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoProduto(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleAreaAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoProduto({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Tipo Sprint
  const handleAddTipo = async () => {
    if (!newTipoNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoTarefa(newTipoNome.trim(), newTipoClienteObrigatorio);
      setNewTipoNome('');
      setNewTipoClienteObrigatorio(false);
      setIsAddTipoDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditTipo = (item: { id: string; nome: string; ativo: boolean; cliente_obrigatorio: boolean }) => {
    setEditingTipo({ ...item });
    setIsEditTipoDialogOpen(true);
  };
  const handleUpdateTipo = async () => {
    if (!editingTipo) return;
    if (!editingTipo.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoTarefa({
        id: editingTipo.id,
        nome: editingTipo.nome.trim(),
        ativo: editingTipo.ativo,
        cliente_obrigatorio: editingTipo.cliente_obrigatorio
      });
      setIsEditTipoDialogOpen(false);
      setEditingTipo(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteTipo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoTarefa(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleTipoAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoTarefa({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Cliente
  const handleAddCliente = async () => {
    if (!newClienteNome.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    try {
      await createRecord.mutateAsync({
        cliente: newClienteNome.trim(),
        responsavel_id: newClienteResponsavel || null,
        vpn_access: [],
        server_access: [],
        docker_access: [],
        database_access: [],
        app_access: []
      });
      setNewClienteNome('');
      setNewClienteResponsavel('');
      setIsAddClienteDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditCliente = (item: { id: string; codigo: number; cliente: string; ativo: boolean; responsavel_id: string | null }) => {
    setEditingCliente({ ...item });
    setIsEditClienteDialogOpen(true);
  };
  const handleUpdateCliente = async () => {
    if (!editingCliente) return;
    if (!editingCliente.cliente.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    try {
      await updateRecord.mutateAsync({
        id: editingCliente.id,
        cliente: editingCliente.cliente.trim(),
        responsavel_id: editingCliente.responsavel_id,
        vpn_access: [],
        server_access: [],
        docker_access: [],
        database_access: [],
        app_access: []
      });
      setIsEditClienteDialogOpen(false);
      setEditingCliente(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteCliente = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    try {
      await deleteRecord.mutateAsync(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleClienteAtivo = async (id: string, ativo: boolean) => {
    try {
      await toggleClienteAtivo.mutateAsync({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Prestador de Serviço
  const handleAddPrestador = async () => {
    if (!newPrestadorNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!newPrestadorEmail.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!newPrestadorNivel) {
      toast.error('Nível é obrigatório');
      return;
    }
    if (!newPrestadorSetor) {
      toast.error('Setor é obrigatório');
      return;
    }
    try {
      await addPrestadorServico({
        nome: newPrestadorNome.trim(),
        email: newPrestadorEmail.trim(),
        nivel: newPrestadorNivel,
        setor_id: newPrestadorSetor
      });
      setNewPrestadorNome('');
      setNewPrestadorEmail('');
      setNewPrestadorNivel('N1');
      setNewPrestadorSetor('');
      setIsAddPrestadorDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditPrestador = (item: {
    id: string;
    codigo: number;
    nome: string;
    email: string | null;
    nivel: string | null;
    setor_id: string | null;
  }) => {
    setEditingPrestador({ ...item });
    setIsEditPrestadorDialogOpen(true);
  };
  const handleUpdatePrestador = async () => {
    if (!editingPrestador) return;
    if (!editingPrestador.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!editingPrestador.email?.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!editingPrestador.nivel) {
      toast.error('Nível é obrigatório');
      return;
    }
    if (!editingPrestador.setor_id) {
      toast.error('Setor é obrigatório');
      return;
    }
    try {
      await updatePrestadorServico({
        id: editingPrestador.id,
        nome: editingPrestador.nome.trim(),
        email: editingPrestador.email.trim(),
        nivel: editingPrestador.nivel,
        setor_id: editingPrestador.setor_id
      });
      setIsEditPrestadorDialogOpen(false);
      setEditingPrestador(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeletePrestador = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este prestador?')) return;
    try {
      await deletePrestadorServico(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Tipo de Documento
  const handleAddTipoDoc = async () => {
    if (!newTipoDocNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoDocumento(newTipoDocNome.trim());
      setNewTipoDocNome('');
      setIsAddTipoDocDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditTipoDoc = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingTipoDoc({ ...item });
    setIsEditTipoDocDialogOpen(true);
  };
  const handleUpdateTipoDoc = async () => {
    if (!editingTipoDoc) return;
    if (!editingTipoDoc.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoDocumento({
        id: editingTipoDoc.id,
        nome: editingTipoDoc.nome.trim(),
        ativo: editingTipoDoc.ativo
      });
      setIsEditTipoDocDialogOpen(false);
      setEditingTipoDoc(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteTipoDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoDocumento(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleTipoDocAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoDocumento({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Setor (Área de Documento)
  const handleAddAreaDoc = async () => {
    if (!newAreaDocNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addAreaDocumento(newAreaDocNome.trim());
      setNewAreaDocNome('');
      setIsAddAreaDocDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditAreaDoc = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingAreaDoc({ ...item });
    setIsEditAreaDocDialogOpen(true);
  };
  const handleUpdateAreaDoc = async () => {
    if (!editingAreaDoc) return;
    if (!editingAreaDoc.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateAreaDocumento({
        id: editingAreaDoc.id,
        nome: editingAreaDoc.nome.trim(),
        ativo: editingAreaDoc.ativo
      });
      setIsEditAreaDocDialogOpen(false);
      setEditingAreaDoc(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteAreaDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteAreaDocumento(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleAreaDocAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateAreaDocumento({ id, ativo: !ativo });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handlers para Tipo de Documento Cliente
  const handleAddTipoDocCliente = async () => {
    if (!newTipoDocClienteNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await addTipoDocumentoCliente(newTipoDocClienteNome.trim());
      setNewTipoDocClienteNome('');
      setIsAddTipoDocClienteDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleEditTipoDocCliente = (item: { id: string; nome: string; ativo: boolean }) => {
    setEditingTipoDocCliente({ ...item });
    setIsEditTipoDocClienteDialogOpen(true);
  };
  const handleUpdateTipoDocCliente = async () => {
    if (!editingTipoDocCliente) return;
    if (!editingTipoDocCliente.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateTipoDocumentoCliente({
        id: editingTipoDocCliente.id,
        nome: editingTipoDocCliente.nome.trim(),
        ativo: editingTipoDocCliente.ativo
      });
      setIsEditTipoDocClienteDialogOpen(false);
      setEditingTipoDocCliente(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleDeleteTipoDocCliente = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteTipoDocumentoCliente(id);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleToggleTipoDocClienteAtivo = async (id: string, ativo: boolean) => {
    try {
      await updateTipoDocumentoCliente({ id, ativo: !ativo });
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

        <div className="flex border rounded-lg bg-card min-h-[600px] overflow-hidden">
          <CadastrosSidebar
            selectedCadastro={selectedCadastro}
            onSelectCadastro={setSelectedCadastro}
          />
          <CadastrosContent
            selectedCadastro={selectedCadastro}
            // Area Sprint
            tiposProduto={tiposProduto}
            isLoadingArea={isLoadingArea}
            isAddAreaDialogOpen={isAddAreaDialogOpen}
            setIsAddAreaDialogOpen={setIsAddAreaDialogOpen}
            isEditAreaDialogOpen={isEditAreaDialogOpen}
            setIsEditAreaDialogOpen={setIsEditAreaDialogOpen}
            newAreaNome={newAreaNome}
            setNewAreaNome={setNewAreaNome}
            editingArea={editingArea}
            setEditingArea={setEditingArea}
            handleAddArea={handleAddArea}
            handleEditArea={handleEditArea}
            handleUpdateArea={handleUpdateArea}
            handleDeleteArea={handleDeleteArea}
            handleToggleAreaAtivo={handleToggleAreaAtivo}
            // Tipo Sprint
            tiposTarefa={tiposTarefa}
            isLoadingTipo={isLoadingTipo}
            isAddTipoDialogOpen={isAddTipoDialogOpen}
            setIsAddTipoDialogOpen={setIsAddTipoDialogOpen}
            isEditTipoDialogOpen={isEditTipoDialogOpen}
            setIsEditTipoDialogOpen={setIsEditTipoDialogOpen}
            newTipoNome={newTipoNome}
            setNewTipoNome={setNewTipoNome}
            editingTipo={editingTipo}
            setEditingTipo={setEditingTipo}
            handleAddTipo={handleAddTipo}
            handleEditTipo={handleEditTipo}
            handleUpdateTipo={handleUpdateTipo}
            handleDeleteTipo={handleDeleteTipo}
            handleToggleTipoAtivo={handleToggleTipoAtivo}
            // Tipo Documento Cliente
            tiposDocumentoCliente={tiposDocumentoCliente}
            isLoadingTipoDocCliente={isLoadingTipoDocCliente}
            isAddTipoDocClienteDialogOpen={isAddTipoDocClienteDialogOpen}
            setIsAddTipoDocClienteDialogOpen={setIsAddTipoDocClienteDialogOpen}
            isEditTipoDocClienteDialogOpen={isEditTipoDocClienteDialogOpen}
            setIsEditTipoDocClienteDialogOpen={setIsEditTipoDocClienteDialogOpen}
            newTipoDocClienteNome={newTipoDocClienteNome}
            setNewTipoDocClienteNome={setNewTipoDocClienteNome}
            editingTipoDocCliente={editingTipoDocCliente}
            setEditingTipoDocCliente={setEditingTipoDocCliente}
            handleAddTipoDocCliente={handleAddTipoDocCliente}
            handleEditTipoDocCliente={handleEditTipoDocCliente}
            handleUpdateTipoDocCliente={handleUpdateTipoDocCliente}
            handleDeleteTipoDocCliente={handleDeleteTipoDocCliente}
            handleToggleTipoDocClienteAtivo={handleToggleTipoDocClienteAtivo}
            // Prestador de Serviço
            prestadoresServico={prestadoresServico}
            isLoadingPrestador={isLoadingPrestador}
            isAddPrestadorDialogOpen={isAddPrestadorDialogOpen}
            setIsAddPrestadorDialogOpen={setIsAddPrestadorDialogOpen}
            isEditPrestadorDialogOpen={isEditPrestadorDialogOpen}
            setIsEditPrestadorDialogOpen={setIsEditPrestadorDialogOpen}
            newPrestadorNome={newPrestadorNome}
            setNewPrestadorNome={setNewPrestadorNome}
            newPrestadorEmail={newPrestadorEmail}
            setNewPrestadorEmail={setNewPrestadorEmail}
            newPrestadorNivel={newPrestadorNivel}
            setNewPrestadorNivel={setNewPrestadorNivel}
            newPrestadorSetor={newPrestadorSetor}
            setNewPrestadorSetor={setNewPrestadorSetor}
            editingPrestador={editingPrestador}
            setEditingPrestador={setEditingPrestador}
            handleAddPrestador={handleAddPrestador}
            handleEditPrestador={handleEditPrestador}
            handleUpdatePrestador={handleUpdatePrestador}
            handleDeletePrestador={handleDeletePrestador}
            nivelOptions={NIVEL_OPTIONS}
            areasDocumento={areasDocumento}
            // Clientes
            clientes={clientes}
            isLoadingClientes={isLoadingClientes}
            isAddClienteDialogOpen={isAddClienteDialogOpen}
            setIsAddClienteDialogOpen={setIsAddClienteDialogOpen}
            isEditClienteDialogOpen={isEditClienteDialogOpen}
            setIsEditClienteDialogOpen={setIsEditClienteDialogOpen}
            newClienteNome={newClienteNome}
            setNewClienteNome={setNewClienteNome}
            newClienteResponsavel={newClienteResponsavel}
            setNewClienteResponsavel={setNewClienteResponsavel}
            editingCliente={editingCliente}
            setEditingCliente={setEditingCliente}
            handleAddCliente={handleAddCliente}
            handleEditCliente={handleEditCliente}
            handleUpdateCliente={handleUpdateCliente}
            handleDeleteCliente={handleDeleteCliente}
            handleToggleClienteAtivo={handleToggleClienteAtivo}
            profiles={profiles}
            // Setor
            isLoadingAreaDoc={isLoadingAreaDoc}
            isAddAreaDocDialogOpen={isAddAreaDocDialogOpen}
            setIsAddAreaDocDialogOpen={setIsAddAreaDocDialogOpen}
            isEditAreaDocDialogOpen={isEditAreaDocDialogOpen}
            setIsEditAreaDocDialogOpen={setIsEditAreaDocDialogOpen}
            newAreaDocNome={newAreaDocNome}
            setNewAreaDocNome={setNewAreaDocNome}
            editingAreaDoc={editingAreaDoc}
            setEditingAreaDoc={setEditingAreaDoc}
            handleAddAreaDoc={handleAddAreaDoc}
            handleEditAreaDoc={handleEditAreaDoc}
            handleUpdateAreaDoc={handleUpdateAreaDoc}
            handleDeleteAreaDoc={handleDeleteAreaDoc}
            handleToggleAreaDocAtivo={handleToggleAreaDocAtivo}
            // Tipo de Documento
            tiposDocumento={tiposDocumento}
            isLoadingTipoDoc={isLoadingTipoDoc}
            isAddTipoDocDialogOpen={isAddTipoDocDialogOpen}
            setIsAddTipoDocDialogOpen={setIsAddTipoDocDialogOpen}
            isEditTipoDocDialogOpen={isEditTipoDocDialogOpen}
            setIsEditTipoDocDialogOpen={setIsEditTipoDocDialogOpen}
            newTipoDocNome={newTipoDocNome}
            setNewTipoDocNome={setNewTipoDocNome}
            editingTipoDoc={editingTipoDoc}
            setEditingTipoDoc={setEditingTipoDoc}
            handleAddTipoDoc={handleAddTipoDoc}
            handleEditTipoDoc={handleEditTipoDoc}
            handleUpdateTipoDoc={handleUpdateTipoDoc}
            handleDeleteTipoDoc={handleDeleteTipoDoc}
            handleToggleTipoDocAtivo={handleToggleTipoDocAtivo}
          />
        </div>

        <CadastrosDialogs
          // Area Sprint
          isAddAreaDialogOpen={isAddAreaDialogOpen}
          setIsAddAreaDialogOpen={setIsAddAreaDialogOpen}
          isEditAreaDialogOpen={isEditAreaDialogOpen}
          setIsEditAreaDialogOpen={setIsEditAreaDialogOpen}
          newAreaNome={newAreaNome}
          setNewAreaNome={setNewAreaNome}
          editingArea={editingArea}
          setEditingArea={setEditingArea}
          handleAddArea={handleAddArea}
          handleUpdateArea={handleUpdateArea}
          // Tipo Sprint
          isAddTipoDialogOpen={isAddTipoDialogOpen}
          setIsAddTipoDialogOpen={setIsAddTipoDialogOpen}
          isEditTipoDialogOpen={isEditTipoDialogOpen}
          setIsEditTipoDialogOpen={setIsEditTipoDialogOpen}
          newTipoNome={newTipoNome}
          setNewTipoNome={setNewTipoNome}
          newTipoClienteObrigatorio={newTipoClienteObrigatorio}
          setNewTipoClienteObrigatorio={setNewTipoClienteObrigatorio}
          editingTipo={editingTipo}
          setEditingTipo={setEditingTipo}
          handleAddTipo={handleAddTipo}
          handleUpdateTipo={handleUpdateTipo}
          // Tipo Documento Cliente
          isAddTipoDocClienteDialogOpen={isAddTipoDocClienteDialogOpen}
          setIsAddTipoDocClienteDialogOpen={setIsAddTipoDocClienteDialogOpen}
          isEditTipoDocClienteDialogOpen={isEditTipoDocClienteDialogOpen}
          setIsEditTipoDocClienteDialogOpen={setIsEditTipoDocClienteDialogOpen}
          newTipoDocClienteNome={newTipoDocClienteNome}
          setNewTipoDocClienteNome={setNewTipoDocClienteNome}
          editingTipoDocCliente={editingTipoDocCliente}
          setEditingTipoDocCliente={setEditingTipoDocCliente}
          handleAddTipoDocCliente={handleAddTipoDocCliente}
          handleUpdateTipoDocCliente={handleUpdateTipoDocCliente}
          // Prestador de Serviço
          isAddPrestadorDialogOpen={isAddPrestadorDialogOpen}
          setIsAddPrestadorDialogOpen={setIsAddPrestadorDialogOpen}
          isEditPrestadorDialogOpen={isEditPrestadorDialogOpen}
          setIsEditPrestadorDialogOpen={setIsEditPrestadorDialogOpen}
          newPrestadorNome={newPrestadorNome}
          setNewPrestadorNome={setNewPrestadorNome}
          newPrestadorEmail={newPrestadorEmail}
          setNewPrestadorEmail={setNewPrestadorEmail}
          newPrestadorNivel={newPrestadorNivel}
          setNewPrestadorNivel={setNewPrestadorNivel}
          newPrestadorSetor={newPrestadorSetor}
          setNewPrestadorSetor={setNewPrestadorSetor}
          editingPrestador={editingPrestador}
          setEditingPrestador={setEditingPrestador}
          handleAddPrestador={handleAddPrestador}
          handleUpdatePrestador={handleUpdatePrestador}
          nivelOptions={NIVEL_OPTIONS}
          areasDocumento={areasDocumento}
          // Clientes
          isAddClienteDialogOpen={isAddClienteDialogOpen}
          setIsAddClienteDialogOpen={setIsAddClienteDialogOpen}
          isEditClienteDialogOpen={isEditClienteDialogOpen}
          setIsEditClienteDialogOpen={setIsEditClienteDialogOpen}
          newClienteNome={newClienteNome}
          setNewClienteNome={setNewClienteNome}
          newClienteResponsavel={newClienteResponsavel}
          setNewClienteResponsavel={setNewClienteResponsavel}
          editingCliente={editingCliente}
          setEditingCliente={setEditingCliente}
          handleAddCliente={handleAddCliente}
          handleUpdateCliente={handleUpdateCliente}
          profiles={profiles}
          // Setor
          isAddAreaDocDialogOpen={isAddAreaDocDialogOpen}
          setIsAddAreaDocDialogOpen={setIsAddAreaDocDialogOpen}
          isEditAreaDocDialogOpen={isEditAreaDocDialogOpen}
          setIsEditAreaDocDialogOpen={setIsEditAreaDocDialogOpen}
          newAreaDocNome={newAreaDocNome}
          setNewAreaDocNome={setNewAreaDocNome}
          editingAreaDoc={editingAreaDoc}
          setEditingAreaDoc={setEditingAreaDoc}
          handleAddAreaDoc={handleAddAreaDoc}
          handleUpdateAreaDoc={handleUpdateAreaDoc}
          // Tipo de Documento
          isAddTipoDocDialogOpen={isAddTipoDocDialogOpen}
          setIsAddTipoDocDialogOpen={setIsAddTipoDocDialogOpen}
          isEditTipoDocDialogOpen={isEditTipoDocDialogOpen}
          setIsEditTipoDocDialogOpen={setIsEditTipoDocDialogOpen}
          newTipoDocNome={newTipoDocNome}
          setNewTipoDocNome={setNewTipoDocNome}
          editingTipoDoc={editingTipoDoc}
          setEditingTipoDoc={setEditingTipoDoc}
          handleAddTipoDoc={handleAddTipoDoc}
          handleUpdateTipoDoc={handleUpdateTipoDoc}
        />
      </div>
    </Layout>
  );
};

export default CadastrosSistema;
