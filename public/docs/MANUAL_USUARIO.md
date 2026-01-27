# Manual de Uso - Sistema AVAnça GHAS

## Índice

1. [Visão Geral](#visão-geral)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Menu PMO/CET](#menu-pmocet)
   - [Dashboard](#dashboard-pmocet)
   - [Sprint Planning](#sprint-planning)
   - [Sprint](#sprint)
   - [Daily](#daily)
   - [Retrospectiva](#retrospectiva)
   - [Roadmap](#roadmap)
4. [Menu CLIENTE](#menu-cliente)
   - [Dashboard Clientes](#dashboard-clientes)
   - [Prioridades](#prioridades)
   - [Prod Global](#prod-global)
   - [Prod Individual](#prod-individual)
   - [Riscos e BO's](#riscos-e-bos)
   - [Documentos Cliente](#documentos-cliente)
5. [Menu GHAS](#menu-ghas)
   - [Documentos](#documentos-ghas)
   - [Treinamentos](#treinamentos)
6. [Menu Administração](#menu-administração)
   - [Administração](#administração)
   - [Cadastros do Sistema](#cadastros-do-sistema)
7. [Perfis de Usuário](#perfis-de-usuário)

---

## Visão Geral

O Sistema AVAnça GHAS é uma ferramenta completa para gerenciamento de projetos ágeis, utilizando metodologias Scrum. O sistema permite:

- Planejamento e acompanhamento de Sprints
- Gestão de Backlog e tarefas
- Registro de Dailies e Retrospectivas
- Controle de produtividade
- Gestão de riscos e ocorrências (BO's)
- Dashboards com indicadores de desempenho
- Cronograma de projetos (Prioridades)
- Gestão de documentos institucionais
- Gestão de treinamentos e capacitações

---

## Acesso ao Sistema

### Login
1. Acesse a URL do sistema
2. Insira seu **e-mail** e **senha**
3. Clique em **Entrar**

### Primeiro Acesso
- No primeiro acesso, você será solicitado a alterar sua senha
- A senha deve ter no mínimo 6 caracteres

### Alterar Senha
- Clique no seu nome no canto superior direito
- Selecione **Alterar Senha**
- Insira a nova senha e confirme

### Menu do Usuário
- **Manual de Uso Sistema AVAnça:** Realiza o download do manual em PDF
- **Sair do Sistema:** Encerra a sessão do usuário

---

## Menu PMO/CET

O menu PMO/CET concentra as funcionalidades de gestão ágil e acompanhamento de sprints.

### Dashboard PMO/CET

**Caminho:** PMO/CET → Dashboard

Visão geral do andamento das sprints selecionadas.

#### Métricas Exibidas:
- **A Fazer:** Quantidade de tarefas pendentes
- **Fazendo:** Quantidade em progresso
- **Feito:** Quantidade concluídas
- **Validado:** Quantidade validadas
- **Story Points:** Total de SP da sprint

#### Percentual de Conclusão:
- Calculado como: (Feito + Validado) / Total

#### Gráfico:
- Tarefas por responsável
- Ordenação configurável

#### Filtros:
- Situação do Sprint
- Intervalo de Datas
- Sprint(s) - seleção múltipla
- Área (Tipo de Produto)

#### Exportar:
- Clique em "Exportar Excel" para gerar relatório

---

### Sprint Planning

**Caminho:** PMO/CET → Sprint Planning

A página de Sprint Planning é o coração do planejamento ágil, permitindo gerenciar sprints e distribuir tarefas.

#### Funcionalidades:

**1. Gerenciar Sprints**
- **Criar Sprint:** Clique em "Nova Sprint", informe nome, data de início e data de fim
- **Editar Sprint:** Selecione a sprint e clique no botão de edição
- **Excluir Sprint:** Só é possível excluir sprints sem tarefas associadas
- **Ativar Sprint:** O status é calculado automaticamente:
  - **Planejamento:** Data de início futura
  - **Ativo:** Data atual entre início e fim
  - **Concluído:** Data atual após data fim

**2. Gerenciar Tarefas (Backlog)**
- **Criar Tarefa:** Clique em "Nova Tarefa"
  - **Título** (obrigatório, máx. 200 caracteres)
  - **Descrição** (opcional, máx. 1000 caracteres)
  - **Story Points** (1-100, ou quantidade de subtarefas)
  - **Prioridade:** Baixa, Média, Alta
  - **Responsável** (obrigatório)
  - **Cliente** (obrigatório)
  - **Área** (Tipo de Produto)
  - **Tipo de Tarefa**

**3. Subtarefas**
- Ao criar uma tarefa com subtarefas, os Story Points são calculados automaticamente pela quantidade de subtarefas
- Cada subtarefa possui: Título, Responsável, Data Início e Data Fim

**4. Adicionar Tarefas à Sprint**
- Selecione a sprint desejada
- No backlog, clique no botão "+" para adicionar a tarefa à sprint

**5. Filtros Disponíveis**
- Situação do Sprint (Ativo, Concluído, Planejamento)
- Intervalo de Datas
- Responsável
- Cliente
- Mostrar apenas tarefas sem sprint

**6. Visualizações**
- **Cards:** Visualização em cartões
- **Lista:** Visualização em tabela

**7. Duplicar Tarefas**
- Selecione múltiplas tarefas
- Clique em "Duplicar"
- Escolha o responsável para as cópias

**8. Duplicar Sprint**
- Permite criar uma nova sprint baseada em uma existente
- Copia todas as tarefas para a nova sprint

---

### Sprint

**Caminho:** PMO/CET → Sprint

Visualização Kanban das tarefas da sprint selecionada.

#### Colunas de Status:
- **Fazer:** Tarefas não iniciadas
- **Fazendo:** Tarefas em andamento
- **Feito:** Tarefas concluídas
- **Validado:** Tarefas validadas pelo cliente/líder

#### Funcionalidades:
- **Alterar Status:** Clique no card da tarefa e selecione o novo status
- **Filtros:** Sprint(s), Situação, Datas, Responsável

#### Regras:
- Operadores visualizam apenas suas próprias tarefas
- Administradores visualizam todas as tarefas

---

### Daily

**Caminho:** PMO/CET → Daily

Registro do acompanhamento diário das atividades do time.

#### Campos do Registro:
- **Cliente** (obrigatório)
- **Sprint** (opcional)
- **Data do Registro** (padrão: hoje)
- **Usuário** (preenchido automaticamente para operadores)
- **O que foi feito ontem?** (obrigatório)
- **O que será feito hoje?** (obrigatório)
- **Impedimentos** (opcional)

#### Histórico:
- Visualize o histórico de dailies na lateral direita
- Filtre por responsável e data
- **Ver Histórico Completo:** Acesse a página de histórico dedicada

#### Regras:
- Operadores veem apenas seus próprios registros
- Administradores veem todos os registros e podem filtrar por responsável

---

### Retrospectiva

**Caminho:** PMO/CET → Retrospectiva

Registro da análise pós-sprint para melhoria contínua.

#### Seções:
1. **O que foi bom ✅**
   - Registre os pontos positivos da sprint
   
2. **O que pode melhorar ⚠️**
   - Registre os pontos de melhoria

3. **Ações 🚀**
   - Defina ações para a próxima sprint

#### Funcionalidades:
- **Adicionar Itens:** Clique em "Adicionar item" em cada seção
- **Remover Itens:** Clique no "X" ao lado do item
- **Salvar:** Clique em "Salvar Retrospectiva"
- **Exportar PDF:** Gere um documento PDF da retrospectiva

---

### Roadmap

**Caminho:** PMO/CET → Roadmap

Visão completa de todas as tarefas com status calculado automaticamente.

#### KPIs Exibidos:
- Total de tarefas
- Tarefas concluídas
- Percentual de conclusão

#### Status das Tarefas:
- **ENTREGUE:** Tarefa com status Feito ou Validado
- **EM SPRINT:** Tarefa em sprint ativa
- **EM ATRASO:** Tarefa atrasada (data fim ultrapassada)
- **NO PRAZO:** Tarefa dentro do prazo
- **PENDENTE:** Tarefa sem sprint

#### Filtros:
- Buscar por título
- Status
- Responsável
- Tipo de Tarefa

#### Funcionalidades:
- Clique em uma linha para ver detalhes da tarefa
- Exporte para Excel ou PDF

---

## Menu CLIENTE

O menu CLIENTE concentra as funcionalidades de gestão por cliente, produtividade e riscos.

### Dashboard Clientes

**Caminho:** CLIENTE → Dashboard

Grid de indicadores (faróis) por cliente.

#### Indicadores por Cliente:
- **Geral:** Status consolidado
- **Metodologia:** Indicador de metodologia ágil
- **Prioridades:** Indicador de cronograma
- **Produtividade:** Indicador de produtividade
- **Riscos e BO's:** Indicador de riscos

#### Legenda de Cores:
- 🟢 **Verde:** Situação OK
- 🟡 **Amarelo:** Atenção necessária
- 🔴 **Vermelho:** Situação crítica

#### Filtros:
- Cliente específico
- Filtro por cor em cada indicador

---

### Prioridades

**Caminho:** CLIENTE → Prioridades

Gestão de cronogramas de projetos com visualização em grade hierárquica.

#### Funcionalidades:

**1. Selecionar Cliente**
- Selecione o cliente no combo para visualizar o cronograma

**2. Gerenciar Cronograma**
- O cronograma é exibido em formato de grade (TreeGrid)

**3. Tarefas do Cronograma**
- **Adicionar Tarefa:** Use o botão "+"
- **Tarefas Resumo:** Agrupe tarefas em hierarquia
- **Campos:**
  - Nome da tarefa
  - Data início e fim
  - Duração (dias)
  - Responsável
  - Predecessoras
  - Status (Fazendo, Concluído, etc.)

**4. Histórico de Notas**
- Clique no ícone de olho para visualizar e adicionar notas
- As notas são salvas no histórico da tarefa

**5. Gráfico de Gantt**
- Visualização gráfica do cronograma
- Barras coloridas por status

---

### Prod Global

**Caminho:** CLIENTE → Prod Global

Visão consolidada da produtividade por cliente.

#### Métricas:
- Chamados abertos
- Chamados encerrados
- Backlog
- Percentual de incidentes
- Percentual de solicitações

#### Funcionalidades:
- Filtrar por cliente
- Filtrar por período
- Importar dados via planilha

---

### Prod Individual

**Caminho:** CLIENTE → Prod Individual

Registro e acompanhamento da produtividade dos prestadores de serviço.

#### Funcionalidades:

**1. Adicionar Registro Manual**
- Clique em "Adicionar"
- Informe:
  - Prestador de Serviço
  - Cliente
  - Data de Início
  - Data Fim
  - Total de Chamados Encerrados

**2. Importar Planilha**
- Clique em "Importar Arquivo"
- Baixe o modelo de importação
- Preencha a planilha com:
  - Código do Prestador
  - Código do Cliente
  - Data de Início
  - Data Fim
  - Total de Chamados

**3. Validações**
- Datas não podem ser futuras
- Não permite períodos sobrepostos para mesmo prestador/cliente

**4. Filtros**
- Prestador
- Cliente
- Período (Mês/Ano)
- Tipo (Manual/Importado)

---

### Riscos e BO's

**Caminho:** CLIENTE → Riscos e BO's

Gestão de riscos e Boletins de Ocorrência do projeto.

#### Abas:
- **Registro:** Riscos abertos e em mitigação
- **Acompanhamento:** Riscos mitigados e materializados

#### Criar Novo Registro:

**1. Identificação**
- **Tipo:** Risco (Possibilidade) ou BO (Ocorrência)
- **Projeto:** Selecione o cliente
- **Área Impactada:** Delivery, Comercial, Financeiro, CS/CX, TI, Operação
- **Tipo de Risco GHAS:** Perda de Contrato, Multa, Jurídico
- **Tipo de Risco Cliente:** Financeiro, Assistencial, Jurídico
- **Descrição do Risco**

**2. Avaliação**
- **Probabilidade:** Baixa, Média, Alta
- **Impacto:** Baixa, Média, Alta
- **Nível de Risco:** Calculado automaticamente
  - 🔴 Alto
  - 🟡 Médio
  - 🟢 Baixo

**3. Responsabilidade e Ação**
- Origem do Risco
- Responsável pela Ação
- Plano de Mitigação
- Status do Risco
- Data Limite da Ação

**4. Encerramento** (quando aplicável)
- O risco ocorreu?
- Impacto real ocorrido
- Lição aprendida

---

### Documentos Cliente

**Caminho:** CLIENTE → Documentos

Gestão de documentos específicos por cliente.

#### Funcionalidades:
- Upload de arquivos (PDF, DOCX, PPTX, XLSX)
- Classificação por tipo de documento
- Filtros por tipo e período
- Contador de documentos por cliente
- Download e exclusão de arquivos

---

## Menu GHAS

O menu GHAS concentra a documentação institucional e gestão de treinamentos.

### Documentos GHAS

**Caminho:** GHAS → Documentos

Centraliza a documentação institucional da GHAS.

#### Cadastro de Novo Documento

Todos os campos são **obrigatórios**:

| Campo | Descrição |
|-------|-----------|
| **Nome** | Nome do documento |
| **Tipo de Documento** | Classificação do documento (ex: Procedimento, Política) |
| **Versão** | Versão do documento |
| **Descrição** | Descrição detalhada do documento |
| **Data de Publicação** | Data de publicação do documento |
| **Status** | Ativo ou Inativo |
| **Arquivo** | Upload do arquivo (PDF, DOCX, PPTX, XLSX) |
| **Setores Destino** | Seleção múltipla de setores destinatários do documento |

#### Funcionalidades:
- **Visualizar:** PDFs abrem em nova aba; outros formatos são baixados
- **Download:** Baixa o arquivo do documento
- **Editar:** Edita os dados do documento (apenas administradores)
- **Excluir:** Remove o documento (apenas administradores)

#### Grid de Documentos:
| Coluna | Descrição |
|--------|-----------|
| **ID** | Código sequencial do documento |
| **Ações** | Botões de visualizar, download, editar e excluir |
| **Nome** | Nome do documento |
| **Setores Destino** | Exibe badges com os setores selecionados |
| **Tipo** | Tipo do documento |
| **Versão** | Versão do documento |
| **Data de Publicação** | Data de publicação |
| **Status** | Status do documento (Ativo/Inativo) |

#### Filtros Disponíveis:
- Buscar por nome
- Filtrar por Tipo
- Filtrar por Setor
- Filtrar por Status
- Filtrar por intervalo de Data de Publicação (Início/Fim)

---

### Treinamentos

**Caminho:** GHAS → Treinamentos

Gestão de sessões de capacitação e treinamentos.

#### Cadastro de Treinamento:
- **Nome:** Nome do treinamento
- **Data:** Data de realização
- **Ministrado por:** Prestador de serviço responsável
- **Descrição:** Detalhes do treinamento
- **Arquivo:** Material de apoio (opcional)
- **Status:** Status do treinamento

#### Participantes:
- Seleção múltipla de prestadores de serviço
- Definição do status de "Capacitado" (Sim/Não) para cada participante

#### Funcionalidades:
- Grid com ID sequencial
- Ordenação por colunas
- Filtros por período

---

## Menu Administração

O menu Administração é restrito para administradores do sistema.

### Administração

**Caminho:** Administração → Administração

#### Aba Usuários

**1. Cadastrar Novo Usuário**
- Nome da Pessoa
- E-mail
- Senha (mín. 6 caracteres)
- Tipo: Administrador ou Operador

**2. Gerenciar Usuários**
- Buscar por nome
- Editar dados do usuário
- Redefinir senha
- Excluir usuário

#### Aba Integração

**Configuração de Webhook AVA**
- Token de autenticação
- URL do webhook para copiar

---

### Cadastros do Sistema

**Caminho:** Administração → Cadastros do Sistema

Gerenciamento de cadastros auxiliares do sistema.

#### Setores

Gerencia os setores da organização.

| Coluna | Descrição |
|--------|-----------|
| **ID** | Código sequencial do setor |
| **Nome** | Nome do setor |
| **Status** | Ativo ou Inativo |

- Setores são utilizados como destino em documentos (seleção múltipla)
- Setores são vinculados aos prestadores de serviço

#### Tipos de Documento

Classificações disponíveis para documentos GHAS.

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do tipo |
| **Status** | Ativo ou Inativo |

#### Tipos de Documento Cliente

Classificações disponíveis para documentos de clientes.

#### Prestadores de Serviço

Cadastro de prestadores de serviço.

**Campos obrigatórios:**
- **Nome** (obrigatório)
- **Email** (obrigatório)
- **Nível** (obrigatório): N1, N2 ou Especialidade
- **Setor** (obrigatório): Vínculo com um setor

| Coluna | Descrição |
|--------|-----------|
| **ID** | Código sequencial do prestador |
| **Nome** | Nome do prestador |
| **Email** | Email do prestador |
| **Nível** | N1, N2 ou Especialidade |
| **Setor** | Setor vinculado |

#### Clientes

Cadastro de clientes do sistema.

| Coluna | Descrição |
|--------|-----------|
| **ID** | Código sequencial do cliente |
| **Nome** | Nome do cliente |

---

## Perfis de Usuário

### Administrador
- Acesso total ao sistema
- Pode cadastrar e gerenciar usuários
- Visualiza dados de todos os responsáveis
- Acesso à área de administração
- Pode editar e excluir documentos

### Operador
- Acesso às funcionalidades operacionais
- Visualiza apenas seus próprios dados nas páginas:
  - Sprint
  - Daily
- Não pode acessar área de administração
- Campo de responsável bloqueado (preenchido automaticamente)
- Apenas visualiza e baixa documentos (não pode editar/excluir)

---

## Dicas de Uso

1. **Sprints Ativas:** O sistema seleciona automaticamente a sprint ativa nos filtros
2. **Subtarefas:** Use subtarefas para detalhar tarefas complexas
3. **Datas:** O sistema considera o fuso horário de São Paulo
4. **Exportações:** Utilize os botões de exportação para relatórios externos
5. **Filtros:** Limpe os filtros clicando nos botões "Limpar"
6. **Documentos:** Utilize a seleção múltipla de Setores Destino para distribuir documentos para vários setores
7. **Campos Obrigatórios:** Todos os campos do formulário de Novo Documento são obrigatórios

---

## Suporte

Em caso de dúvidas ou problemas, entre em contato com o administrador do sistema.

---

*Versão do Manual: 1.2*
*Última Atualização: Janeiro/2025*
*Alterações da versão 1.2:*
- Reorganização do manual conforme nova estrutura de menus (PMO/CET, CLIENTE, GHAS, Administração)
- Renomeação de "Scrum" para "Metodologia" no Dashboard Clientes
- Atualização dos caminhos de navegação
- Remoção de referências a menus e funcionalidades obsoletas
- Status "Fazendo" padronizado na página de Prioridades
