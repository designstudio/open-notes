# Estrutura do aplicativo

`src/App.tsx` conecta o estado dos dados, a sincronização com o Drive e os módulos da interface. As alterações nas notas e as ações de coleção ficam nessa camada de coordenação; os componentes recebem os dados e as ações por propriedades tipadas.

Os módulos extraídos ficam em `src/app/`:

| Módulo | Responsabilidade |
| --- | --- |
| `AppSidebar.tsx` | Navegação lateral, coleções, notas recentes e menu compacto. |
| `NotesLibrary.tsx` | Biblioteca, coleções, pastas e filtros da visualização atual. |
| `NotesList.tsx` | Listagem de notas, busca local, ordenação e estados vazios. |
| `NoteToolbar.tsx` | Caminho da nota, indicação de salvamento e ações do cabeçalho. |
| `NoteEditor.tsx` | Título, campos opcionais, conteúdo e confirmação de exclusão. |
| `AppDialogs.tsx` | Formulários de coleção e pasta e composição dos diálogos. |
| `SearchDialogContent.tsx` | Busca global e apresentação dos resultados. |
| `use-navigation.ts` e `navigation.ts` | Estado de navegação, histórico, leitura e geração de URLs. |
| `use-local-persistence.ts` | Salvamento automático, falhas e retorno de salvamento do perfil. |
| `use-workspace-data.ts` e `workspace-session.ts` | Estado dos dados; preserva a sessão de edição durante substituições de módulos do Vite. |
| `use-appearance.ts` | Tema, paleta e cor personalizada. |
| `use-sidebar.ts` | Estado persistido da barra lateral e controle de redimensionamento. |
| `use-notes-list-preferences.ts` | Preferências de ordenação e visualização, mantidas ao abrir uma nota. |
| `use-app-dialogs.ts` | Abertura, campos dos formulários e atalho da busca global. |
| `use-toasts.ts` | Criação e descarte de notificações. |
| `workspace-selectors.ts` | Coleções visíveis, notas ativas e recentes. |
| `note-export.ts` | Exportação Markdown e impressão em PDF. |
| `types.ts` | Contratos de navegação e ações compartilhadas entre os módulos. |

O editor de texto continua em `src/RichNote.tsx`, a API de armazenamento em `src/local-data.ts` e a integração com o Google Drive em `src/cloud/`. A implementação da [persistência por nota](local-storage.md) fica em `src/storage/`.

A iconografia é centralizada em `src/icons.ts`, com imports individuais de `@solar-icons/react` e SVGs locais dos controles Tiptap. Os padrões de animação do Transitions.dev são adaptados em `src/motion.css` e nos componentes; `framer-motion` atende às animações React do menu de criação e do seletor de largura. Origem, convenções e acessibilidade estão documentadas no [design system](design-system.md).

O versionamento do IndexedDB usa um runner transacional e um registro de etapas em `storage/migration-runner.ts` e `storage/migrations.ts`, com validação em `storage/integrity.ts`. Todas as etapas de um upgrade são atômicas e a versão de produção continua em 2. O [guia de migrações](migrations.md) descreve o contrato, a compatibilidade e as simulações das versões 3 e 4.

## Inicialização e montagem assíncrona

`main.tsx` lê o IndexedDB antes de montar o App, sem mensagem de abertura. Se a leitura falhar, mantém a tela de erro com nova tentativa; os dados existentes são preservados.

`NoteEditor.tsx` carrega `RichNote.tsx` por import dinâmico. Na biblioteca, o App prepara esse módulo em `requestIdleCallback`, com fallback por temporizador quando a API não está disponível. Uma nota com o módulo já preparado monta diretamente; as demais usam Suspense. A escolha do componente fica estável por nota para preservar cursor e histórico de edição.

O Tiptap é criado após o commit do React. `RichNote` avisa quando estiver montado, e só então o `NoteEditor` exibe capa, título, corpo e rodapé juntos. Durante a espera, o conteúdo fica oculto e inativo; `note-loading.css` posiciona o indicador centralizado, com atraso visual de 180 ms e alternativa estática para movimento reduzido. Notas novas recebem foco no título depois de prontas.

`AppDialogs.tsx` carrega as preferências ao abrir esse diálogo, e o componente recupera o foco após substituir seu estado de espera. A [revisão da inicialização](startup-performance.md) detalha os ganhos medidos e os limites da estratégia.

## Sessão e recuperação

Em desenvolvimento, `main.tsx` fornece a cópia lida ao abrir a aba. A sessão usa `import.meta.hot.data` para manter as edições mais recentes quando o Vite remonta o aplicativo após mudanças nos hooks. Isso impede que a cópia inicial antiga seja reaplicada e salva por cima das edições. Em produção, cada montagem tem sua própria sessão.

`public/recuperar-notas.html` lê as notas atuais e cópias de recuperação do mesmo endereço e navegador. A página permite exportar os registros, sem iniciar o aplicativo, salvar notas ou sincronizar com o Drive.

Execute `npm test` para verificar as regras existentes e os testes de regressão da extração em `tests/app-modules.test.tsx`. Execute `npm run build` para verificar os tipos e gerar a versão de produção.

Os [testes de integração dos fluxos de notas, sincronização e conflitos](testing.md) também são executados por `npm test`, com armazenamento e rede isolados dos dados do usuário.
