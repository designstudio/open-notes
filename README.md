# Open Notes

Um app de notas em português, feito com React, TypeScript e Vite. Inclui edição com formatação e salvamento automático, busca, coleções, pastas, etiquetas, favoritos, arquivo, lixeira, exportação e personalização de tema.

## Executar

Validado com Node.js 24 e npm. Instale as dependências e inicie o servidor:

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. No Windows, `iniciar-open-notes.bat` também inicia o servidor e abre o aplicativo.

Use o mesmo endereço, porta, navegador e perfil para acessar seus dados locais. `localhost` e `127.0.0.1`, assim como portas diferentes, têm armazenamentos separados.

## Build

```sh
npm run build
npm run preview
```

O build verifica os tipos com TypeScript e gera a versão de produção em `dist/`.

## Testes

```sh
npm test
```

A suíte cobre armazenamento, migração, criação e edição de notas, lixeira, restauração, exclusão permanente, backups, sincronização e resolução de conflitos. Os testes usam IndexedDB e API Google simulados, sem acessar as notas do navegador ou uma conta Google real.

Os testes de integração montam o App com seus hooks reais e substituem componentes de apresentação. Eles não são testes E2E do navegador. Veja os cenários e limites em [Testes do Open Notes](docs/testing.md).

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Estrutura do aplicativo](docs/architecture.md) | Componentes, hooks, responsabilidades e preservação da sessão durante alterações de código. |
| [Persistência local](docs/local-storage.md) | IndexedDB por nota, gravações parciais, migração, transações e recuperação. |
| [Testes](docs/testing.md) | Cobertura, execução, isolamento e limites das simulações. |
| [Histórico de alterações](CHANGELOG.md) | Resumo das mudanças do projeto. |
| [Design system](docs/design-system.md) | Tokens, componentes e padrões visuais. |

## Persistência e recuperação

O banco IndexedDB `open-notes`, versão 2, guarda uma nota completa por registro. Editar uma nota grava somente seu registro; perfil, coleções, pastas e ordem das notas ficam em registros separados. As mudanças relacionadas são confirmadas na mesma transação.

A migração do registro único da versão anterior é automática e mantém `workspace/current` intacto como cópia anterior à migração. Dados antigos do localStorage também são importados mantendo a origem. As cópias de recuperação do Drive continuam disponíveis. O editor só abre depois de concluir a leitura e a migração; falhas não substituem os dados por exemplos. A primeira abertura sem dados inclui notas de exemplo editáveis.

A página [Procurar cópias](http://localhost:5173/recuperar-notas.html) permite ler as notas atuais, consultar cópias anteriores e baixar os registros em JSON. Se o servidor estiver em outro endereço ou porta, abra `/recuperar-notas.html` nesse mesmo endereço. A página apenas lê os dados: não restaura notas, não migra o banco e não sincroniza com o Drive.

As notas e os backups locais pertencem ao navegador e ao endereço usados. Limpar os dados do navegador também apaga essas cópias. Exporte as notas importantes e baixe os backups antes de limpar o armazenamento.

## Google Drive

A sincronização é opcional e pode ser vinculada em Preferências → Geral → Google Drive. Para habilitar a integração no desenvolvimento, crie `.env.local` usando `.env.example` como referência e configure o ID OAuth do seu projeto Google:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Ao conectar em outro navegador, exemplos intactos são substituídos pela cópia do Drive quando o perfil local está vazio ou é igual ao remoto. Se houver notas próprias ou perfis diferentes nos dois lados, a sincronização fica pausada até escolher “Usar cópia do Drive” ou “Usar cópia deste navegador”. A primeira opção substitui o espaço local; a segunda substitui a cópia do Drive. Não há mesclagem automática. Antes da substituição, ambas as versões são preservadas no armazenamento local. A tela da integração permite baixar essas cópias como JSON.

Antes de cada envio, o aplicativo verifica se a cópia do Drive mudou desde a última sincronização; mudanças de outro dispositivo exigem uma nova escolha. Essa verificação não é uma transação atômica entre dispositivos. Edições feitas durante um envio bem-sucedido geram outro envio se ainda houver diferenças pendentes.

## Perfil e edição

Em Preferências → Geral, clique na foto para escolher uma imagem JPG, PNG ou WebP (até 10 MB), ou no nome para editá-lo. Enter ou sair do campo salva o nome; Escape cancela. A foto recebe um recorte central quadrado e é reduzida a 256 × 256 px. Nome e foto são salvos neste navegador e acompanham a cópia privada das notas quando o Drive está vinculado.

- Ctrl+K ou Cmd+K abre a busca global.
- Ctrl+F ou Cmd+F abre a busca dentro da nota; Enter e Shift+Enter percorrem as ocorrências, e Escape fecha o painel.
- A substituição permite trocar uma ocorrência ou todas, com suporte a desfazer com Ctrl+Z. Deixar a substituição vazia remove o texto encontrado.
- Ctrl+B e Ctrl+I aplicam negrito e itálico.
- Selecionar um trecho abre a barra de formatação. Alt+F10 foca a barra; use as setas para navegar e Escape para voltar ao texto.

Cores, alinhamento e formatação são preservados no documento salvo. A exportação Markdown não preserva todos os estilos visuais do editor. O sublinhado usa a sintaxe estendida de Markdown do Tiptap (`\++texto++\`).

## Ícones

Os imports são centralizados em `src/icons.ts`, com ícones Solar de `@solar-icons/react` e ícones dos controles Tiptap. Os componentes de edição também usam os SVGs em `src/components/tiptap-icons/`.
