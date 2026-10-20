# Benchmark Open Notes

Execução: 2026-10-20T03:09:33.568Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 32.2 / 35.8 | 230.4 / 263.2 | 473.1 / 529.4 |
| load | 29.2 / 30.8 | 146.3 / 157.2 | 264.4 / 306.5 |
| unchangedSave | 3.7 / 5.1 | 2.5 / 22.6 | 4.4 / 5.0 |
| editOne | 1.0 / 1.2 | 2.4 / 18.5 | 3.9 / 4.1 |
| createOne | 0.9 / 1.3 | 3.3 / 3.5 | 5.8 / 6.8 |
| deleteOne | 0.8 / 0.8 | 2.8 / 6.1 | 5.2 / 6.1 |
| selectWorkspace | 0.3 / 0.5 | 1.9 / 2.7 | 4.4 / 6.0 |
| fingerprint | 11.0 / 11.7 | 54.4 / 63.1 | 104.4 / 194.8 |
| compareSame | 20.2 / 21.7 | 112.9 / 116.2 | 219.5 / 276.4 |
| compareConflict | 25.5 / 27.8 | 150.3 / 162.5 | 292.6 / 297.3 |
| serializeUpload | 1.5 / 2.1 | 14.3 / 16.8 | 26.0 / 26.5 |
| backupTwoCopies | 22.5 / 28.1 | 115.9 / 119.0 | 258.1 / 330.4 |
| UI: libraryStartup | 185.6 / 194.6 | 356.7 / 371.3 | 551.4 / 566.0 |
| UI: renderAllNotes | 774.9 / 806.0 | 3669.2 / 3739.5 | 7724.2 / 7870.8 |
| UI: searchRare | 123.7 / 128.5 | 566.5 / 594.3 | 1323.0 / 1349.3 |
| UI: clearSearch | 519.4 / 600.6 | 3076.9 / 3109.3 | 6689.9 / 7034.7 |
| UI: openEditor | 195.9 / 197.4 | 804.7 / 853.4 | 1722.9 / 1754.2 |
| UI: editTitleToPersistence | 65.6 / 67.4 | 165.5 / 167.2 | 266.2 / 283.1 |
| UI DOM: nodes at library startup | 244 | 244 | 244 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.

## Abertura de coleção: investigação da regressão (2026-10-19)

O ganho de startup vem de não montar as notas de coleções recolhidas. Como efeito colateral, abrir a coleção passa a **montar** os links de nota dentro da animação `grid-template-rows: 0fr → 1fr` do painel. Medição dedicada (mesmo procedimento nas duas árvores, 5 rodadas por tamanho, tempo até o último `.note-row` existir + 2 frames):

| Versão | 1.000 notas | 10.000 notas |
| --- | ---: | ---: |
| HEAD (baseline) | 808 ms | 6.467 ms |
| Recolhidas sem lista (estado atual) | 813–830 ms | 7.789–7.928 ms |
| Tentativa 1: `<ul>` sempre montado, só os `<li>` condicionais | 848 ms | 8.513 ms |
| Tentativa 2: `transition:none` no `.t-acc-panel` do sidebar | 847 ms | 8.243 ms |
| Reversão das tentativas (repetição) | 919 ms | 9.742 ms |

Conclusão: com 1.000 notas não há diferença; com 10.000 a abertura é 20–50% mais lenta que o HEAD. Nenhuma das duas hipóteses (estado inicial do `ul` ou a transição do grid row) explica o custo — os perfis de CPU das duas árvores são praticamente idênticos (`focus`, GC e `addEventListener` no topo), e remover a transição não mudou o resultado. O custo restante vem da montagem em si (links com `draggable`, listeners de drag e foco) combinada ao layout do scroll container do sidebar, algo que não existe quando as linhas já estão no DOM.

Reversão: as duas tentativas foram descartadas e o código ficou no estado "recolhidas sem lista", que preserva o ganho de startup. A regressão de abertura em 10.000 notas permanece e fica documentada aqui; a próxima mudança recomendada é virtualizar as linhas da coleção aberta, o que vai além do escopo desta otimização. A repetição da versão atual (9.742 ms) também mostra a variabilidade entre processos dessa máquina, então compare sempre medianas de várias execuções.

## Limite de 8 notas por coleção com “Ver todas” (2026-10-19)

A coleção expandida passou a montar no máximo 8 linhas de nota (`COLLECTION_PREVIEW_LIMIT`, aplicado com `slice` antes de criar os componentes), com um link “Ver todas” que abre a visualização completa da coleção pela navegação existente (`openCollection`). O agrupamento passou a usar `recent` (a ordenação da barra lateral) em vez de `active` (ordem de dados), preservando a ordenação anterior às listas preguiçosas. Contadores continuam exibindo o total; coleções recolhidas continuam sem montar listas.

Medição com `artifacts/timing-open-collection.mjs` (5 rodadas por ponto, mesma sessão, comparação pareada). Além do modo original (`open`), o script ganhou um modo `sidebar` que pré-carrega a visualização da coleção, recolhe a árvore e mede só a reexpansão — isolando o custo da barra lateral do custo da lista principal:

| Versão / modo | 1.000 notas (`open`) | 10.000 notas (`open`) | 10.000 notas (`sidebar`) |
| --- | ---: | ---: | ---: |
| HEAD (baseline) | 816 ms | 6.598 ms | 3.255 ms |
| Sem limite (documentado em 2026-10-19) | 813–919 ms | 7.789–9.742 ms | — |
| Com limite de 8 + “Ver todas” | 733 ms | 7.262 ms | 2.585 ms |

Leitura honesta dos números:

- A expansão isolada da barra lateral (o alvo direto da mudança) caiu de 3.255 ms para 2.585 ms com 10.000 notas; o DOM expandido passou de 10.000 para 9 links (8 notas + “Ver todas”).
- No modo composto de 10.000 notas o custo dominante é a montagem da lista principal (10.000 `.note-row`), que o limite não altera. A sobra de ~0,7 s sobre o HEAD é menor que os ~1,3–3,2 s observados sem o limite, mas segue dentro da variabilidade entre processos já registrada aqui (o mesmo código sem limite mediu 7,8–9,7 s em três execuções); as distribuições por rodada não se sobrepõem nesta sessão, então não afirmo paridade.
- Com 1.000 notas não há diferença relevante (816 vs 733 ms).

Compatibilidade com os benchmarks oficiais: nenhum critério pressupõe todas as notas montadas na barra lateral. `renderAllNotes` espera `.note-row` da lista principal; `benchmarks/browser.ts` valida `selectWorkspace(...).active.length === count` sobre dados, não sobre o DOM; `startupDomNodes`/`domNodes` são apenas registrados (e tendem a cair, pois o painel expandido monta 9 links em vez de N). Não houve alteração de critérios.
