# Manual de Uso - Sistema de Gestão GHAS

## Índice

1. [Visão Geral](#visão-geral)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Menu Scrum](#menu-scrum)
   - [Sprint Planning](#sprint-planning)
   - [Sprint](#sprint)
   - [Daily](#daily)
   - [Retrospectiva](#retrospectiva)
   - [Roadmap](#roadmap)
4. [Prioridades](#prioridades)
5. [Produtividade](#produtividade)
6. [Riscos e BO's](#riscos-e-bos)
7. [Dashboard's](#dashboards)
   - [Dashboard Scrum](#dashboard-scrum)
   - [Dashboard Projetos](#dashboard-projetos)
   - [Dashboard Clientes](#dashboard-clientes)
8. [Administração](#administração)
9. [Perfis de Usuário](#perfis-de-usuário)

---

## Visão Geral

O Sistema de Gestão GHAS é uma ferramenta completa para gerenciamento de projetos ágeis, utilizando metodologias Scrum. O sistema permite:

- Planejamento e acompanhamento de Sprints
- Gestão de Backlog e tarefas
- Registro de Dailies e Retrospectivas
- Controle de produtividade
- Gestão de riscos e ocorrências (BO's)
- Dashboards com indicadores de desempenho
- Cronograma de projetos

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

---

## Menu Scrum

### Sprint Planning

**Caminho:** Menu → Scrum → Sprint Planning

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

**Caminho:** Menu → Scrum → Sprint

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

**Caminho:** Menu → Scrum → Daily

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

**Caminho:** Menu → Scrum → Retrospectiva

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

**Caminho:** Menu → Scrum → Roadmap

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

## Prioridades

**Caminho:** Menu → Prioridades

Gestão de cronogramas de projetos com visualização em grade hierárquica.

#### Funcionalidades:

**1. Criar Projeto**
- Clique em "Novo Projeto"
- Informe: Nome, Descrição, Status

**2. Gerenciar Cronograma**
- Selecione o projeto no combo
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
  - Status

**4. Gráfico de Gantt**
- Visualização gráfica do cronograma
- Barras coloridas por status

---

## Produtividade

**Caminho:** Menu → Produtividade

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

**5. Ordenação**
- Clique no cabeçalho das colunas para ordenar

**6. Excluir Registro**
- Clique no ícone de lixeira

---

## Riscos e BO's

**Caminho:** Menu → Riscos e BO's

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

#### Ações:
- **Editar:** Ícone de lápis
- **Visualizar:** Ícone de olho
- **Excluir:** Ícone de lixeira

---

## Dashboard's

### Dashboard Scrum

**Caminho:** Menu → Dashboard's → Scrum

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

### Dashboard Projetos

**Caminho:** Menu → Dashboard's → Projetos

Similar ao Dashboard Scrum, com foco em visão de projetos.

#### Funcionalidades:
- Mesmas métricas e filtros do Dashboard Scrum
- Gráfico de tarefas por responsável
- Exportação para Excel

---

### Dashboard Clientes

**Caminho:** Menu → Dashboard's → Clientes

Grid de indicadores (faróis) por cliente.

#### Indicadores por Cliente:
- **Geral:** Status consolidado
- **Scrum:** Indicador de Scrum
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

## Administração

**Caminho:** Menu → Administração

Área restrita para administradores do sistema.

#### Aba Usuários:

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

#### Aba Integração:

**Configuração de Webhook AVA**
- Token de autenticação
- URL do webhook para copiar

---

## Perfis de Usuário

### Administrador
- Acesso total ao sistema
- Pode cadastrar e gerenciar usuários
- Visualiza dados de todos os responsáveis
- Acesso à área de administração

### Operador
- Acesso às funcionalidades operacionais
- Visualiza apenas seus próprios dados nas páginas:
  - Sprint
  - Daily
- Não pode acessar área de administração
- Campo de responsável bloqueado (preenchido automaticamente)

---

## Dicas de Uso

1. **Sprints Ativas:** O sistema seleciona automaticamente a sprint ativa nos filtros
2. **Subtarefas:** Use subtarefas para detalhar tarefas complexas
3. **Datas:** O sistema considera o fuso horário de São Paulo
4. **Exportações:** Utilize os botões de exportação para relatórios externos
5. **Filtros:** Limpe os filtros clicando nos botões "Limpar"

---

## Suporte

Em caso de dúvidas ou problemas, entre em contato com o administrador do sistema.

---

*Versão do Manual: 1.0*
*Data: Janeiro/2025*
