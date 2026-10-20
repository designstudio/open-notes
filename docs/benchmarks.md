# Benchmarks do Open Notes

O comando mede 1.000, 5.000 e 10.000 notas em Chromium headless, com IndexedDB nativo e a interface real em build de produção. Os dados são gerados por `benchmarks/fixtures.ts`; não são exportações de usuários.

## Baseline de 15 de outubro de 2026

Execução em Windows x64, Ryzen 7 5700X, 31,9 GiB de RAM e Chromium 156.0.8078.4. Cada tamanho teve uma rodada de aquecimento e cinco amostras medidas. Os tamanhos JSON dos espaços foram 2,31, 11,57 e 23,15 MiB. Veja a [tabela completa com mediana e p95](benchmarks/2026-10-15.md) e as [amostras e contagens de operações](benchmarks/2026-10-15.json).

| Operação — mediana | 1.000 notas | 5.000 notas | 10.000 notas |
| --- | ---: | ---: | ---: |
| Primeiro salvamento | 35,2 ms | 250,8 ms | 348,4 ms |
| Leitura do espaço | 34,7 ms | 151,1 ms | 301,2 ms |
| Persistir edição de uma nota | 0,9 ms | 2,4 ms | 4,2 ms |
| Assinatura completa para sincronização | 12,6 ms | 53,2 ms | 92,7 ms |
| Abrir lista completa na interface | 0,79 s | 2,98 s | 6,63 s |
| Filtrar os 1% de resultados | 0,13 s | 0,56 s | 1,33 s |
| Limpar filtro e remontar lista | 0,52 s | 3,12 s | 7,11 s |
| Editar título na interface até persistir | 65,7 ms | 148,7 ms | 265,7 ms |

Todas as verificações de integridade passaram. A edição gravou uma nota em todos os tamanhos, sem limpar o store ou regravar as outras. Isso não elimina variação de latência: a amostra mais lenta da edição isolada com 10.000 notas levou 45,2 ms, apesar da mediana de 4,2 ms.

A listagem completa foi o principal gargalo observado. O cenário com 10.000 notas montou 142.713 elementos no DOM; a busca também inclui remover e remontar as linhas. Esse resultado sustenta investigar virtualização ou paginação antes de afirmar que a interface está pronta para uso fluido com esse volume. A biblioteca inicial, que mostra coleções, teve mediana de 1,21 s nesse tamanho; ela não renderiza a mesma lista completa.

A geração da assinatura do espaço e a comparação de conflitos também cresceram com o volume: a decisão de conflito chegou a 265,6 ms de mediana, sem incluir rede. São outros pontos a investigar antes de otimizar o IndexedDB. O benchmark registra a situação atual; nenhuma dessas otimizações foi aplicada nesta etapa. Os resultados valem para este conjunto de dados, máquina e navegador, com os limites descritos abaixo.

## Executar

```sh
npm ci
npx playwright install chromium
npm run benchmark
```

O relatório fica em `docs/benchmarks/latest.json`, com uma tabela em `latest.md`. Para guardar uma execução identificada:

```sh
npm run benchmark -- --output docs/benchmarks/2026-10-15.json
```

Parâmetros opcionais:

```sh
npm run benchmark -- --sizes 1000,5000,10000 --repetitions 10
npm run benchmark -- --skip-ui
```

`--skip-ui` mede apenas armazenamento e preparação da sincronização. Uma execução pequena, útil para conferir o ambiente, é `--sizes 100 --repetitions 1`; não deve ser apresentada como baseline dos três tamanhos.

## Dados e isolamento

Cada nota possui título, etiquetas, pasta, data fixa e corpo de 1.024 caracteres, também representado como documento Tiptap. Há uma coleção com dez pastas, 10% de favoritas e um termo de pesquisa em 1% das notas. A coleção única permite medir uma lista com todas as notas ao mesmo tempo, um cenário deliberadamente pesado. Não há fotos, anexos nem documentos gigantes nesse conjunto.

O runner usa um perfil descartável do Playwright, um servidor restrito ao loopback em porta livre e um contexto novo por tamanho. Não usa o perfil do Chrome, Firefox ou Edge do usuário nem o servidor de desenvolvimento. A base chamada `open-notes` pertence exclusivamente à origem temporária do benchmark. O reset da base só pode ser iniciado pela página `/__benchmark` desse ambiente.

Requisições externas são bloqueadas. O build substitui o client ID Google por uma string vazia. Não existe login, upload para o Drive, leitura das notas reais ou captura de tela. Build e perfil temporários são descartados ao terminar; os relatórios contêm métricas, versão do browser, hardware resumido e identificação do código, sem nome de usuário, e-mail ou caminho do computador.

## O que é medido

| Métrica | Intervalo medido |
| --- | --- |
| `initialSave` | Primeiro salvamento completo, incluindo captura das entidades, abertura da base e commit. |
| `load` | Leitura, normalização, reordenação e captura das notas para estabelecer o estado persistido. |
| `unchangedSave` | Salvamento de um espaço sem alterações. |
| `editOne` | Salvamento após alterar título e data de uma única nota, mantendo as referências das demais. |
| `createOne` / `deleteOne` | Persistência da criação e exclusão permanente de um registro. |
| `selectWorkspace` | Filtro e ordenação do seletor usado pelo App. |
| `fingerprint` | Geração da representação canônica do espaço usada pela sincronização. |
| `compareSame` / `compareConflict` | Decisão de sincronização com uma cópia igual e uma com título divergente. |
| `serializeUpload` | Serialização JSON do snapshot completo; não inclui rede. |
| `backupTwoCopies` | Clonagem e commit da cópia de recuperação contendo versões local e remota. |
| UI `libraryStartup` | Navegação até a biblioteca carregada e dois frames; inclui boot do App e leitura do IndexedDB. |
| UI `renderAllNotes` | Clique na coleção até todas as linhas existirem no DOM e dois frames. |
| UI `searchRare` | Preenchimento do filtro até restarem os 1% de resultados e dois frames. |
| UI `clearSearch` | Limpeza do filtro até todas as linhas voltarem ao DOM e dois frames. |
| UI `openEditor` | Clique na primeira nota até título e editor formatado estarem disponíveis e dois frames. |
| UI `editTitleToPersistence` | Alteração do título até confirmar o valor no IndexedDB e dois frames. |

O relatório também registra o número de elementos no DOM quando todas as notas estão listadas. É uma medida de complexidade da tela, não de memória RAM. Além disso, `startupDomNodes` conta os elementos da biblioteca logo após o carregamento, antes de qualquer coleção ser aberta: nesse momento a barra lateral é o único lugar onde linhas de nota podem existir, então o número mostra quanto a árvore de coleções monta com painéis recolhidos.

## Amostragem e verificações

O padrão é uma rodada de aquecimento descartada e cinco rodadas medidas por tamanho, tanto para armazenamento quanto para UI. Cada rodada de armazenamento recria a base fora do intervalo medido. Cada rodada de UI começa com os dados novamente semeados e uma página nova. A mesma instância do navegador e os caches do sistema podem continuar aquecidos: isso não mede partida a frio do sistema operacional.

Os tempos do núcleo usam `performance.now()` dentro do navegador, até a conclusão das transações. Uma instrumentação temporária conta operações do object store de notas. O runner exige N gravações no primeiro salvamento, zero no salvamento sem mudanças, uma na edição e na criação e uma exclusão ao apagar. Nenhuma dessas operações pode limpar o store inteiro. Esses contadores não representam bytes gravados pelo sistema de arquivos, e os tempos incluem o pequeno custo da instrumentação.

Fora das janelas de medição, são conferidos conteúdo e ordem na leitura, persistência do título, contagem após criar/apagar, preservação das demais notas, decisão de conflito e integridade das duas cópias de recuperação. Na UI são conferidas quantidades de resultados, presença do editor e persistência do título. Erros JavaScript na página interrompem o benchmark.

São guardadas todas as amostras, mínimo, mediana, p95 e máximo. O p95 usa o método nearest-rank: com cinco amostras, corresponde ao máximo observado. Essa quantidade serve como baseline exploratório; mais repetições são necessárias para caracterizar variação e caudas com confiança. As verificações são de integridade, sem limite de tempo artificial que faça a execução “passar” ou “falhar” por velocidade.

## Interpretação e limites

Tempos de UI incluem envio de ações pelo Playwright, espera da condição no DOM e dois frames. Eles aproximam operações completas da tela, mas não são INP, FPS, tempo puro de renderização React nem medição física de pintura. O headless pode diferir do navegador usado no dia a dia. O filtro é preenchido de uma vez, sem simular cada tecla de uma frase.

Os testes de sincronização neste benchmark medem CPU, serialização e backup locais. Latência, autorização, concorrência entre dispositivos e throughput real do Google Drive estão fora da medição. Documentos maiores, imagens, outras distribuições de coleções e outros browsers também precisam de execuções próprias.

Um salvamento que grava um único registro ainda pode percorrer o array de notas e seus metadados. Assim, persistência granular não significa custo constante. Da mesma forma, listar todas as notas pode ser dominado por montagem e remoção de milhares de elementos no DOM. Use a tabela e as amostras para separar esses custos antes de escolher otimizações.

O campo `source.dirty` indica se havia alterações locais no código durante a medição. Ao comparar execuções, mantenha dados, navegador, hardware e parâmetros semelhantes. Um relatório parcial tem `complete: false` e não deve ser apresentado como uma execução concluída.

### Identificação do código e do runner

Relatórios novos usam `source.fingerprintVersion: 2`. O campo `source.codeSha256` identifica somente `src/`, `package.json`, `package-lock.json`, `vite.config.ts` e `index.html`. O campo `source.runnerSha256` identifica separadamente os arquivos de `benchmarks/`, incluindo runner, fixtures, harness de navegador, configuração TypeScript e implementação do fingerprint.

Cada identidade usa caminhos relativos ordenados e únicos, o tamanho de cada arquivo e seus bytes no diretório de trabalho. Fontes não rastreados e não ignorados também entram no cálculo, de forma que adicionar um arquivo ao staging não altera sua identidade. Arquivos ausentes são omitidos tanto antes quanto depois de preparar a exclusão no índice. Logs ignorados e arquivos fora dos escopos acima não participam. Apenas o código da aplicação afeta `codeSha256`; alterações exclusivamente no benchmark afetam `runnerSha256`.

Os relatórios antigos são preservados sem recalcular seus hashes. Antes da versão 2, o conjunto podia misturar app e benchmark e contar arquivos modificados duas vezes; `runnerSha256`, quando presente, cobria apenas o arquivo de entrada. Esses hashes legados não são diretamente comparáveis aos novos. Eles identificam evidências históricas, não uma medição do estado atual do repositório.

Os testes dessa identificação não executam benchmarks nem builds:

```sh
node --test tests/benchmark-fingerprint.test.mjs
```

O [inventário de relatórios](benchmarks/report-inventory.json) registra os SHA-256 dos JSONs completos, caminhos canônicos e cópias idênticas. As evidências antes exclusivas de diretórios ignorados foram copiadas para `docs/benchmarks/sidebar-history/`, com os originais preservados. Resultados distintos com o mesmo hash de código continuam sendo execuções independentes; não devem ser deduplicados apenas por esse campo.
