# Histórico de alterações

## 2026-10-18

### Inicialização e carregamento das notas

- Carregamento separado do editor Tiptap e das preferências, reduzindo o JavaScript necessário para abrir a biblioteca.
- Preparação do editor em tempo ocioso, com montagem direta quando já estiver disponível e preservação da instância durante a edição.
- Remoção da mensagem “Abrindo seu espaço”, mantendo a leitura do IndexedDB e a tela de erro com nova tentativa.
- Indicador sem texto, centralizado na área interna da nota e visível apenas após 180 ms de espera. Capa, título, corpo e rodapé aparecem juntos quando o editor estiver pronto.
- Indicador estático com movimento reduzido, controles da nota inativos durante o carregamento e foco no título de notas novas após a montagem.
- Criação do Tiptap após o commit do React e recuperação do foco nas preferências carregadas de forma assíncrona.
- Eliminação da comparação duplicada do espaço ao iniciar a sincronização, inclusive na repetição de efeitos pelo StrictMode.

### Medições, testes e documentação

- Relatórios antes/depois com 1.000 notas sintéticas: JavaScript inicial de 1.314,10 para 698,90 kB e mediana da biblioteca de 297,6 para 251,8 ms, antes do refinamento visual do indicador.
- Teste em navegador para produção e desenvolvimento, cobrindo carregamento retido, conteúdo oculto durante a espera, persistência, recarga, navegação, foco e estabilidade do editor.
- Capturas opcionais de desktop e celular, com verificação de movimento reduzido.
- Documentação da inicialização, dos limites das medições e da diferença entre o build de produção e a primeira abertura do servidor de desenvolvimento.

## 2026-10-15

### Organização do aplicativo

- Separação do `App.tsx` em componentes de editor, cabeçalho, biblioteca, listagem, barra lateral e diálogos.
- Extração dos hooks de navegação, aparência, persistência, notificações e preferências.
- Preservação da sessão de edição durante substituições de módulos do Vite, evitando reaplicar a cópia antiga carregada ao abrir a aba.

### Persistência e recuperação

- IndexedDB versão 2 com registros individuais por nota e metadados separados para coleções, pastas, perfil e ordem das notas.
- Gravação somente das entidades alteradas, com fila de salvamentos e confirmação após o commit da transação.
- Migração automática do formato anterior com preservação do registro original e dos backups existentes.
- Página de consulta e exportação das notas e cópias de recuperação, sem escrita no armazenamento.

### Sincronização

- Novo envio automático quando uma edição feita durante um envio em andamento ainda estiver pendente após sua conclusão.
- Conclusão de requisições já emitidas respeita o estado de desconexão.
- Mantidas as escolhas explícitas de conflito e a preservação das versões antes de substituir dados.

### Testes e documentação

- Benchmarks reproduzíveis com 1.000, 5.000 e 10.000 notas sintéticas em Chromium headless, com IndexedDB nativo e build de produção.
- Medições de salvamento, leitura, CRUD, seleção, preparação de sincronização, backups e interface, com contagem de gravações, verificação de integridade e relatórios de amostras, medianas e p95.
- Testes de migração, gravações granulares, rollback, filas e preservação de outras notas.
- Testes de integração de criação, edição, lixeira, restauração, exclusão permanente e integridade dos backups exportáveis.
- Testes de sincronização, conflitos, edições durante requisições, desconexão, modo offline, falhas HTTP e autorização.
- Suíte com 109 testes, usando armazenamento e API Google simulados; testes de integração não substituem E2E do navegador.
- Documentação de arquitetura, persistência, recuperação e testes, com navegação pelo README.
