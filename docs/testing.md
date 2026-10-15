# Testes do Open Notes

Execute toda a suíte com:

```sh
npm test
```

O runner `tests/run.mjs` compila os arquivos TypeScript para uma pasta temporária e executa o test runner do Node. A pasta é removida ao final, inclusive quando há falhas. Os testes não acessam o perfil do navegador nem uma conta Google real.

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

## Limites e isolamento

`tests/helpers/app-ui.tsx` substitui apenas os componentes de apresentação do App por pontos de observação tipados. Os testes acionam os callbacks usados pela interface; não exercitam o DOM completo, o Tiptap, os popovers ou a aparência. A confirmação de exclusão usa seu componente real, com o fechamento animado controlado pelo teste.

O IndexedDB usa `fake-indexeddb`, sem arquivos do usuário. A rede usa `fetch` simulado; requisições para destinos inesperados são rejeitadas. O relógio e as respostas HTTP podem ser controlados para reproduzir as corridas sem esperar pela rede ou por intervalos reais. Cada teste descarta sua base e restaura os globais substituídos.

São testes de integração, complementados pelos testes existentes de unidades e armazenamento; não substituem testes E2E em um navegador nem testes contra o serviço Google real. Os limites de concorrência entre dispositivos descritos no README continuam valendo.
