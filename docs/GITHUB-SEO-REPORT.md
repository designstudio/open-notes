# Descoberta do Open Notes no GitHub

Revisão em 19 de outubro de 2026. Escopo: apresentação, descrição, topics, README e condição de licenciamento de `designstudio/open-notes`. Não é uma medição de posição nas buscas nem uma promessa de tráfego.

## Evidências e mudanças

| Achado | Evidência inicial | Ação | Confiança |
| --- | --- | --- | --- |
| Descrição ausente | `gh repo view`: `description` vazio. | Descrição em inglês com propósito, recursos atuais e intenção de alternativa. | Confirmado |
| Topics ausentes | API do GitHub: lista de topics vazia. | Topics de finalidade, tecnologia e alternativas, abaixo do limite de 20. | Confirmado |
| Posicionamento pouco explícito | README apresentava o app sem mencionar as alternativas procuradas. | Contexto em português e resumo em inglês com Notion, Obsidian e Superhuman Docs. | Confirmado |
| Caminho de feedback pouco visível | README sem chamada direta para abrir issues. | Link explícito e orientação para não divulgar notas ou credenciais. | Confirmado |
| Licença própria ausente | `licenseInfo: null` e nenhum `LICENSE` na raiz. | Licença MIT adicionada após escolha explícita do mantenedor, com identificação no README e nos metadados npm. | Confirmado |

O posicionamento refere-se à escrita pessoal. Colaboração em tempo real, backlinks e importação desses editores continuam ausentes; o README registra esses limites e a independência em relação às marcas.

## Descrição publicada

> An open-source, local-first note-taking app and Markdown editor with rich-text editing, collections and optional Google Drive sync. An alternative to Notion, Obsidian and Superhuman Docs for personal writing.

## Topics

`note-taking`, `notes-app`, `markdown-editor`, `rich-text-editor`, `personal-knowledge-management`, `notion-alternative`, `obsidian-alternative`, `superhuman-docs-alternative`, `local-first`, `indexeddb`, `react`, `typescript`, `tiptap`, `productivity`, `open-source`, `mit-license`.

São termos de finalidade e contexto, sem sugerir integrações inexistentes com esses produtos. Os topics e a descrição são configurações do GitHub: não são enviados por `git push` e precisam ser atualizados separadamente.

A descrição e os 16 topics acima são publicados e conferidos com `gh repo view`. A licença MIT foi escolhida explicitamente pelo mantenedor antes de rotular o projeto como open source; a licença do projeto não substitui os avisos e as licenças das dependências.

## Como interpretar

O GitHub documenta que a busca padrão considera nome, descrição e topics; o conteúdo do README pode ser buscado com `in:readme`. Topics também dão acesso a listas de repositórios relacionados. Isso sustenta melhorar a classificação e a clareza do projeto, mas não permite afirmar uma fórmula de ranking ou garantir uma posição. Fontes: [busca de repositórios](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories) e [topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics).

Um repositório público não concede automaticamente uma licença de reutilização. A apresentação formal como open source depende de definir e publicar uma licença adequada. Referência: [licenciamento de repositórios](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

Verificação: metadados consultados com GitHub CLI e `github_repo_audit.py` da skill SEO; README analisado com `github_readme_lint.py` e revisão direta. O lint tem limitações para o H1 em HTML e seções em português; sua pontuação não foi usada como avaliação de ranking ou qualidade do produto. Não foram medidos posição, volume de buscas, cliques ou conversão.
