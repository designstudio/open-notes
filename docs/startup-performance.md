# Revisão da inicialização — 18 de outubro de 2026

O carregamento inicial incluía o editor Tiptap e as preferências, mesmo entrando pela biblioteca. O build entregava um único JavaScript de 1.314,10 kB (418,27 kB gzip).

O editor e as preferências agora têm imports dinâmicos com estados de carregamento. A biblioteca prepara o editor em tempo ocioso; se ele já estiver disponível, a primeira nota monta diretamente, evitando a espera adicional do Suspense. A instância permanece estável durante a edição. O Tiptap é criado após o commit para respeitar a montagem assíncrona, e as preferências recuperam o foco dentro do diálogo após carregar.

O carregamento da nota usa apenas um ícone centralizado na área interna, visível depois de 180 ms. Capa, título, corpo e rodapé aparecem juntos quando o editor estiver montado; os controles permanecem inativos durante a espera. Movimento reduzido mantém o indicador estático. A mensagem inicial “Abrindo seu espaço” foi removida; a leitura do armazenamento e a tela de recuperação em caso de erro continuam funcionando.

A sincronização também reutiliza a comparação inicial do espaço, sem serializar novamente todas as notas no primeiro efeito e na repetição desse efeito pelo StrictMode.

## Comparação local

Build de produção, Chromium isolado, 1.000 notas sintéticas, rede externa bloqueada, uma rodada de aquecimento e três amostras por versão. Tempos de interface incluem automação e dois frames; não medem partida a frio do sistema nem abertura do Chrome pelo atalho.

| Medida | Antes | Depois |
| --- | ---: | ---: |
| JavaScript inicial | 1.314,10 kB | 698,90 kB |
| JavaScript inicial gzip | 418,27 kB | 225,56 kB |
| CSS inicial | 235,28 kB | 175,78 kB |
| Biblioteca, mediana | 297,6 ms | 251,8 ms |
| Primeira nota após navegar pela biblioteca, mediana | 196,8 ms | 197,3 ms |

Redução de aproximadamente 47% no JavaScript inicial e 15% no tempo observado para a biblioteca. O editor mantém o tempo anterior quando preparado durante a navegação. Abertura direta de uma nota ainda precisa baixar o editor. O total de código permanece semelhante, distribuído entre os momentos de uso. Essas medidas antecedem o refinamento do indicador de carregamento.

Amostras completas: [antes](benchmarks/startup-before.json) e [depois](benchmarks/startup-after.json). Com três amostras, os resultados são exploratórios e sujeitos à variação da máquina. A listagem de milhares de notas continua montando todas as linhas e merece uma otimização própria; esta mudança trata da inicialização.

## Verificação

`npm run build` e os 109 testes de `npm test` passaram. O teste adicional `node tests/startup-browser.mjs` usa perfis descartáveis e um build temporário para verificar produção e desenvolvimento: biblioteca, preferências adiadas, editor com download retido, indicador sem texto, título oculto durante a espera, preservação do corpo, salvamento, recarga, foco no diálogo e estabilidade da instância ao editar uma nota já preparada. `--screenshots` também gera capturas do carregamento em desktop e celular em `artifacts/`, verificando movimento reduzido.

O atalho `iniciar-open-notes.bat` continua abrindo o Vite em desenvolvimento na mesma origem. A primeira abertura desse modo inclui a preparação dos módulos pelo servidor; os tempos acima são do build de produção. Nenhuma nota real ou conta Google foi usada na medição.
