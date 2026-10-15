# Open Notes

Um app de notas em português, feito com React, TypeScript e Vite. Inclui edição direta com formatação e salvamento automático, busca, coleções, etiquetas, favoritos, arquivo, lixeira, exportação e temas claro e escuro.

## Executar

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

Notas, perfil e novas cópias de segurança do Drive são persistidos no IndexedDB deste navegador, para comportar fotos sem depender do limite menor do localStorage. Dados antigos são migrados automaticamente, mantendo a cópia original no localStorage; backups antigos continuam disponíveis para download. O editor só abre depois de concluir a leitura e a migração; falhas não substituem os dados por exemplos. A primeira abertura inclui notas de exemplo editáveis. A sincronização opcional com o Google Drive pode ser vinculada em Preferências → Geral → Google Drive, com `VITE_GOOGLE_CLIENT_ID` configurado no ambiente.

Em Preferências → Geral, clique na foto para escolher uma imagem JPG, PNG ou WebP (até 10 MB), ou no nome para editá-lo. Enter ou sair do campo salva o nome; Escape cancela. A foto recebe um recorte central quadrado e é reduzida a 256 × 256 px para manter a cópia leve. Nome e foto aparecem também na barra lateral e são salvos neste navegador. Com o Drive vinculado, o perfil acompanha a cópia privada das notas. Cópias antigas sem perfil continuam funcionando; diferenças no perfil também exigem uma escolha entre as cópias local e do Drive.

Ao conectar em outro navegador, exemplos intactos são substituídos pela cópia do Drive, independentemente das datas, quando o perfil local está vazio ou é igual ao remoto. Se houver notas próprias ou perfis diferentes nos dois lados, a sincronização fica pausada até escolher “Usar cópia do Drive” ou “Usar cópia deste navegador”. A primeira opção substitui o espaço local; a segunda substitui a cópia do Drive. Não há mesclagem automática. Antes da substituição, ambas as versões são preservadas no armazenamento local. A tela da integração permite baixar essas cópias como JSON. Elas ficam no navegador onde a escolha foi feita; limpar os dados do navegador também apaga os backups locais.

Antes de cada envio, o aplicativo verifica se a cópia do Drive mudou desde a última sincronização; mudanças de outro dispositivo exigem uma nova escolha. Essa verificação não é uma transação atômica entre dispositivos. Exporte as notas importantes e baixe as cópias de segurança antes de limpar o navegador.

Execute `npm test` para testar o fluxo de conexão e as proteções com uma API simulada, sem acesso a uma conta Google real.

Atalho: Ctrl+K (ou Cmd+K) abre a busca. Clique no título ou no texto para editar. Use Ctrl+B e Ctrl+I para formatar. No editor, digite uma etiqueta e pressione Enter para adicioná-la.

Dentro de uma nota, Ctrl+F (ou Cmd+F) abre a busca no conteúdo. A lupa no cabeçalho também abre o painel. Enter / Shift+Enter percorrem as ocorrências; Escape fecha a busca. O botão de substituição expande os controles para substituir a ocorrência atual ou todas de uma vez. A busca ignora maiúsculas e minúsculas, destaca trechos mesmo com formatação e as substituições podem ser desfeitas com Ctrl+Z. Deixe “Substituir por” vazio para remover as ocorrências.

## Ícones

[Reicon](https://reicon.dev/icons), via `reicon-react` (MIT). Os imports individuais ficam em `src/icons.ts`. Use Outline para controles e Filled para o estado ativo de favorito; preserve os traços originais dos SVGs.

Selecione um trecho para abrir a barra flutuante de formatação. Com uma seleção ativa, Alt+F10 foca a barra; use as setas para navegar e Escape para voltar ao texto. Sublinhado é preservado na sintaxe estendida de Markdown do Tiptap (\++texto++\).

O Bubble Menu usa os componentes oficiais Tiptap para titulos, listas e botoes de alinhamento. Os menus foram traduzidos para portugues. Cores e alinhamentos sao preservados no documento salvo; a exportacao Markdown nao preserva esses estilos visuais.
