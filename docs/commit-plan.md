# Plano de commits do Open Notes

Preparação de 20 de outubro de 2026. Este plano não representa commits executados ou arquivos preparados no índice.

## 1. Sidebar: limite e acessibilidade

`feat(sidebar): limit collection previews to eight notes`

- `src/app/workspace-selectors.ts`: agrupamento das notas.
- `src/app/AppSidebar.tsx`: importação do agrupamento, limite de oito, contador completo, link Ver todas, navegação e nome acessível por coleção. Neste commit, usar o comportamento anterior de desmontagem imediata; reservar `CollectionNotesPanel` e seus imports para o commit 2.
- `src/sidebar.css`: estilos do link, hover apenas de cor e margens das listas. Reservar o comentário sobre retenção para o commit 2.
- `tests/run.mjs`: infraestrutura que permite testar a sidebar real.
- `tests/helpers/sidebar-environment.ts`: ambiente de navegador, reservando `getComputedStyle` para o commit 2.
- `tests/sidebar-tree.test.tsx`: quatro testes de renderização, limite, ordenação, navegação, contadores e nomes acessíveis. Reservar os três testes de recolhimento, o helper `toggle` e a alternância de expansão no Harness para o commit 2.

## 2. Sidebar: transição de recolhimento

`fix(sidebar): retain note rows through collapse transitions`

- `src/app/AppSidebar.tsx`: `CollectionNotesPanel`, imports de hooks/tipos, retenção inerte, limpeza por transitionend e timer, suporte a movimento reduzido e integração com a lista.
- `src/sidebar.css`: comentário sobre a desmontagem ao terminar a transição.
- `tests/helpers/sidebar-environment.ts`: mock de estilos computados.
- `tests/sidebar-tree.test.tsx`: helper e alternância do Harness; três regressões de fechamento/reabertura, movimento reduzido e ausência de transitionend.

Depende do commit 1. Os arquivos compartilhados precisam ser separados por trechos ao preparar os commits; não devem ser adicionados inteiros ao primeiro commit.

## 3. Preferências

`fix(preferences): load dialog content and styles eagerly`

- `src/app/AppDialogs.tsx`: importação direta e remoção de lazy/Suspense/fallback.
- `src/Preferences.tsx`: atualização do comentário sobre o foco inicial.

## 4. Animações de menu e cards

`fix(motion): align create menu close timing and folder easing`

- `src/CreateMenu.tsx`: fechamento pelo token do dropdown, com fallback de 150 ms; abertura com spring preservada.
- `src/folders.css`: easing do transform do ícone, mantendo 160 ms.

## 5. Fingerprint e instrumentação de benchmarks

`fix(benchmarks): separate staging-independent app and runner fingerprints`

- `benchmarks/fingerprint.mjs`: identidades v2 independentes, fontes novos incluídos, arquivos únicos e leitura do working tree.
- `benchmarks/run.mjs`: integração dos fingerprints, identidade versionada e instrumentação existente de startupDomNodes.
- `tests/benchmark-fingerprint.test.mjs`: oito testes isolados, sem execução de performance.
- `docs/benchmarks.md`: metodologia de DOM inicial, escopo das duas identidades, teste dedicado e limites dos hashes antigos.

Os testes fazem git init/config/add apenas em repositórios criados no diretório temporário do sistema. Não fazem commits nem alteram o índice do Open Notes. Nesta preparação, não removem seus diretórios temporários, para respeitar a restrição de não apagar arquivos.

## 6. Evidências históricas de benchmarks

`docs(benchmarks): preserve unique sidebar comparison and historical runs`

- `docs/benchmarks/report-inventory.json`.
- `docs/benchmarks/2026-10-19-before.json` e `.md`.
- `docs/benchmarks/2026-10-19-after-startup-dom.json` e `.md`.
- `docs/benchmarks/after-run2.json` e `.md`.
- `docs/benchmarks/after-run3.json` e `.md`.
- `docs/benchmarks/sidebar-history/baseline-startup-dom.json` e `.md`.
- `docs/benchmarks/sidebar-history/baseline-run2.json` e `.md`.
- `docs/benchmarks/sidebar-history/baseline-run3.json` e `.md`.
- `docs/benchmarks/sidebar-history/baseline-run4.json` e `.md`.
- `docs/benchmarks/sidebar-history/baseline-rerun.json` e `.md`.
- `docs/benchmarks/sidebar-history/after-superseded.json` e `.md`.
- `docs/benchmarks/sidebar-history/after-2-superseded.json` e `.md`.

Cada par copiado preserva exatamente os bytes do original. Os quatro baselines com startupDomNodes são evidências distintas; o rerun sem essa métrica e as duas execuções substituídas são histórico. Os relatórios anteriores já rastreados de 15 de outubro e startup-before/startup-after continuam preservados e não precisam ser adicionados novamente.

Os nomes e timestamps originais não foram alterados. Em particular, o relatório after-startup-dom nomeado como 19 de outubro foi gerado em 20/10 às 00:09 no horário de São Paulo. Os relatórios não certificam as funcionalidades atuais nem o novo algoritmo de fingerprint.

## 7. Registro da preparação

`docs: document commit boundaries and preserved benchmark artifacts`

- `docs/commit-plan.md` (este arquivo).

## Fora dos commits propostos

- `docs/benchmarks/after-4.json`: cópia exata de `2026-10-19-after-startup-dom.json`; mantida no disco, mas não deve ser versionada novamente.
- `diagnostics-sidebar-dom.mjs`: diagnóstico avulso; preservar localmente, fora dos commits funcionais.
- `tsconfig.tsbuildinfo`: cache gerado já rastreado; não incluir sua atualização nos commits funcionais. Seu tratamento é uma tarefa separada.
- `.env.local`, `dist/`, `node_modules/` e artefatos de logs, perfis e capturas: preservados, sem inclusão automática.
- `artifacts/baseline-tree/`: worktree registrado, intacto. Seus arquivos não entram por esse caminho nos commits da raiz; somente as cópias documentadas acima entram no commit 6.
- Outros diagnósticos, evidências de GitHub/README e variantes de fontes em `artifacts/`: preservados para revisão separada; não há autorização implícita para descarte.

## Origem e validação

A implementação inicial da sidebar, seletores, infraestrutura de testes, relatórios e alterações do runner já existia na primeira inspeção desta conversa. Não há evidência suficiente no Git para atribuí-la entre Cline/DeepSeek e MiniMax. Preferências, hover do link e os três ajustes de animação foram feitos pelo Codex nesta conversa. A adição do nome acessível e de suas verificações apareceu depois, sem autoria confirmada pelo histórico disponível.

A preparação do fingerprint não deve alterar esses arquivos de aplicação ou seus testes. A comparação de hashes antes e depois verifica sua preservação, a preservação dos arquivos do worktree e do índice da raiz. Nenhum benchmark foi executado para produzir este inventário.
