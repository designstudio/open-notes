# Open Notes — Design System

## Estado e escopo

Auditoria e migração em 7 de outubro de 2026, seguindo a skill `design-system` do repositório `nextlevelbuilder/ui-ux-pro-max-skill`. A skill está instalada em `.codex/skills/design-system`.

Stack: React 19, TypeScript, Vite, CSS global e SCSS nos primitives do Tiptap. Não há Tailwind, CSS Modules ou styled-components. Menus usam Radix; tooltips usam Floating UI; dialogs usam `<dialog>` nativo com a animação compartilhada. Ícones vêm de Reicon e do editor.

Esta é uma extração do produto existente, sem trocar a marca, as seis paletas, a densidade ou o desenho das animações. As correções visuais intencionais são contraste de texto neutro pequeno, placeholders, hover opaco dos botões, legibilidade de Restaurar nas paletas claras, foco do editor e estados de campo. Cores de conteúdo escrito pelo usuário não foram reescritas.

## Inventário e evidências

- `design-inventory.md` / `.json`: snapshot anterior à migração. Cobre cores literais em CSS/SCSS/TS/TSX e declarações de estilo CSS/SCSS, incluindo overrides e valores de editor. Contagens: 271 cores distintas, 60 declarações distintas de tipografia, 151 de spacing, 47 de radius, 22 de sombras, 146 de motion e 120 de dimensões. São valores declarados, não um mapa de estilos computados.
- `design-inventory-after.md` / `.json`: estado depois da migração; acrescenta estilos inline literais e expressões. A comparação das contagens de inventário deve considerar essa ampliação do scanner. O CSS gerado é excluído desses inventários.
- `token-validation-before.txt` / `token-validation-after.txt`: saída integral do `validate-tokens` original da skill. Antes: 857 ocorrências potenciais (607 px, 101 rem, 127 hex, 22 RGB). Depois: 301 (220 px, 61 rem, 20 hex); redução de aproximadamente 65%. **301 não significa 301 defeitos visuais.**
- `design-contrast.json`: cores computadas e contraste dos estados padrão de componentes representativos em seis paletas × light/dark. Limitações do ensaio constam no próprio arquivo. `design-state-observations.json` registra também Restaurar, placeholder e tokens de estado.
- `design-files.json`: manifesto dos arquivos criados/modificados nesta etapa.

O scanner original usa regex, não compreende cascade ou expressões dinâmicas e não detecta todos os formatos de cor/spacing. O inventário adicional captura rgba/hsla/oklch, shorthands e estilos inline. Nenhum dos dois certifica sozinho a acessibilidade de toda a aplicação.

## Arquitetura: primitive → semantic → component

Fonte de verdade: `assets/design-tokens.json`. CSS gerado: `src/design-tokens.css`, importado primeiro em `src/main.tsx`. Não editar o CSS gerado manualmente.

```css
/* Primitive: valor bruto extraído */
--primitive-color-hex-0d0d0d: #0d0d0d;
/* Semantic: propósito compartilhado e override de tema */
--accent: var(--primitive-color-hex-0d0d0d);
/* Component: contrato de aparência */
--button-bg: var(--accent);
```

O JSON usa `$value`, `$type` e `$description`, com referências como `{semantic.accent}`. O gerador mantém referências CSS vivas; não achata aliases em valores literais. Primitives só contêm valores; semantics não podem depender de components; components só dependem de semantics. O check rejeita referências inexistentes, ciclos, inversão de camadas e CSS desatualizado.

Nomes históricos (`paper`, `surface`, `ink`, `accent`, `tt-*`, `stack-*`) foram preservados como aliases compatíveis. As famílias numéricas de spacing/tipografia/radius são aliases de escala para facilitar a migração; novos componentes devem preferir contratos de propósito. Parte dos primitives extraídos de famílias legadas permanece com identificador estável, acompanhado do valor e descrição, para não inventar equivalências entre cores diferentes.

Os escopos light/dark e de paleta estão no JSON. O tema do app usa `:root[data-theme="dark"]`; a classe `.dark` é sincronizada para os componentes do editor. A barra flutuante continua com seu escopo escuro independente, que é uma escolha existente do produto. Aliases contextuais dentro desse escopo continuam locais para preservar sua aparência.

```sh
npm run tokens:generate  # JSON → CSS determinístico
npm run tokens:check     # integridade, camadas e arquivo gerado
npm run tokens:validate  # scanner da skill; retorna 1 enquanto há ocorrências
node scripts/audit-design-system.mjs --after
```

O gerador da skill foi adaptado ao projeto: o exemplo original resolve aliases em literais e usa somente `.dark`. A validação da skill foi mantida sem alterar suas regras; proveniência em `scripts/vendor/NOTICE.md`.

## Paleta e contraste

| Propósito | Light neutro | Dark neutro |
|---|---|---|
| Página (`paper`) | `#fff` | `#212121` |
| Superfície (`surface`) | `#fff` | `#2f2f2f` |
| Sidebar (`sidebar`) | `#f9f9f9` | `#171717` |
| Texto (`ink`) | `#0d0d0d` | `#ececec` |
| Secundário (`secondary`) | `#666` | `#b4b4b4` |
| Texto discreto (`muted`) | `#666` | `#a0a0a0` |
| Divisor (`line`) | `#e9e9e9` | `#383838` |
| Ação (`accent`) | `#0d0d0d` | `#f4f4f4` |
| Texto da ação (`accent-text`) | `#fff` | `#111` |
| Erro (`danger`) | `#b42318` | `#ff938a` |
| Destrutivo preenchido | `#b42318`, texto branco | igual |

O `muted` anterior, `#777` sobre branco, tinha aproximadamente 4,48:1. O `#666` existente fornece 5,74:1. O preenchimento destrutivo usa o vermelho existente `#b42318`, com contraste de aproximadamente 6,57:1 com branco. Hover e active escurecem esse mesmo vermelho. Texto destrutivo usa a mesma base no light e `#ff938a` no dark para legibilidade.

| Paleta | Accent light / branco | Accent dark / `#111` |
|---|---:|---:|
| Neutro | 19,44:1 | 17,17:1 |
| Azul | 6,10:1 | 11,96:1 |
| Aurora | 5,97:1 | 11,52:1 |
| Menta | 5,63:1 | 12,58:1 |
| Rosa | 5,76:1 | 11,42:1 |
| Pêssego | 5,63:1 | 11,65:1 |

Os previews de paleta têm tokens próprios para que não mudem junto com a seleção. O hover do botão principal usa uma mistura opaca de accent e ink, mantendo o texto legível. No toast, a cápsula de Restaurar usa misturas de 6% / 8% nas paletas coloridas claras; os 16% / 24% anteriores continuam nos demais escopos. Isso evita clarear demais o fundo abaixo do texto branco.

Status provisionados: `color-success` reutiliza o verde de texto do editor; `color-warning` usa amarelo escuro existente no light e amarelo claro no dark; `color-info` reutiliza azul existente em cada tema; `color-error` aponta para `danger`. Cores editoriais/highlights continuam independentes. Não usar cores de highlight como status sem medir seu contraste no contexto.

## Tipografia

UI: `font-ui` = DM Sans, Arial, Helvetica, sans-serif. Código: `font-code` = ui-monospace, SFMono-Regular, Consolas, monospace. Atalhos: `font-shortcut` preserva a pilha de fontes de sistema já usada.

| Papel | Token | Valor |
|---|---|---:|
| Caption / data | `text-size-caption` | 11px |
| Label / tooltip | `text-size-label` | 12px |
| Controle / descrição de dialog | `text-size-ui` | 13px |
| Corpo de nota | `text-size-body` | 16px |
| Título de confirmação | `text-size-dialog-title` | 18px |
| Título de página | `text-size-page-title` | 28px |

Há aliases para a escala extraída de 10 a 30px e ajustes de 12,5 / 13,5px. Pesos principais 400 / 500 / 600 / 700. Line-heights legados de 1,15 a 1,9 foram mantidos; tooltip usa 16px e o texto de dialog usa 1,6. Os valores rem mantêm sua unidade, para preservar sua resposta à fonte raiz. Impressão conserva 25pt / 11pt.

## Spacing, radius e elevação

Escala preferida para trabalho novo: 4, 8, 12, 16, 20, 24, 32, 40, 48 e 64px. Existem aliases ópticos intermediários extraídos, usados para preservar o layout atual. Eles não são uma recomendação para expandir a escala sem motivo.

Aliases de propósito: `spacing-control-x` 16px; `spacing-control-y` 10px; `spacing-surface` 24px; `spacing-section` 32px.

| Componente | Forma |
|---|---|
| Botão / toast | circular, `radius-full` / `button-radius` |
| Navegação / campo / tooltip | 12px |
| Atalho dentro do tooltip | 8px |
| Menu / card de coleção / confirmação | 24px |
| Item de menu | 16px, com 8px de padding externo |

Menu e toast compartilham `shadow-menu` (`0 8px 28px #0002`); modal usa `shadow-dialog` (`0 16px 60px #0002`); tooltip e cards mantêm as sombras extraídas específicas. As diferenças entre menu, modal e card são intencionais; não unificar todas as sombras em uma só.

## Especificações de componentes e estados

| Componente | Default | Hover / active | Disabled / erro | Focus |
|---|---|---|---|---|
| Principal | `button-bg/text`, 10×16px, 13px, circular | `button-bg-hover` e `button-primary-bg-active`, sem opacidade no texto | `button-opacity-disabled` = 0,35; `disabled` nativo | outline 2px, offset 3px |
| Secundário | superfície, texto ink, borda line | hover compartilhado; active `control-bg-active` | mesmo disabled nativo | mesmo outline |
| Destrutivo preenchido | `destructive-button`, vermelho compartilhado, branco, peso 600 | `button-destructive-bg-hover/active` | hover não altera disabled | mesmo outline |
| Destrutivo com borda | aviso da lixeira, texto e ícone no mesmo tom, borda sutil, circular | `button-destructive-outline-bg-hover/active` | hover não altera disabled | mesmo outline |
| Item de menu destrutivo | `menu-destructive-text`, ícone herda a cor | `menu-destructive-bg-hover/active` | preserva o estado disabled do menu | highlight do Radix |
| Input | `input-bg/border/text/radius` | campo focado: borda secundária e halo accent | `aria-invalid=true`: erro; disabled: sidebar/muted | `input-focus-border/ring`; no contêiner para busca |
| Card de coleção | superfície, borda, raio 24px, sombra leve | sombra hover, deslocamento já existente; seleção com outline | sem estado disabled no produto atual | outline de seleção/foco |
| Menu | superfície, raio 24px, padding 8px; item 16px | highlight/open do Radix | `data-disabled`, cursor neutro | Radix roving focus / highlight |
| Tooltip | 12px, padding 6×10px, texto 12/16px | abertura por ponteiro e foco | não interativo | trigger acessível; atalho como informação |
| Confirmação | raio 24px, blur 4px, sombra dialog | entrada/saída compartilhada | confirmação destrutiva explícita | começa em Cancelar; Escape e retorno ao trigger |
| Toast | largura máxima 380px, circular, sombra menu | ação e fechar com hover; anterior fica inert | erro tem duração maior; timer pausa em hover/foco | foco visível; live region |

Abaixo de 400px, ações das confirmações ficam em coluna com largura total e mínimo de 44px de altura. Botões compactos do editor continuam menores: uma eventual mudança na densidade/touch targets requer revisão do conjunto, não só aumentar um ícone isolado.

Estados de loading permanecem nos componentes que já têm trabalho assíncrono (`aria-busy`, spinner e mensagens). Não foi inventado um loading para operações locais síncronas. A aparência `aria-invalid` está definida, mas a validação de cada formulário precisa aplicar o atributo quando houver erro; o CSS não inventa regras de validação.

## Motion

A alternância claro/escuro aplica as cores em um único commit antes do paint. A classe temporária `theme-changing` suspende as transições das superfícies durante esse commit e é removida após o reflow. Trocas de ícone/texto continuam animadas; hover e transições de paleta voltam a funcionar normalmente após a aplicação do tema.

Preferências ↔ detalhes do Drive usa `t-page-slide`: entrada e saída de 250ms, deslocamento de 8px, blur de 3px e easing smooth-out. As duas páginas permanecem montadas durante a troca; a inativa fica `inert` e `aria-hidden`. Cada página tem scroll próprio e a navegação move o foco para Voltar ou para o conector. Os tokens `page-*` seguem a arquitetura primitive → semantic → component.

O botão de aparência usa `t-icon-swap` para sol/lua com os tokens existentes. Hover dos cards conserva 160ms e 2px, com `ease-smooth-out` no deslocamento. As três transições respeitam `prefers-reduced-motion`.

Tokens das transições existentes foram centralizados, mantendo os nomes lidos pelo código. Modal/dropdown: 250ms de entrada e 150ms de saída; Banner Stacking: 450ms de entrada, 200ms de espera do anterior, 250ms de saída, rise 60px, blur 2px e easing `cubic-bezier(0.22,1,0.36,1)`.

O toast continua um fake stack: só o atual é acessível; o anterior é descartado após a animação. `prefers-reduced-motion` e a geometria dinâmica medida em JS foram preservados. Coordenadas de layout, percentuais de transform e durações calculadas não devem ser substituídos mecanicamente por spacing.

## Gaps priorizados

| Prioridade | Gap / estado | Próxima ação |
|---|---|---|
| Crítico — corrigido | `muted` neutro abaixo de 4,5:1 em texto pequeno | usa o cinza secundário existente |
| Alto — corrigido | dark do app e `.dark` do editor tinham caminhos diferentes | aliases dark + sincronização da classe; contexto escuro da barra preservado |
| Alto — corrigido | cores de ações/hover, placeholders e foco sem contrato consistente | contratos e estados compartilhados; hover opaco e ação do toast revisados |
| Médio — pendente | 301 ocorrências potenciais do scanner | revisar por propriedade/contexto; dimensões de layout e rem de ícones não são automaticamente spacing |
| Médio — pendente | família legada Tiptap e nomes numéricos coexistem com contratos de propósito | migrar incrementos futuros para contratos, sem quebrar cores de conteúdo |
| Médio — pendente | estados de erro/loading não são universais em todos os formulários | aplicar `aria-invalid`, relações com mensagens e `aria-busy` onde houver validação real |
| Médio — decisão de produto | textos de 10/11px e controles compactos | decidir se a prioridade é manter densidade ou ampliar tamanho/alvo de toque |
| Baixo — preservado | cores de marca de integrações, impressão e `@property initial-value` | exceções locais documentadas; não retematizar logotipos ou impressão automaticamente |
| Baixo — decisão de produto | vários ajustes ópticos e radii legados | consolidar a escala só após comparação visual por componente |

Não há decisão de marca bloqueando esta entrega. Qualquer troca de cores principais, fonte ou densidade deve ser aprovada antes de uma nova alteração.

## Do / Don't

**Fazer:** editar o JSON e regenerar; usar component tokens em novos componentes; usar semantics para conteúdo compartilhado; preservar escopos locais de contraste; manter erro/sucesso independentes de branding; verificar valores computados em light/dark e nas paletas; usar `disabled`/`aria-invalid`/`aria-busy` com significado real.

**Evitar:** editar o CSS gerado; usar primitives diretamente em componentes novos; substituir coordenadas/dimensões só porque têm `px`; trocar rem por px sem comparar comportamento; escurecer cores escritas pelo usuário; aplicar opacidade no botão inteiro para hover; remover foco; declarar zero gaps baseado apenas no scanner regex.

## Validação da entrega

`tokens:check` passou; build passou; 50 testes existentes passaram. Amostras visuais cobrem as seis paletas em light/dark, estados padrão e controles compartilhados. A Biblioteca real também foi conferida: DM Sans, spacing de 16px e aparência carregados corretamente; nenhum erro de console. Foi necessário reiniciar o Vite porque sua transformação em cache de `main.tsx` ainda não incluía a nova importação. O servidor segue em `http://localhost:5173`.

A migração não altera o armazenamento, a sincronização, o conteúdo das notas ou a lógica de exclusão/restauração. A validação regex continua retornando 1 pelas pendências descritas — isso é visível e não foi suprimido.
