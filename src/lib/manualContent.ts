export const manualSections = [
  {
    title: "Manual de Uso - Sistema de Gestão GHAS",
    level: 0,
    content: ""
  },
  {
    title: "1. Visão Geral",
    level: 1,
    content: `O Sistema de Gestão GHAS é uma ferramenta completa para gerenciamento de projetos ágeis, utilizando metodologias Scrum. O sistema permite:

• Planejamento e acompanhamento de Sprints
• Gestão de Backlog e tarefas
• Registro de Dailies e Retrospectivas
• Controle de produtividade
• Gestão de riscos e ocorrências (BO's)
• Dashboards com indicadores de desempenho
• Cronograma de projetos`
  },
  {
    title: "2. Acesso ao Sistema",
    level: 1,
    content: `LOGIN:
• Acesse a URL do sistema
• Insira seu e-mail e senha
• Clique em Entrar

PRIMEIRO ACESSO:
• No primeiro acesso, você será solicitado a alterar sua senha
• A senha deve ter no mínimo 6 caracteres

ALTERAR SENHA:
• Clique no seu nome no canto superior direito
• Selecione "Alterar Senha"
• Insira a nova senha e confirme`
  },
  {
    title: "3. Sprint Planning",
    level: 1,
    content: `Caminho: Menu → Scrum → Sprint Planning

A página de Sprint Planning é o coração do planejamento ágil, permitindo gerenciar sprints e distribuir tarefas.

GERENCIAR SPRINTS:
• Criar Sprint: Clique em "Nova Sprint", informe nome, data de início e data de fim
• Editar Sprint: Selecione a sprint e clique no botão de edição
• Excluir Sprint: Só é possível excluir sprints sem tarefas associadas
• Status calculado automaticamente:
  - Planejamento: Data de início futura
  - Ativo: Data atual entre início e fim
  - Concluído: Data atual após data fim

GERENCIAR TAREFAS (BACKLOG):
• Criar Tarefa: Clique em "Nova Tarefa"
  - Título (obrigatório, máx. 200 caracteres)
  - Descrição (opcional, máx. 1000 caracteres)
  - Story Points (1-100, ou quantidade de subtarefas)
  - Prioridade: Baixa, Média, Alta
  - Responsável (obrigatório)
  - Cliente (obrigatório)
  - Área (Tipo de Produto)
  - Tipo de Tarefa

SUBTAREFAS:
• Ao criar uma tarefa com subtarefas, os Story Points são calculados automaticamente
• Cada subtarefa possui: Título, Responsável, Data Início e Data Fim

ADICIONAR TAREFAS À SPRINT:
• Selecione a sprint desejada
• No backlog, clique no botão "+" para adicionar a tarefa à sprint`
  },
  {
    title: "4. Sprint",
    level: 1,
    content: `Caminho: Menu → Scrum → Sprint

Visualização Kanban das tarefas da sprint selecionada.

COLUNAS DE STATUS:
• Fazer: Tarefas não iniciadas
• Fazendo: Tarefas em andamento
• Feito: Tarefas concluídas
• Validado: Tarefas validadas pelo cliente/líder

FUNCIONALIDADES:
• Alterar Status: Clique no card da tarefa e selecione o novo status
• Filtros: Sprint(s), Situação, Datas, Responsável

REGRAS:
• Operadores visualizam apenas suas próprias tarefas
• Administradores visualizam todas as tarefas`
  },
  {
    title: "5. Daily",
    level: 1,
    content: `Caminho: Menu → Scrum → Daily

Registro do acompanhamento diário das atividades do time.

CAMPOS DO REGISTRO:
• Cliente (obrigatório)
• Sprint (opcional)
• Data do Registro (padrão: hoje)
• Usuário (preenchido automaticamente para operadores)
• O que foi feito ontem? (obrigatório)
• O que será feito hoje? (obrigatório)
• Impedimentos (opcional)

HISTÓRICO:
• Visualize o histórico de dailies na lateral direita
• Filtre por responsável e data
• Ver Histórico Completo: Acesse a página de histórico dedicada

REGRAS:
• Operadores veem apenas seus próprios registros
• Administradores veem todos os registros e podem filtrar por responsável`
  },
  {
    title: "6. Retrospectiva",
    level: 1,
    content: `Caminho: Menu → Scrum → Retrospectiva

Registro da análise pós-sprint para melhoria contínua.

SEÇÕES:
1. O que foi bom ✓ - Registre os pontos positivos da sprint
2. O que pode melhorar - Registre os pontos de melhoria
3. Ações - Defina ações para a próxima sprint

FUNCIONALIDADES:
• Adicionar Itens: Clique em "Adicionar item" em cada seção
• Remover Itens: Clique no "X" ao lado do item
• Salvar: Clique em "Salvar Retrospectiva"
• Exportar PDF: Gere um documento PDF da retrospectiva`
  },
  {
    title: "7. Roadmap",
    level: 1,
    content: `Caminho: Menu → Scrum → Roadmap

Visão completa de todas as tarefas com status calculado automaticamente.

KPIs EXIBIDOS:
• Total de tarefas
• Tarefas concluídas
• Percentual de conclusão

STATUS DAS TAREFAS:
• ENTREGUE: Tarefa com status Feito ou Validado
• EM SPRINT: Tarefa em sprint ativa
• EM ATRASO: Tarefa atrasada (data fim ultrapassada)
• NO PRAZO: Tarefa dentro do prazo
• PENDENTE: Tarefa sem sprint

FILTROS:
• Buscar por título
• Status
• Responsável
• Tipo de Tarefa

FUNCIONALIDADES:
• Clique em uma linha para ver detalhes da tarefa
• Exporte para Excel ou PDF`
  },
  {
    title: "8. Prioridades",
    level: 1,
    content: `Caminho: Menu → Prioridades

Gestão de cronogramas de projetos com visualização em grade hierárquica.

FUNCIONALIDADES:
1. Criar Projeto: Clique em "Novo Projeto", informe Nome, Descrição, Status

2. Gerenciar Cronograma: Selecione o projeto no combo

3. Tarefas do Cronograma:
   • Adicionar Tarefa: Use o botão "+"
   • Tarefas Resumo: Agrupe tarefas em hierarquia
   • Campos: Nome, Data início/fim, Duração, Responsável, Predecessoras, Status

4. Gráfico de Gantt: Visualização gráfica do cronograma`
  },
  {
    title: "9. Produtividade",
    level: 1,
    content: `Caminho: Menu → Produtividade

Registro e acompanhamento da produtividade dos prestadores de serviço.

ADICIONAR REGISTRO MANUAL:
• Clique em "Adicionar"
• Informe: Prestador, Cliente, Data Início, Data Fim, Total de Chamados

IMPORTAR PLANILHA:
• Clique em "Importar Arquivo"
• Baixe o modelo de importação
• Preencha: Código Prestador, Código Cliente, Datas, Total Chamados

VALIDAÇÕES:
• Datas não podem ser futuras
• Não permite períodos sobrepostos para mesmo prestador/cliente

FILTROS:
• Prestador, Cliente, Período (Mês/Ano), Tipo (Manual/Importado)`
  },
  {
    title: "10. Riscos e BO's",
    level: 1,
    content: `Caminho: Menu → Riscos e BO's

Gestão de riscos e Boletins de Ocorrência do projeto.

ABAS:
• Registro: Riscos abertos e em mitigação
• Acompanhamento: Riscos mitigados e materializados

CRIAR NOVO REGISTRO:

1. Identificação:
   • Tipo: Risco (Possibilidade) ou BO (Ocorrência)
   • Projeto: Selecione o cliente
   • Área Impactada: Delivery, Comercial, Financeiro, CS/CX, TI, Operação
   • Descrição do Risco

2. Avaliação:
   • Probabilidade: Baixa, Média, Alta
   • Impacto: Baixa, Média, Alta
   • Nível de Risco: Calculado automaticamente (Alto/Médio/Baixo)

3. Responsabilidade e Ação:
   • Origem, Responsável, Plano de Mitigação, Status, Data Limite`
  },
  {
    title: "11. Dashboard Scrum",
    level: 1,
    content: `Caminho: Menu → Dashboard's → Scrum

Visão geral do andamento das sprints selecionadas.

MÉTRICAS EXIBIDAS:
• A Fazer: Quantidade de tarefas pendentes
• Fazendo: Quantidade em progresso
• Feito: Quantidade concluídas
• Validado: Quantidade validadas
• Story Points: Total de SP da sprint

PERCENTUAL DE CONCLUSÃO:
• Calculado como: (Feito + Validado) / Total

GRÁFICO:
• Tarefas por responsável com ordenação configurável

FILTROS:
• Situação do Sprint, Intervalo de Datas, Sprint(s), Área

EXPORTAR:
• Clique em "Exportar Excel" para gerar relatório`
  },
  {
    title: "12. Dashboard Clientes",
    level: 1,
    content: `Caminho: Menu → Dashboard's → Clientes

Grid de indicadores (faróis) por cliente.

INDICADORES POR CLIENTE:
• Geral: Status consolidado
• Scrum: Indicador de Scrum
• Prioridades: Indicador de cronograma
• Produtividade: Indicador de produtividade
• Riscos e BO's: Indicador de riscos

LEGENDA DE CORES:
• Verde: Situação OK
• Amarelo: Atenção necessária
• Vermelho: Situação crítica`
  },
  {
    title: "13. Administração",
    level: 1,
    content: `Caminho: Menu → Administração (apenas Administradores)

ABA USUÁRIOS:
1. Cadastrar Novo Usuário:
   • Nome, E-mail, Senha (mín. 6 caracteres)
   • Tipo: Administrador ou Operador

2. Gerenciar Usuários:
   • Buscar por nome
   • Editar dados, Redefinir senha, Excluir

ABA INTEGRAÇÃO:
• Configuração de Webhook AVA
• Token de autenticação`
  },
  {
    title: "14. Perfis de Usuário",
    level: 1,
    content: `ADMINISTRADOR:
• Acesso total ao sistema
• Pode cadastrar e gerenciar usuários
• Visualiza dados de todos os responsáveis
• Acesso à área de administração

OPERADOR:
• Acesso às funcionalidades operacionais
• Visualiza apenas seus próprios dados (Sprint, Daily)
• Não pode acessar área de administração
• Campo de responsável bloqueado (preenchido automaticamente)`
  },
  {
    title: "15. Dicas de Uso",
    level: 1,
    content: `• Sprints Ativas: O sistema seleciona automaticamente a sprint ativa nos filtros
• Subtarefas: Use subtarefas para detalhar tarefas complexas
• Datas: O sistema considera o fuso horário de São Paulo
• Exportações: Utilize os botões de exportação para relatórios externos
• Filtros: Limpe os filtros clicando nos botões "Limpar"

Em caso de dúvidas, entre em contato com o administrador do sistema.

Versão do Manual: 1.0 - Janeiro/2025`
  }
];
