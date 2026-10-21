# Histórico de alterações

## 2026-10-21

### Sincronização opcional com Dropbox

- Snapshot completo na App Folder pessoal, com ativação explícita e apenas um provedor ativo por vez.
- Sincronização automática configurável em 1h, 3h, 6h, 12h ou 24h (padrão 1h), com última/próxima execução e sincronização manual. O salvamento local permanece imediato.
- Atualizações condicionadas à revisão do Dropbox, backups no IndexedDB e escolha explícita em conflitos.
- Tokens continuam no cofre do Windows e no processo Node local; nenhum backend central ou dependência nova.
- Vínculos anteriores precisam de nova autorização com permissões de conteúdo. Snapshot limitado inicialmente a 20 MiB.
- Preferências com menu Integrações, APP Key pessoal oculta, URL copiável e menu de periodicidade com os padrões do aplicativo.
- Card próprio para exportar cópias de segurança em JSON; ícones de estado e exportação padronizados.

## 2026-10-20

### Conexão com o Google Drive preservada em atualizações

- Sessão do Drive mantida apenas em memória com `import.meta.hot.data`: remontagens do Vite durante o desenvolvimento não pedem autorização de novo, não leem o Drive e não enviam nada.
- Token reutilizado somente enquanto válido e descartado por uma recarga completa. Nenhum token é gravado em `localStorage`, `sessionStorage` ou IndexedDB.
- Autorização reaproveita permissões já concedidas com `prompt: ''` e recorre à autorização visível quando o Google exige interação, sem prometer autenticação silenciosa.
- Apenas HTTP 401 é tratado como token expirado. HTTP 403 de permissão ou cota mantém a conexão, explica o motivo e permite nova tentativa.
- Revogação do acesso restrita à ação explícita de desvincular, e conta apresentada como conectada somente após uma autorização confirmada.
- Remontagem com alterações locais compara as cópias antes de qualquer gravação, sem upload nem resolução automática de conflito.
- 12 testes novos, totalizando 176, cobrindo remontagem, recarga, expiração, 401, 403, desvinculação e reconexão.

## 2026-10-19

### Apresentação e descoberta do projeto

- Apresentação no README como alternativa para escrita pessoal a Notion, Obsidian e Superhuman Docs, com resumo em inglês, recursos existentes e limites atuais.
- Descrição e 16 topics publicados no GitHub para busca por aplicativos de notas, Markdown e alternativas a esses editores, sem promessa de posição no ranking.
- Licença MIT adicionada por escolha do mantenedor, com identificação no README, `package.json` e lockfile, permitindo apresentar o projeto como open source.
- Link para relatar problemas e sugestões, com orientação para preservar dados pessoais.

### Aparência

- Toast com superfície neutra: branco no modo claro e escuro no modo escuro, independente da paleta de destaque.
- Ação Restaurar com fundo e texto neutros, preservando contraste, animação e comportamento.

## 2026-10-18

### Versionamento e futuras migrações

- Registro de migrações incrementais com validação da sequência, da origem e de cada destino na mesma transação de upgrade.
- Reversão de toda a cadeia em falhas de conversão, validação, requests, callbacks ou interrupção por aborto; nova tentativa a partir da versão original.
- Validação de stores, IDs, metadados, ordem, campos essenciais e referências entre notas, pastas e coleções, recusando dados inválidos sem reparo silencioso.
- Rejeição de bancos mais recentes sem downgrade, com orientação para atualizar o app; tratamento de bloqueio por outra aba sem executar um upgrade abandonado depois.
- Banco de produção mantido na versão 2. Versões 3 e 4 simuladas apenas em fixtures, incluindo conservação de 5.000 notas, documentos, perfil e backups.
- 48 testes novos, totalizando 157, mais sete cenários no IndexedDB nativo e verificação da mensagem de incompatibilidade em produção e desenvolvimento.
- Guia de contrato, publicação, atomicidade, compatibilidade e limites das migrações em `docs/migrations.md`.
- Documentação atualizada da iconografia Solar Icons, dos padrões de animação do Transitions.dev e do uso de `framer-motion`, corrigindo a referência antiga a Reicon no guia de design.

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
