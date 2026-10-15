# Persistência local por nota

O banco `open-notes`, versão 2, usa três object stores:

| Store | Conteúdo |
| --- | --- |
| `notes` | Uma nota completa por registro, com `id` como chave. Inclui documento formatado, capa, campos opcionais e estados de favorito, arquivo e lixeira. |
| `metadata` | Registros separados para `collections`, `folders`, `profile`, `noteOrder` e a identificação `schema`. |
| `workspace` | Cópia original `current` da versão 1 e cópias de recuperação do Google Drive. |

`src/local-data.ts` mantém os mesmos exports para os consumidores. A implementação fica em `src/storage/`: `database.ts` abre e migra o banco; `schema.ts` define o formato; `snapshots.ts` captura os dados; `local-data.ts` lê e grava as diferenças.

## Salvamento

`saveLocalData(data)` captura as entidades alteradas e serializa as operações em uma fila. O estado do aplicativo é imutável: toda mudança de nota, perfil, coleção ou pasta deve criar um novo objeto, como nos atualizadores React. Os snapshots de objetos inalterados são reutilizados para evitar copiar e serializar os demais documentos e fotos a cada tecla.

A comparação usa o conteúdo do último salvamento confirmado. Editar o texto de uma nota grava apenas esse registro. Mudar somente o perfil grava apenas `metadata/profile`. Adicionar ou excluir permanentemente uma nota também atualiza a ordem. Mover para a lixeira mantém o registro da nota, com `deleted: true`.

As notas e os metadados afetados são salvos na mesma transação. A confirmação de salvamento só ocorre após o commit. Em uma falha, o estado confirmado não avança; a próxima tentativa inclui todas as diferenças pendentes. Salvar novamente dados equivalentes não gera gravações.

Ao carregar, as notas são reconstruídas na ordem persistida. Um espaço explicitamente vazio continua vazio. Dados incompletos ou inválidos geram erro, em vez de serem substituídos por exemplos ou por uma cópia antiga.

## Migração e recuperação

Ao abrir um banco da versão 1, as notas de `workspace/current` e os metadados são copiados na transação de atualização de versão. Se qualquer etapa falhar, toda a atualização é revertida. O registro original e as cópias de recuperação permanecem intactos após o sucesso; esse registro original passa a ser apenas uma cópia anterior à migração e deixa de ser atualizado.

Se existir somente `localStorage/open-notes-v1`, a leitura importa esse conteúdo para os registros individuais antes de abrir o editor. A origem no localStorage também é preservada.

A página `public/recuperar-notas.html` lê ambos os formatos, identifica a cópia anterior à migração e exporta também os registros individuais. Ela não executa uma migração nem altera notas.

## Google Drive e múltiplas abas

A API pública continua recebendo e devolvendo `AppData`; o formato da cópia do Google Drive permanece o mesmo. Uma substituição explícita do espaço reconcilia as notas e os metadados em uma transação, com os backups existentes da integração.

Uma edição local deixa intactos os registros de outras notas alteradas por outra aba. Isso não implementa sincronização automática entre abas nem resolução de conflitos para edições simultâneas da mesma nota.

## Verificação

`tests/granular-storage.test.ts` verifica as gravações reais por store e chave, migração e rollback, criação e exclusão, filas, troca integral do espaço e preservação de alterações em outra nota. `npm test` também executa os testes de armazenamento anterior, feedback e Google Drive.
