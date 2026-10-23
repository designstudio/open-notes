# Testes do Open Notes

Execute toda a suíte com:

```sh
npm test
```

O runner `tests/run.mjs` compila os arquivos TypeScript para uma pasta temporária e executa o test runner do Node. A pasta é removida ao final, inclusive quando há falhas. Os testes não acessam o perfil do navegador nem uma conta Google real.

## Versionamento e migrações

`tests/migrations.test.ts` cobre 48 cenários de migração. As fixtures isoladas simulam versões 3 e 4 sem alterar a versão 2 do banco de produção. Há cobertura de caminhos sequenciais, 5.000 notas, integridade de IDs/metadados/referências, preservação de documentos e backups, banco mais recente, esquema incompleto, bloqueio por outra aba, rollback de toda a cadeia, interrupções e nova tentativa.

```sh
npx playwright install chromium
npm run test:migrations:browser
```

Os sete cenários adicionais de `tests/migrations-browser.mjs` verificam as garantias centrais no IndexedDB nativo do Chromium, com porta, perfil e dados temporários. Detalhes, contrato para novas etapas e limites da simulação de interrupções estão em [Versionamento e migrações](migrations.md).

## Criação, edição, exclusão e recuperação

`tests/app-flows.test.tsx` monta o `App` real em StrictMode com os hooks, a navegação, o salvamento automático e o armazenamento granular. Verifica:

- Criação com IDs diferentes, coleção, pasta e opções padrão.
- Edição de título, documento formatado, texto, etiquetas e campos opcionais, preservando outras notas.
- Persistência após desmontar o aplicativo, ler novamente o IndexedDB e montar outra instância.
- Lixeira e restauração pelo editor ou pela ação da notificação.
- Exclusão permanente do registro, preservação das demais notas e conteúdo ausente após reabrir o link.
- Cancelamento da confirmação de exclusão, confirmação explícita e proteção contra confirmação duplicada.
- Falha de salvamento com texto ainda disponível em memória, indicação de erro e nova tentativa bem-sucedida.
- Leitura e exportação JSON das cópias de recuperação após uma exclusão, preservando o documento formatado.

Não há uma interface de importação/restauração de backup sendo simulada como se já existisse: o teste de backup confirma a integridade da cópia exportável. A restauração da lixeira é exercitada pelo fluxo real do App.

## Sincronização e conflitos

`tests/sync-integration.test.tsx` usa o mesmo App e o cliente HTTP real da integração com uma API Google substituída por um servidor em memória. Cada fluxo compara o estado do aplicativo, o IndexedDB e a cópia do Drive simulado. Inclui:
- Primeiro envio multipart e envio automático após o intervalo de 1.200 ms sem novas edições.
- Propagação de criação, edição, lixeira, restauração e exclusão permanente.
- Escolha da cópia local e da cópia do Drive, persistência após reabrir e preservação das duas versões nos backups.
- Nova revisão quando outro dispositivo altera a cópia durante a escolha.
- Bloqueio da substituição quando a gravação do backup falha, mantendo a edição local disponível.
- Edições feitas durante um conflito, uma leitura inicial, a verificação anterior ao envio e um envio em andamento.
- Desconexão durante leitura ou escrita, sem novos envios após desconectar.
- Escrita offline e retorno da conexão, tanto com o Drive intacto quanto com alterações em outro dispositivo.
- Falha HTTP, nova tentativa explícita, autorização expirada ou cancelada e formato de snapshot incompatível.

Esses testes detectaram e corrigiram um caso em que o intervalo de uma nova edição expirava durante um envio existente: a edição permanecia local sem ganhar outro envio. Após concluir um envio com sucesso, o hook verifica se ainda há diferenças e agenda o envio pendente. Uma falha não inicia um ciclo de tentativas automático. A conclusão de uma requisição já emitida também respeita uma desconexão posterior.

## Conexão preservada entre remontagens

`tests/drive-session.test.tsx` monta o hook com um cache de sessão compartilhado, que reproduz uma remontagem do Vite, e com um cache novo, que reproduz uma recarga completa. Verifica:

- Remontagem com a mesma cópia do Drive mantém a conexão sem nova autorização, sem requisição ao Drive e sem envio.
- Recarga completa começa sem token, sem afirmar que a conta está conectada e mantendo apenas a indicação de vínculo anterior.
- Token expirado não é reutilizado, o arquivo localizado é lembrado e a próxima autorização não recomeça do zero.
- HTTP 401 encerra a autorização e interrompe os envios automáticos.
- HTTP 403 de cota ou de permissão mantém a conexão, explica o motivo e permite nova tentativa sem autorizar de novo.
- Apenas 401 é classificado como expiração; 403 e 500 recebem classificações próprias.
- Desvincular revoga o token, limpa a sessão e não envia nada depois, inclusive após remontar.
- Remontagem com alterações locais não envia nem resolve o conflito sozinha: a comparação vem antes de qualquer gravação.
- Reconectar a uma cópia alterada em outro lugar pausa para uma escolha, sem enviar.
- Reaproveitamento sem interação indisponível cai para a autorização visível, sem prometer sucesso silencioso.

A sessão é substituída por um objeto controlado pelo teste, e a rede continua sendo um `fetch` simulado. Nenhum arquivo real do Google Drive é acessado ou modificado.

## Limites e isolamento

`tests/helpers/app-ui.tsx` substitui apenas os componentes de apresentação do App por pontos de observação tipados. Os testes acionam os callbacks usados pela interface; não exercitam o DOM completo, o Tiptap, os popovers ou a aparência. A confirmação de exclusão usa seu componente real, com o fechamento animado controlado pelo teste.

O IndexedDB usa `fake-indexeddb`, sem arquivos do usuário. A rede usa `fetch` simulado; requisições para destinos inesperados são rejeitadas. O relógio e as respostas HTTP podem ser controlados para reproduzir as corridas sem esperar pela rede ou por intervalos reais. Cada teste descarta sua base e restaura os globais substituídos.

São testes de integração, complementados pelos testes existentes de unidades e armazenamento; não substituem testes E2E em um navegador nem testes contra o serviço Google real. Os limites de concorrência entre dispositivos descritos no README continuam valendo.

## Benchmarks em navegador

`npm run benchmark` executa os cenários de 1.000, 5.000 e 10.000 notas em Chromium headless com IndexedDB nativo e build de produção. Inclui operações de armazenamento, preparação de sincronização e ações na interface real. Cada cenário verifica a integridade dos resultados, mas não aplica limites de tempo de aprovação. Execução, isolamento e limites estão em [Benchmarks](benchmarks.md).

## Inicialização e editor no navegador

```sh
npx playwright install chromium
node tests/startup-browser.mjs
```

Esse teste complementa a suíte de 267 testes com Chromium real, nas versões de produção e desenvolvimento. Gera um build temporário e usa servidores locais e perfis descartáveis, sem acessar as notas do navegador do usuário. Requisições externas são bloqueadas e o client ID Google fica desativado.

- Abre a biblioteca e confirma que as preferências não foram solicitadas antecipadamente.
- Retém o download do editor para verificar o indicador sem texto e o título oculto até a nota estar pronta.
- Confirma a ausência da mensagem “Abrindo seu espaço”.
- Libera o editor, verifica o conteúdo original e edita título e corpo.
- Confirma o corpo salvo no IndexedDB e a preservação do título e do texto após recarregar.
- Abre e fecha as preferências, com foco dentro do diálogo.
- Navega para uma nota já preparada e confirma que editar o título mantém a mesma instância do editor no DOM.
- Cria uma nova nota e verifica o foco automático no título após a montagem.
- Falha se houver exceções JavaScript na página.
- Em outro perfil descartável, abre uma base futura isolada e verifica a orientação de atualizar o app, sem alterar notas ou o registro de controle dessa base.

Com `node tests/startup-browser.mjs --screenshots`, também gera `artifacts/note-loading-desktop.png` e `artifacts/note-loading-mobile.png` durante a espera. O cenário mobile verifica o indicador estático com movimento reduzido. As capturas ficam fora do Git; o build e os perfis são descartados ao terminar. O teste não mede latência do serviço Google nem substitui uma auditoria completa de acessibilidade.

A comparação de desempenho e os limites de interpretação estão em [Inicialização](startup-performance.md).

## Sincronização Dropbox

`npm test` também executa `dropbox-sync.test.tsx`, `dropbox-files.test.mjs` e
`dropbox-auth.test.mjs`: snapshots completos, revisão condicional, conflito,
backups, restauração, offline, mudança de provedor, falhas de permissão/cofre,
limites e proteções de origem/sessão/CSRF. Os testes do Drive permanecem ativos.

Após `npm run build`, `npm run test:dropbox:browser -- --screenshots` usa navegador
e IndexedDB reais em perfil descartável, com cofre, OAuth e Dropbox simulados.
Valida vínculo, ativação explícita, envio automático de nota editada fora das
Preferências somente no intervalo escolhido, seleção persistente de periodicidade,
sincronização manual, última/próxima sincronização, reinício, renovação e revogação.
Também verifica o menu de periodicidade por teclado e ponteiro, o retorno de foco
ao fechar com Esc, o layout em desktop/mobile e a exportação das cópias de segurança.
O perfil descartável tem o localStorage preenchido até gerar `QuotaExceededError`;
a sincronização manual deve concluir usando o controle persistido no IndexedDB.
Os testes do hook também cobrem restauração com essa cota esgotada, leitura dos
metadados antigos, banco indisponível e aborto da transação antes do download.
Os relógios são simulados, sem aguardar horas reais. Nenhuma
conta real é acessada. As capturas ficam no diretório temporário do sistema.

## Rolagem da sidebar

Após `npm run build`, execute `npm run test:sidebar:browser`. O teste usa 108 notas
sintéticas em um perfil descartável, sem acessar contas reais. No Chromium,
verifica cinco tamanhos de tela, desktop e mobile, mantendo apenas a lista de
notas e coleções rolável, com cabeçalho e perfil fixos e suporte a rolagem por
teclado. Detecta a barra duplicada que o overflow propagado criava no contêiner
externo. Também executa no Firefox quando esse navegador já está instalado no
Playwright. `-- --screenshots` salva capturas no diretório temporário do sistema.
