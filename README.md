<h1 align="center">Open Notes</h1>

<p align="center">
  <a href="#como-é-construído"><img src="https://img.shields.io/badge/escrito_em-TypeScript-3178C6" alt="Escrito em TypeScript"></a>
  <a href="#como-é-construído"><img src="https://img.shields.io/badge/interface-React-087EA4" alt="Interface em React"></a>
  <a href="#como-começar"><img src="https://img.shields.io/badge/roda_no-navegador-0D9488" alt="Roda no navegador"></a>
  <a href="#seus-dados"><img src="https://img.shields.io/badge/dados-IndexedDB-0D9488" alt="Dados no IndexedDB"></a>
  <a href="#construído-com-chatgpt-e-codex"><img src="https://img.shields.io/badge/feito_com-ChatGPT_%2B_Codex-0D9488" alt="Feito com ChatGPT e Codex"></a>
</p>

<p align="center">
  Um espaço para escrever, organizar e voltar às suas ideias.
</p>

<p align="center">
  Em português · Salvo no navegador · Google Drive opcional<br>
  Construído em colaboração com ChatGPT e Codex
</p>

<p align="center">
  <a href="#destaques">Destaques</a> ·
  <a href="#escreva">Escreva</a> ·
  <a href="#organize">Organize</a> ·
  <a href="#seus-dados">Seus dados</a> ·
  <a href="#como-começar">Como começar</a> ·
  <a href="#construído-com-chatgpt-e-codex">Como construímos</a>
</p>

---

Open Notes é um app de notas para reunir pensamentos, desenvolver textos e organizar o que você quer guardar. Um lugar para o rascunho de um capítulo, as anotações de uma reunião ou aquela ideia que merece uma segunda visita.

A escrita acontece em um editor com formatação, as notas são salvas automaticamente no navegador e a organização fica por conta de coleções, pastas e favoritos. A sincronização com o Google Drive é opcional.

## Destaques

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>Escreva</h3>
      <p>Editor com formatação, listas, tabelas e imagens.</p>
    </td>
    <td width="33%" valign="top">
      <h3>Organize</h3>
      <p>Coleções, pastas, favoritos e arquivo para encontrar seu próprio jeito de organizar.</p>
    </td>
    <td width="33%" valign="top">
      <h3>Continue depois</h3>
      <p>Salvamento automático por nota e sincronização opcional com o Google Drive.</p>
    </td>
  </tr>
</table>

## Escreva

Comece pelo título e siga com o texto. Use títulos, listas, tarefas, citações e destaques para dar forma às ideias. Selecione um trecho para abrir a barra de formatação sem sair do editor.

Cada nota também pode ter capa, ícone e subtítulo. Ajuste a largura da página e a exibição do sumário; nas coleções, defina as opções padrão para as próximas notas.

- Formatação com negrito, itálico, sublinhado, destaques e alinhamento.
- Listas, tarefas, tabelas e imagens no corpo da nota.
- Temas claro e escuro, paletas e cor de destaque personalizada.
- Exportação em Markdown e opção de salvar como PDF pela impressão do navegador.

## Organize

Reúna notas em coleções e crie pastas dentro delas. Fixe as coleções que você mais usa e marque notas como favoritas para voltar a elas pela Biblioteca.

Alterne entre lista e grade, ordene por título ou atualização e arquive o que você quer guardar para outra hora. As notas excluídas vão para a lixeira, onde podem ser restauradas ou excluídas permanentemente.

A barra lateral pode ser recolhida e redimensionada. As preferências de navegação e visualização acompanham seu uso no mesmo navegador.

## Encontre

Busque entre suas notas ou abra a busca dentro de um texto. No editor, percorra as ocorrências e substitua uma delas ou todas de uma vez, com suporte a desfazer.

| Ação | Atalho |
| --- | --- |
| Buscar notas | `Ctrl+K` / `Cmd+K` |
| Buscar dentro da nota | `Ctrl+F` / `Cmd+F` |
| Próxima ocorrência / anterior | `Enter` / `Shift+Enter`, no campo de busca |
| Negrito | `Ctrl+B` / `Cmd+B` |
| Itálico | `Ctrl+I` / `Cmd+I` |
| Focar a barra de formatação | `Alt+F10`, com um trecho selecionado |

## Seus dados

As notas ficam no IndexedDB do navegador, com salvamento automático. Cada nota tem seu próprio registro: editar um texto grava apenas a nota alterada. Perfil, coleções, pastas e ordem das notas são armazenados separadamente.

As mudanças relacionadas são confirmadas na mesma transação. A migração do formato anterior mantém a cópia original e os backups existentes. A primeira abertura sem dados inclui notas de exemplo que você pode editar.

> Use o mesmo endereço, porta, navegador e perfil para acessar suas notas locais. `localhost` e `127.0.0.1`, assim como portas diferentes, têm armazenamentos separados. Limpar os dados do navegador também apaga as notas e os backups locais.

### Google Drive, quando você quiser

Vincule sua conta em **Preferências → Geral → Google Drive** para sincronizar uma cópia das notas e do perfil. A integração precisa de um ID OAuth configurado no ambiente; as instruções estão abaixo.

Quando as cópias local e do Drive são diferentes, o app pausa a sincronização para você escolher:

- **Usar cópia do Drive:** substitui o espaço deste navegador.
- **Usar cópia deste navegador:** substitui a cópia no Drive.

As duas versões são preservadas em um backup local antes da substituição. Se outro dispositivo alterar a cópia antes de um novo envio, o app pede uma nova revisão. Edições feitas durante um envio bem-sucedido são enviadas em seguida quando ainda há diferenças pendentes.

### Cópias de recuperação

Os backups da integração podem ser baixados em JSON. A página `/recuperar-notas.html`, no mesmo endereço em que você usa o app, também permite consultar e exportar as notas atuais e as cópias anteriores. Ela apenas lê os dados, sem restaurar notas ou iniciar uma sincronização.

Exporte as notas importantes e baixe as cópias de recuperação antes de limpar os dados do navegador. Veja os detalhes em [Persistência local](docs/local-storage.md).

## Como começar

Ambiente validado com **Node.js 24** e **npm**.

```sh
git clone https://github.com/designstudio/open-notes.git
cd open-notes
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. No Windows, depois de instalar as dependências, você também pode usar `iniciar-open-notes.bat` para iniciar o servidor e abrir o aplicativo.

<details>
<summary><strong>Configurar a integração opcional com o Google Drive</strong></summary>

Crie um arquivo `.env.local` na raiz, usando `.env.example` como referência, e configure o ID OAuth do seu projeto Google:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Reinicie o servidor após configurar a variável. Depois, abra **Preferências → Geral → Google Drive** para vincular sua conta.

</details>

### Gerar a versão de produção

```sh
npm run build
npm run preview
```

O build verifica os tipos com TypeScript e gera os arquivos em `dist/`. O comando `preview` permite conferir essa versão localmente.

## Como é construído

| Tecnologia | Papel no projeto |
| --- | --- |
| React e TypeScript | Interface, estado e contratos entre os módulos. |
| Vite | Desenvolvimento e build de produção. |
| Tiptap | Editor de texto e documento formatado. |
| IndexedDB | Persistência local por nota e cópias de recuperação. |
| Google Drive API | Sincronização opcional da cópia do espaço. |
| CSS, Sass e tokens de design | Aparência, temas e padrões visuais. |

O `App.tsx` conecta componentes e hooks com responsabilidades separadas. O editor, a biblioteca, a barra lateral, os diálogos, a navegação e o armazenamento têm seus próprios módulos. Os ícones vêm de Solar Icons e dos controles Tiptap.

A estrutura está descrita em [Arquitetura](docs/architecture.md), e os padrões visuais em [Design system](docs/design-system.md).

## Construído com ChatGPT e Codex

O Open Notes está sendo construído em colaboração com **ChatGPT e Codex, da OpenAI**.

O ChatGPT participa da discussão de ideias, do planejamento e da revisão dos próximos passos. O Codex apoia a implementação, as refatorações, a documentação e os testes diretamente no repositório.

As decisões de produto e design são guiadas por quem está construindo e usando o app. O desenvolvimento acontece em etapas: experimentar, conferir o resultado, ajustar e seguir para a próxima melhoria. Este repositório registra esse processo, incluindo as correções e os testes que acompanham a evolução do projeto.

## Qualidade e testes

A suíte reúne **109 testes** de armazenamento, migração, edição, recuperação, sincronização e resolução de conflitos.

```sh
npm test
```

Os testes usam armazenamento e API Google simulados, sem acessar suas notas ou uma conta Google real. Os testes de integração exercitam o App e seus hooks, com substitutos para os componentes de apresentação. Eles não substituem testes E2E em um navegador.

Cenários, execução e limites estão documentados em [Testes do Open Notes](docs/testing.md).

## Estado do projeto

O Open Notes está em evolução. A escrita, a organização e o salvamento local já contam com testes, assim como os fluxos de sincronização e conflito. Alguns limites atuais:

- Conflitos com o Drive exigem uma escolha entre as cópias; não há mesclagem automática.
- A verificação de mudanças no Drive não é uma transação atômica entre dispositivos.
- Abas diferentes não têm sincronização automática de estado nem resolução de edições simultâneas da mesma nota.
- A exportação Markdown não preserva todos os estilos visuais do editor. O PDF usa a impressão do navegador.

O histórico das melhorias fica no [Changelog](CHANGELOG.md).

## Documentação

| Documento | O que você encontra |
| --- | --- |
| [Arquitetura](docs/architecture.md) | Componentes, hooks e responsabilidades. |
| [Persistência local](docs/local-storage.md) | IndexedDB, migração, gravações e recuperação. |
| [Testes](docs/testing.md) | Cobertura, execução e isolamento dos testes. |
| [Design system](docs/design-system.md) | Tokens, componentes e padrões visuais. |
| [Changelog](CHANGELOG.md) | Histórico de alterações do projeto. |
