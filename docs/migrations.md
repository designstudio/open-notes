# Versionamento e migrações do IndexedDB

## Estado de produção

O banco `open-notes` continua na **versão 2**, com os stores `notes`, `metadata` e `workspace`. Esta preparação não cria uma versão 3 em produção, não regrava bancos que já estejam na versão 2 e não executa as simulações sobre notas reais.

A versão do banco (`DATABASE_VERSION`) é um inteiro do IndexedDB, independente da versão comercial do app em `package.json`. Uma versão 1.3 do produto pode continuar usando o banco 2; o número do banco só aumenta quando uma alteração persistida exige migração.

| Módulo | Responsabilidade |
| --- | --- |
| `src/storage/database.ts` | Abre o banco de produção com nome, versão e registro de migrações fixos. |
| `src/storage/migration-runner.ts` | Executa etapas sequenciais, controla a transação de upgrade e trata incompatibilidade e bloqueio por outra aba. |
| `src/storage/migrations.ts` | Registro das etapas de produção: 1, espaço original; 2, notas individuais e metadados. |
| `src/storage/integrity.ts` | Valida stores, registros, IDs, metadados, ordenação e referências durante upgrades. |
| `src/storage/schema.ts` | Nome, versão atual, chaves e normalização do formato existente. |

## Sequência e compatibilidade

Cada `DatabaseMigration` contém `version`, `name`, `upgrade(context, done)` e `validate(context, done)`. O registro deve conter exatamente uma etapa para cada inteiro de 1 até a versão alvo, em ordem. Lacunas, duplicações, ordem inválida e divergência entre a versão alvo e o registro são rejeitadas antes de abrir o banco.

As etapas já publicadas usam seus próprios números de versão. A etapa 2 grava `schema = 2`, não o valor futuro de `DATABASE_VERSION`. Ao adicionar a etapa 3, a etapa 2 precisa continuar produzindo o formato 2 para que a seguinte possa recebê-lo.

- Banco novo: executa as etapas 1 e 2 na mesma transação.
- Banco 1: valida a origem e executa a etapa 2.
- Banco 2: abre normalmente, sem executar migrações ou a varredura completa de integridade.
- Futuro banco 2 com app compatível até 4: valida o formato 2, executa e valida 3, depois executa e valida 4.
- Banco mais recente que o app: o IndexedDB rejeita a abertura com `VersionError`. O runner converte isso em `DatabaseCompatibilityError`; o app exibe “Atualize o Open Notes”. Não há downgrade, exclusão, recriação ou importação automática sobre essa base.

`metadata/schema` identifica o formato dos registros; `IDBDatabase.version` identifica a versão nativa do banco. As validações conferem o marcador quando há um espaço inicializado. A leitura normal continua rejeitando metadados incompatíveis pelo contrato existente.

## Atomicidade e falhas

Todas as etapas pendentes e suas validações usam a **mesma transação `versionchange`** fornecida pelo IndexedDB. Uma atualização direta 1 → 4 não confirma as versões intermediárias separadamente. Se a etapa 4 falhar, as alterações das etapas 2 e 3 também são revertidas, incluindo stores, índices, notas, metadados e o número nativo da versão.

Exceções de conversão ou validação, falhas de requests, abortos explícitos e callbacks incompletos abortam o upgrade. O banco só é entregue ao chamador no evento de sucesso da abertura, depois do commit. Após uma falha, uma nova abertura pode repetir o caminho completo a partir da versão original.

Uma aba que bloqueia o upgrade gera a orientação de fechar outras abas. O pedido abandonado aborta se o navegador tentar iniciar seu upgrade mais tarde: fechar a aba bloqueadora não autoriza uma migração que já havia sido reportada como falha. Conexões abertas pelo runner se fecham em `versionchange` para permitir uma atualização posterior.

### Regras para implementar uma etapa

1. Use apenas operações do IndexedDB dentro da transação recebida. Não faça `fetch`, leitura de arquivos, temporizadores ou `await` durante o upgrade.
2. Registre os callbacks de leitura com `context.request(request, callback)`. O helper captura exceções, falhas e detecta callbacks que abandonaram a cadeia. Seus callbacks também devem ser síncronos.
3. Chame `done()` exatamente uma vez, como última ação da etapa ou do último callback. A validação deve terminar pelo mesmo mecanismo. Retornar uma Promise, esquecer `done()` ou chamá-lo duas vezes aborta o upgrade antes que possa ser confirmado.
4. Uma escrita pode ser enfileirada diretamente no store; a validação precisa ler o resultado com requests da mesma transação, depois dessas escritas. Não valide somente os objetos em memória que foram usados na conversão.
5. Para percorrer cursores, registre novamente o próximo evento com `context.request` antes de chamar `cursor.continue()`: cada registro desse helper trata um único sucesso. Para volumes grandes, avalie o custo de memória e duração da operação sem quebrar a atomicidade.
6. Nunca capture um erro para continuar com dados parciais. Corrigir ou remover dados exige uma política explícita e testes próprios, preservando a origem.

Não se deve esperar que uma transação permaneça ativa enquanto trabalho externo é realizado. Os testes de callbacks incompletos verificam o aborto ainda durante sua atividade, antes do auto-commit do IndexedDB.

## Integridade e política para dados incompletos

A origem de uma atualização é validada antes da primeira alteração. Cada destino é lido e validado antes da próxima etapa e do commit final. O formato granular confere:

- Stores esperados, `keyPath` e ausência de auto-incremento inesperado.
- IDs de notas, coleções e pastas: strings não vazias e únicas em cada conjunto.
- Ordem das notas como uma permutação exata dos registros: sem duplicações, IDs ausentes ou registros omitidos.
- Arrays de coleções e pastas e campos essenciais dos registros.
- Campos básicos das notas, datas numéricas finitas e a estrutura raiz do documento formatado.
- Coleção de cada pasta; coleção de cada nota; pasta existente pertencente à mesma coleção da nota.
- Marcador de versão e campos do perfil, quando presente. A origem legada também precisa respeitar o contrato de perfil existente para não ser silenciosamente substituída por um perfil vazio.

Nota sem coleção usa `collection: ''`; pasta pode estar ausente ou vazia. Referências não vazias a entidades ausentes e metadados incompletos abortam a migração; não são apagados, recriados ou “consertados” silenciosamente. O usuário continua tendo o banco e os backups anteriores para recuperação.

A migração 1 → 2 mantém a normalização legada já existente para campos opcionais. Essa normalização não substitui a validação: o destino precisa passar pelas regras de integridade. Bancos legados com referências inválidas que antes podiam ser copiados agora são recusados com a origem preservada.

Uma base recém-criada com os stores vazios e **nenhum metadado** é diferente de um espaço explicitamente vazio com metadados válidos. A primeira ainda pode receber a importação de `localStorage/open-notes-v1` ou os exemplos; a segunda permanece vazia. Se há um `workspace/current` retido, a ausência total de notas e metadados é tratada como inconsistência, não como instalação nova. A migração não transforma uma situação na outra nem recupera automaticamente `workspace/current` por cima de um espaço vazio.

As cópias em `workspace/current` e nas demais chaves de recuperação não são atualizadas nem removidas pela conversão 1 → 2. Etapas futuras também precisam verificar que essas cópias e os conteúdos existentes foram conservados. O validador comum verifica integridade estrutural, não prova sozinho que uma conversão preservou todo o texto: cada etapa deve ter testes de conteúdo antes/depois e validar seus novos campos e relações.

A validação não percorre todo o schema interno de extensões Tiptap e não faz uma auditoria contínua de todos os bancos na versão atual. Relações novas, como backlinks, precisam de validação específica em sua etapa.

## Como publicar uma próxima versão

1. Defina o novo formato, a compatibilidade de leitura/escrita e a política para dados antigos antes de alterar o número do banco.
2. Crie fixtures de cada versão de origem suportada, incluindo base vazia, documentos grandes, milhares de notas e cópias de recuperação.
3. Acrescente uma etapa ao final de `LOCAL_MIGRATIONS`, com conversão e validação específicas. Preserve as etapas e os validadores dos formatos publicados.
4. Atualize tipos, leitores, gravadores e, quando necessário, a página de recuperação. Um novo formato persistido não pode ser habilitado apenas trocando a constante.
5. Verifique caminho direto e atualizações separadas, conservação de IDs/conteúdo/metadados/backups, referências, falha tardia, rollback e nova tentativa.
6. Execute os testes unitários e no IndexedDB nativo. Só então aumente `DATABASE_VERSION` junto com o registro e documente a mudança no changelog.

Adicionar um campo opcional com fallback de leitura pode dispensar uma migração física; já criar índices ou transformar registros exige avaliar a atualização de versão. Não regrave milhares de notas apenas para preencher um valor que o leitor consegue interpretar com segurança.

## Simulações e evidências

As etapas fictícias 3 e 4 vivem somente em `tests/helpers/migration-fixtures.ts`. A etapa 3 adiciona um array de backlinks e um índice; a etapa 4 adiciona uma revisão. Seus validadores conferem as novas relações e campos. Essas etapas não são importadas pelo app nem acrescentadas ao registro de produção.

`tests/migrations.test.ts` integra a suíte de `npm test`, usando uma fábrica `fake-indexeddb` nova por cenário. Cobre 1 → 4 e 2 → 4 com 5.000 notas, 2 → 3 → 4 em aberturas separadas, versão atual sem trabalho adicional, bases vazias, dados incompletos, referências inválidas, registro inválido, bloqueio por outra aba, falhas síncronas e assíncronas de requests, interrupção por aborto e falha de validação após a conversão. Depois de falhar, compara versão, stores, índices, chaves e valores com a cópia anterior e verifica a nova tentativa.

```sh
npm test
npx playwright install chromium
npm run test:migrations:browser
```

O teste nativo usa o Chromium em um perfil descartável e um servidor loopback em porta temporária, com rede externa bloqueada. Seus sete cenários verificam migração desde 1 e 2 com 5.000 notas, rollback e nova tentativa após falha de validação, aborto explícito, callback ausente e erro de request, além da rejeição de uma versão futura sem alterar dados. Não usa o perfil do navegador do usuário nem o servidor do aplicativo aberto.

`node tests/startup-browser.mjs` também verifica, em produção e desenvolvimento, que uma base futura isolada mostra a orientação de atualizar o aplicativo e preserva suas notas e um registro de controle.

As interrupções automatizadas são abortos de transação e falhas injetadas; não são um teste físico de queda de energia nem encerramento forçado do processo. O rollback nesses casos é a garantia transacional do IndexedDB. Exportações externas e as [cópias de recuperação](local-storage.md) continuam necessárias para lidar com exclusão do perfil, limpeza de dados ou falha física do armazenamento.
