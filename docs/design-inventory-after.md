# Inventário do design existente — depois da migração

CSS global + SCSS do editor; sem Tailwind, CSS Modules ou styled-components. Inventário estático de valores declarados: inclui overrides, tokens e cores do conteúdo editorial; não representa sozinho o estilo final computado. Localização completa no JSON adjacente. CSS gerado é excluído; estilos inline literais e expressões são listados separadamente dos valores computados.

## Cores literais (22 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `#fff` | 7 | src/profile.ts:36 · literal |
| `#171717` | 5 | src/styles.css:313 · literal |
| `#ddd` | 2 | src/styles.css:3 · literal |
| `#0006` | 2 | src/styles.css:3 · literal |
| `#fef08a` | 1 | src/SelectionMenu.tsx:88 · literal |
| `#bbf7d0` | 1 | src/SelectionMenu.tsx:89 · literal |
| `#bfdbfe` | 1 | src/SelectionMenu.tsx:90 · literal |
| `#fbcfe8` | 1 | src/SelectionMenu.tsx:91 · literal |
| `#ddd6fe` | 1 | src/SelectionMenu.tsx:92 · literal |
| `#0002` | 1 | src/styles.css:69 · literal |
| `rgba(0,0,0,.12)` | 1 | src/styles.css:266 · literal |
| `rgba(255,255,255,.12)` | 1 | src/styles.css:271 · literal |
| `#f6f6f6` | 1 | src/styles.css:325 · literal |
| `#0d0d0d` | 1 | src/themes.css:5 · literal |
| `#666` | 1 | src/themes.css:6 · literal |
| `#777` | 1 | src/themes.css:7 · literal |
| `#e9e9e9` | 1 | src/themes.css:8 · literal |
| `rgba(0,0,0,.05)` | 1 | src/themes.css:9 · literal |
| `#f9f9f9` | 1 | src/themes.css:11 · literal |
| `rgba(0,0,0,.14)` | 1 | src/themes.css:41 · literal |
| `#222` | 1 | src/themes.css:41 · literal |
| `#0007` | 1 | src/user-profile.css:6 · literal |

## Tipografia (70 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `var(--font-size-13)` | 38 | src/cloud-storage.css:12 · font-size |
| `var(--font-size-12)` | 33 | src/buttons.css:11 · font-size |
| `var(--font-size-11)` | 24 | src/cloud-storage.css:74 · font-size |
| `var(--font-size-14)` | 18 | src/cloud-storage.css:11 · font-size |
| `var(--font-weight-600)` | 15 | src/cloud-storage.css:17 · font-weight |
| `var(--font-weight-500)` | 12 | src/cloud-storage.css:11 · font-weight |
| `inherit` | 8 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:48 · font |
| `var(--font-size-10)` | 8 | src/styles.css:3 · font-size |
| `var(--font-size-15)` | 7 | src/cloud-storage.css:17 · font-size |
| `var(--line-height-1-5)` | 7 | src/cloud-storage.css:70 · line-height |
| `20px` | 6 | src/cloud-storage.css:69 · line-height |
| `var(--font-size-16)` | 4 | src/cloud-storage.css:22 · font-size |
| `var(--font-size-0-75rem)` | 4 | src/components/tiptap-ui-primitive/badge/badge.scss:21 · font-size |
| `var(--line-height-1-4)` | 4 | src/delete-note-dialog.css:23 · line-height |
| `var(--line-height-1-6)` | 4 | src/delete-note-dialog.css:24 · line-height |
| `var(--line-height-1-35)` | 4 | src/folders.css:230 · line-height |
| `var(--font-size-18)` | 4 | src/styles.css:3 · font-size |
| `normal` | 3 | src/components/tiptap-ui-primitive/card/card.scss:67 · line-height |
| `var(--line-height-1-3)` | 3 | src/folders.css:240 · line-height |
| `var(--font-weight-400)` | 3 | src/folders.css:283 · font-weight |
| `600` | 2 | src/components/tiptap-ui-primitive/card/card.scss:69 · font-weight |
| `var(--line-height-1-7)` | 2 | src/cloud-storage.css:55 · line-height |
| `"salt" on,
    "cv01" on` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:3 · font-feature-settings |
| `1.15` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:6 · line-height |
| `tabular-nums` | 2 | src/note-find.css:20 · font-variant-numeric |
| `var(--line-height-1-65)` | 2 | src/styles.css:3 · line-height |
| `var(--font-size-28)` | 2 | src/styles.css:3 · font-size |
| `-.3px` | 2 | src/styles.css:3 · letter-spacing |
| `var(--font-size-20)` | 2 | src/styles.css:3 · font-size |
| `var(--font-size-25)` | 2 | src/styles.css:5 · font-size |
| `var(--font-size-26)` | 2 | src/styles.css:6 · font-size |
| `var(--font-size-24)` | 2 | src/styles.css:7 · font-size |
| `500` | 1 | src/components/tiptap-ui-primitive/button/button.scss:2 · font-weight |
| `650` | 1 | src/styles.css:319 · font-weight |
| `700` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:2 · font-weight |
| `'var(--font-size-14)'` | 1 | src/App.tsx:801 · font-size |
| `18px` | 1 | src/buttons.css:12 · line-height |
| `var(--font-size-0-625rem)` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:1 · font-size |
| `var(--font-size-0-875rem)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:1 · font-size |
| `var(--font-size-0-9375rem)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:41 · font-size |
| `1.2` | 1 | src/components/tiptap-ui-primitive/button/button.scss:50 · line-height |
| `1.5rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:62 · line-height |
| `var(--text-size-label)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:20 · font-size |
| `var(--space-16)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:21 · line-height |
| `var(--font-shortcut)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:31 · font-family |
| `var(--font-size-13-5)` | 1 | src/create-menu.css:170 · font-size |
| `var(--text-size-dialog-title)` | 1 | src/delete-note-dialog.css:23 · font-size |
| `var(--text-size-ui)` | 1 | src/delete-note-dialog.css:24 · font-size |
| `0.6px` | 1 | src/folders.css:125 · letter-spacing |
| `var(--font-size-12-5)` | 1 | src/folders.css:306 · font-size |
| `var(--font-ui)` | 1 | src/styles.css:1 · font-family |
| `auto` | 1 | src/styles.css:1 · font-optical-sizing |
| `none` | 1 | src/styles.css:1 · font-synthesis |
| `-.5px` | 1 | src/styles.css:3 · letter-spacing |
| `var(--font-size-30)` | 1 | src/styles.css:3 · font-size |
| `-.8px` | 1 | src/styles.css:3 · letter-spacing |
| `var(--font-code)` | 1 | src/styles.css:3 · font-family |
| `var(--line-height-1-9)` | 1 | src/styles.css:3 · line-height |
| `var(--font-size-21)` | 1 | src/styles.css:3 · font-size |
| `-.7px` | 1 | src/styles.css:3 · letter-spacing |
| `var(--button-font-size)` | 1 | src/styles.css:3 · font-size |
| `var(--font-size-27)` | 1 | src/styles.css:4 · font-size |
| `-.6px` | 1 | src/styles.css:6 · letter-spacing |
| `var(--font-size-23)` | 1 | src/styles.css:7 · font-size |
| `var(--font-size-17)` | 1 | src/styles.css:74 · font-size |
| `25pt` | 1 | src/styles.css:319 · font-size |
| `var(--line-height-1-2)` | 1 | src/styles.css:319 · line-height |
| `-.5pt` | 1 | src/styles.css:319 · letter-spacing |
| `11pt` | 1 | src/styles.css:321 · font-size |
| `22px` | 1 | src/user-profile.css:9 · line-height |

## Spacing (156 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `0` | 51 | src/cloud-storage.css:5 · padding |
| `var(--space-8)` | 32 | src/buttons.css:23 · padding |
| `var(--space-12)` | 28 | src/cloud-storage.css:21 · gap |
| `var(--space-4)` | 19 | src/buttons.css:43 · padding |
| `var(--space-10)` | 19 | src/cloud-storage.css:12 · gap |
| `var(--space-6)` | 18 | src/buttons.css:5 · gap |
| `var(--space-2)` | 18 | src/cloud-storage.css:56 · padding-left |
| `var(--space-16)` | 15 | src/cloud-storage.css:59 · padding |
| `var(--space-5)` | 13 | src/folders.css:33 · gap |
| `var(--space-24)` | 12 | src/cloud-storage.css:19 · padding-top |
| `var(--space-20)` | 11 | src/cloud-storage.css:21 · margin-bottom |
| `var(--space-3)` | 10 | src/folders.css:239 · margin-top |
| `auto` | 9 | src/cloud-storage.css:63 · margin-left |
| `var(--space-7)` | 8 | src/cloud-storage.css:27 · gap |
| `var(--space-0-25rem)` | 8 | src/components/tiptap-ui-primitive/badge/badge-group.scss:4 · gap |
| `var(--space-9)` | 8 | src/styles.css:3 · gap |
| `var(--space-18)` | 7 | src/sidebar.css:91 · margin-top |
| `var(--space-0-375rem)` | 5 | src/components/tiptap-ui-primitive/badge/badge.scss:24 · padding |
| `var(--space-14)` | 5 | src/styles.css:3 · margin-bottom |
| `var(--space-4) var(--space-8)` | 4 | src/buttons.css:7 · padding |
| `var(--space-4) 0` | 4 | src/cloud-storage.css:35 · padding |
| `var(--space-22)` | 4 | src/folders.css:289 · margin-bottom |
| `0!important` | 4 | src/styles.css:315 · margin |
| `var(--menu-padding)` | 3 | src/buttons.css:48 · padding |
| `var(--space-1)` | 3 | src/cloud-storage.css:71 · margin-top |
| `var(--space-0-125rem)` | 3 | src/components/tiptap-ui-primitive/badge/badge.scss:32 · padding |
| `var(--space-10) var(--space-12)` | 3 | src/note-actions.css:17 · padding |
| `var(--space-28)` | 3 | src/styles.css:3 · margin-top |
| `var(--space-9) var(--space-12)` | 2 | src/cloud-storage.css:12 · padding |
| `var(--space-10) var(--space-16)` | 2 | src/cloud-storage.css:27 · padding |
| `0 0 var(--space-8)` | 2 | src/cloud-storage.css:60 · margin |
| `var(--space-6) var(--space-10)` | 2 | src/cloud-storage.css:91 · padding |
| `0 var(--space-0-125rem)` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:38 · padding |
| `var(--space-0-75rem) var(--space-0-5rem) var(--space-0-25rem)` | 2 | src/components/tiptap-ui-primitive/card/card.scss:66 · padding |
| `var(--tt-tooltip-padding)` | 2 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:19 · padding |
| `0 var(--space-14)` | 2 | src/create-menu.css:234 · padding |
| `var(--space-36)` | 2 | src/folders.css:53 · margin-bottom |
| `0 var(--space-5)` | 2 | src/folders.css:276 · margin |
| `var(--space-8) var(--space-12)` | 2 | src/motion.css:173 · padding |
| `var(--space-9) var(--space-8) 0` | 2 | src/sidebar.css:18 · padding |
| `var(--space-3) 0` | 2 | src/sidebar.css:29 · padding |
| `var(--space-24) 0` | 2 | src/styles.css:3 · padding |
| `var(--space-24) 0 var(--space-12)` | 2 | src/styles.css:3 · margin |
| `var(--space-15px)` | 2 | src/styles.css:3 · gap |
| `0 var(--space-3)` | 2 | src/styles.css:3 · margin |
| `var(--modal-scroll-inset)` | 2 | src/styles.css:285 · margin-right |
| `'var(--space-14)'` | 1 | src/App.tsx:788 · margin-bottom |
| `'var(--space-9) var(--space-12)'` | 1 | src/App.tsx:796 · padding |
| `'var(--space-6)'` | 1 | src/App.tsx:802 · margin-top |
| `var(--space-24) var(--space-12)` | 1 | src/cloud-storage.css:10 · padding |
| `0 var(--space-12) var(--space-24)` | 1 | src/cloud-storage.css:11 · margin |
| `var(--space-56) var(--modal-scroll-inset) var(--modal-scroll-inset) 0` | 1 | src/cloud-storage.css:14 · padding |
| `0 var(--space-16) var(--space-16) var(--space-24)` | 1 | src/cloud-storage.css:16 · padding |
| `0 0 var(--space-16)` | 1 | src/cloud-storage.css:17 · margin |
| `var(--space-10) 0` | 1 | src/cloud-storage.css:24 · padding |
| `var(--space-12) 0 var(--space-24)` | 1 | src/cloud-storage.css:55 · margin |
| `var(--space-12) 0` | 1 | src/cloud-storage.css:61 · margin |
| `var(--space-2) var(--space-6)` | 1 | src/cloud-storage.css:74 · padding |
| `var(--space-20) var(--space-8)` | 1 | src/cloud-storage.css:79 · padding |
| `0 var(--space-8) var(--space-12) var(--space-16)` | 1 | src/cloud-storage.css:81 · padding |
| `var(--space-31px)` | 1 | src/cloud-storage.css:84 · margin-left |
| `var(--space-16) var(--space-52) var(--space-16) var(--space-16)` | 1 | src/cloud-storage.css:88 · padding |
| `var(--space-0-5rem)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:10 · padding |
| `var(--space-0-625rem)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:44 · padding |
| `var(--space-0-3125rem)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:53 · padding |
| `var(--space-1-75rem)` | 1 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:107 · padding-left |
| `0 var(--space-6)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:44 · padding |
| `var(--space-11px) var(--space-10)` | 1 | src/create-menu.css:206 · padding |
| `max(var(--space-0px),calc((var(--panel-w) - var(--pill-w)) / 2 - var(--space-8)))` | 1 | src/create-menu.css:319 · margin-right |
| `var(--space-20) var(--space-24)` | 1 | src/delete-note-dialog.css:25 · padding |
| `var(--space-9) var(--space-14)` | 1 | src/delete-note-dialog.css:26 · padding |
| `var(--space-12) var(--space-12) var(--space-12) var(--space-16)` | 1 | src/feedback.css:33 · padding |
| `-1px` | 1 | src/feedback.css:43 · margin |
| `var(--space-10) 0 var(--space-14)` | 1 | src/folders.css:9 · margin |
| `0 0 var(--space-5)` | 1 | src/folders.css:17 · padding |
| `-20px 0 var(--space-32)` | 1 | src/folders.css:63 · margin |
| `var(--space-9) var(--space-16)` | 1 | src/folders.css:73 · padding |
| `var(--space-10) var(--space-1) 0` | 1 | src/folders.css:223 · padding |
| `var(--space-9) var(--space-14) var(--space-9) var(--space-18)` | 1 | src/folders.css:246 · padding |
| `var(--space-4) var(--space-12)` | 1 | src/motion.css:123 · padding |
| `var(--space-6) var(--space-8)` | 1 | src/note-actions.css:39 · margin |
| `var(--space-8) var(--space-10)` | 1 | src/note-actions.css:40 · padding |
| `var(--space-10) var(--space-8)` | 1 | src/note-actions.css:45 · padding |
| `var(--space-6) var(--space-12)` | 1 | src/note-find.css:26 · padding |
| `var(--space-48)` | 1 | src/note-find.css:35 · padding-top |
| `var(--space-128px)` | 1 | src/note-find.css:36 · padding-top |
| `var(--outline-gap)` | 1 | src/note-outline.css:16 · gap |
| `var(--space-6) 0 var(--space-8)` | 1 | src/sidebar.css:26 · padding |
| `var(--space-34px)` | 1 | src/sidebar.css:52 · padding-left |
| `var(--sidebar-width)` | 1 | src/sidebar.css:59 · margin-left |
| `var(--space-9) 0 var(--space-16)` | 1 | src/sidebar.css:77 · padding |
| `0 var(--space-4) 0 var(--space-8)` | 1 | src/styles.css:3 · padding |
| `var(--space-9) var(--space-8)` | 1 | src/styles.css:3 · padding |
| `var(--space-23px) var(--space-8) var(--space-8)` | 1 | src/styles.css:3 · margin |
| `var(--space-26px)` | 1 | src/styles.css:3 · margin-top |
| `var(--space-9) var(--space-6)` | 1 | src/styles.css:3 · padding |
| `var(--space-258px)` | 1 | src/styles.css:3 · margin-left |
| `0 var(--space-28)` | 1 | src/styles.css:3 · padding |
| `0 var(--space-32) var(--space-30)` | 1 | src/styles.css:3 · padding |
| `var(--space-5) auto 0` | 1 | src/styles.css:3 · margin |
| `var(--space-7) 0` | 1 | src/styles.css:3 · padding |
| `var(--space-38px) auto 0` | 1 | src/styles.css:3 · margin |
| `0 0 var(--space-18)` | 1 | src/styles.css:3 · padding |
| `var(--space-14) 0 var(--space-27px)` | 1 | src/styles.css:3 · margin |
| `var(--space-4) var(--space-7)` | 1 | src/styles.css:3 · padding |
| `var(--space-5) 0` | 1 | src/styles.css:3 · padding |
| `0 var(--space-11px)` | 1 | src/styles.css:3 · padding |
| `var(--space-25px) 0` | 1 | src/styles.css:3 · padding |
| `var(--space-20) 0 var(--space-10)` | 1 | src/styles.css:3 · margin |
| `var(--space-25px)` | 1 | src/styles.css:3 · padding-left |
| `0 0 var(--space-14)` | 1 | src/styles.css:3 · margin |
| `var(--space-2) 0` | 1 | src/styles.css:3 · margin |
| `var(--space-16) 0` | 1 | src/styles.css:3 · margin |
| `0 0 0 var(--space-19px)` | 1 | src/styles.css:3 · padding |
| `var(--space-20) 0` | 1 | src/styles.css:3 · padding |
| `0 var(--space-4)` | 1 | src/styles.css:3 · margin |
| `var(--space-20) auto` | 1 | src/styles.css:3 · margin |
| `var(--space-14) var(--space-16)` | 1 | src/styles.css:3 · padding |
| `0 auto` | 1 | src/styles.css:3 · margin |
| `var(--space-54px) var(--space-48) var(--space-30)` | 1 | src/styles.css:3 · padding |
| `var(--space-40)` | 1 | src/styles.css:3 · margin-bottom |
| `var(--button-padding-y) var(--button-padding-x)` | 1 | src/styles.css:3 · padding |
| `var(--space-19px) var(--space-8)` | 1 | src/styles.css:3 · padding |
| `var(--space-13px)` | 1 | src/styles.css:3 · gap |
| `var(--space-65px) var(--space-15px)` | 1 | src/styles.css:3 · padding |
| `var(--space-12) 0 var(--space-22)` | 1 | src/styles.css:3 · margin |
| `var(--space-22) 0 var(--space-9)` | 1 | src/styles.css:3 · margin |
| `var(--space-13px) var(--space-8)` | 1 | src/styles.css:3 · padding |
| `var(--space-22) 0` | 1 | src/styles.css:3 · padding |
| `var(--space-13px) var(--space-20)` | 1 | src/styles.css:3 · padding |
| `var(--space-40) var(--space-28)` | 1 | src/styles.css:4 · padding |
| `var(--space-240px)` | 1 | src/styles.css:5 · margin-left |
| `var(--space-30) var(--space-24)` | 1 | src/styles.css:5 · padding |
| `0 var(--space-12)` | 1 | src/styles.css:6 · padding |
| `0 var(--space-21px) var(--space-20)` | 1 | src/styles.css:6 · padding |
| `var(--space-27px)` | 1 | src/styles.css:6 · margin-top |
| `var(--space-13px) 0 var(--space-22)` | 1 | src/styles.css:6 · margin |
| `var(--space-32) var(--space-20)` | 1 | src/styles.css:6 · padding |
| `var(--space-32)` | 1 | src/styles.css:6 · margin-bottom |
| `var(--space-17px) var(--space-2)` | 1 | src/styles.css:6 · padding |
| `var(--space-17px)` | 1 | src/styles.css:7 · padding-inline |
| `-9px` | 1 | src/styles.css:9 · margin-top |
| `var(--space-2) var(--space-4)` | 1 | src/styles.css:62 · padding |
| `var(--space-1) 0` | 1 | src/styles.css:72 · padding |
| `var(--space-16) 0 var(--space-8)` | 1 | src/styles.css:73 · margin |
| `var(--space-5) var(--space-8)` | 1 | src/styles.css:141 · padding |
| `var(--space-38px)` | 1 | src/styles.css:173 · padding-right |
| `var(--space-16) 0 var(--space-22)` | 1 | src/styles.css:189 · margin |
| `0 var(--space-18) 0 var(--space-24)` | 1 | src/styles.css:279 · padding |
| `var(--space-12) var(--space-14) var(--space-18)` | 1 | src/styles.css:285 · padding |
| `var(--space-6) var(--space-12) var(--space-8)` | 1 | src/styles.css:286 · padding |
| `var(--space-58px) var(--space-24) var(--space-64)` | 1 | src/styles.css:297 · padding |
| `20mm 18mm 22mm` | 1 | src/styles.css:311 · margin |
| `0 0 var(--space-24)` | 1 | src/styles.css:319 · margin |
| `var(--space-20) 0 var(--space-24)` | 1 | src/themes.css:35 · padding |
| `var(--space-14) var(--space-8)` | 1 | src/themes.css:43 · gap |

## Raios (50 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `var(--radius-12)` | 13 | src/cloud-storage.css:24 · border-radius |
| `50%` | 11 | src/cloud-storage.css:30 · border-radius |
| `var(--button-radius)` | 9 | src/buttons.css:9 · border-radius |
| `var(--radius-16)` | 8 | src/buttons.css:24 · border-radius |
| `var(--radius-6)` | 8 | src/note-find.css:21 · border-radius |
| `var(--radius-8)` | 6 | src/cloud-storage.css:12 · border-radius |
| `var(--radius-24)` | 5 | src/buttons.css:23 · border-radius |
| `var(--menu-radius)` | 3 | src/buttons.css:47 · border-radius |
| `var(--radius-10)` | 3 | src/buttons.css:65 · border-radius |
| `calc(var(--padding) + var(--tt-radius-lg))` | 3 | src/components/tiptap-ui-primitive/card/card.scss:15 · border-radius |
| `var(--radius-full)` | 3 | src/feedback.css:31 · border-radius |
| `var(--radius-2)` | 3 | src/folders.css:40 · border-radius |
| `var(--radius-48)` | 3 | src/motion.css:114 · border-radius |
| `0` | 2 | src/feedback.css:28 · border-radius |
| `var(--radius-4)` | 2 | src/cloud-storage.css:74 · border-radius |
| `var(--tt-tooltip-radius)` | 2 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:17 · border-radius |
| `var(--confirmation-radius)` | 2 | src/delete-note-dialog.css:4 · border-radius |
| `var(--radius-7)` | 2 | src/folders.css:19 · border-radius |
| `var(--radius-22)` | 2 | src/folders.css:247 · border-radius |
| `var(--menu-item-radius)` | 2 | src/note-actions.css:19 · border-radius |
| `var(--radius-9)` | 2 | src/styles.css:3 · border-radius |
| `var(--radius-18)` | 2 | src/styles.css:3 · border-radius |
| `var(--input-radius)` | 2 | src/styles.css:3 · border-radius |
| `'var(--input-radius)'` | 1 | src/App.tsx:797 · border-radius |
| `var(--card-radius)` | 1 | src/buttons.css:70 · border-radius |
| `var(--radius-12) !important` | 1 | src/buttons.css:90 · border-radius |
| `var(--radius-9) !important` | 1 | src/buttons.css:94 · border-radius |
| `var(--tt-radius-sm, var(--radius-0-375rem))` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:14 · border-radius |
| `var(--tt-radius-md, var(--radius-0-375rem))` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:25 · border-radius |
| `var(--tt-radius-xs, var(--radius-0-25rem))` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:33 · border-radius |
| `var(--tt-radius-lg, var(--radius-0-75rem))` | 1 | src/components/tiptap-ui-primitive/button/button.scss:15 · border-radius |
| `var(--tt-radius-md, var(--radius-0-5rem))` | 1 | src/components/tiptap-ui-primitive/button/button.scss:54 · border-radius |
| `var(--radius-0-25rem)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:203 · border-radius |
| `var(--radius-999px)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:240 · border-radius |
| `var(--tooltip-radius)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:1 · --tt-tooltip-radius |
| `var(--tooltip-shortcut-radius)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:45 · border-radius |
| `var(--r)` | 1 | src/create-menu.css:88 · border-radius |
| `var(--crt-row-r, var(--radius-full))` | 1 | src/create-menu.css:237 · border-radius |
| `inherit` | 1 | src/create-menu.css:262 · border-radius |
| `var(--crt-row-r)` | 1 | src/create-menu.css:315 · border-radius |
| `var(--toast-radius)` | 1 | src/feedback.css:33 · border-radius |
| `var(--radius-15)` | 1 | src/folders.css:152 · border-radius |
| `var(--radius-14)` | 1 | src/folders.css:296 · border-radius |
| `var(--radius)` | 1 | src/note-find.css:8 · border-radius |
| `var(--button-radius, var(--radius-8))` | 1 | src/note-find.css:26 · border-radius |
| `var(--radius-20)` | 1 | src/styles.css:3 · border-radius |
| `var(--radius-36)` | 1 | src/styles.css:3 · border-radius |
| `var(--radius-13)` | 1 | src/styles.css:43 · border-radius |
| `var(--radius-3)` | 1 | src/styles.css:72 · border-radius |
| `var(--button-radius, var(--radius-full))` | 1 | src/styles.css:142 · border-radius |

## Sombras (21 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `var(--tt-shadow-elevated-md)` | 3 | src/components/tiptap-ui-primitive/card/card.scss:17 · box-shadow |
| `var(--menu-shadow)` | 3 | src/note-actions.css:11 · box-shadow |
| `var(--card-shadow)` | 2 | src/folders.css:157 · box-shadow |
| `var(--dialog-shadow)` | 2 | src/styles.css:3 · box-shadow |
| `0 0 0 3px var(--tt-button-check-focus-ring-color)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:252 · box-shadow |
| `var(--tooltip-shadow)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:24 · box-shadow |
| `0 0 0 1px var(--line)` | 1 | src/create-menu.css:6 · box-shadow |
| `var(--toast-shadow)` | 1 | src/feedback.css:33 · box-shadow |
| `var(--shadow-existing-a382d8d4)` | 1 | src/folders.css:22 · box-shadow |
| `var(--card-shadow-hover)` | 1 | src/folders.css:162 · box-shadow |
| `var(--shadow-existing-b6383236)` | 1 | src/folders.css:174 · box-shadow |
| `var(--input-focus-ring)` | 1 | src/input-focus.css:6 · box-shadow |
| `var(--input-focus-ring), var(--shadow-find)` | 1 | src/input-focus.css:9 · box-shadow |
| `var(--shadow-existing-16b50950)` | 1 | src/motion.css:178 · box-shadow |
| `var(--shadow-existing-7631818b)` | 1 | src/motion.css:281 · box-shadow |
| `var(--shadow-find)` | 1 | src/note-find.css:11 · box-shadow |
| `var(--shadow-existing-110f20fd)` | 1 | src/styles.css:43 · box-shadow |
| `var(--shadow-existing-a27c72f3)` | 1 | src/styles.css:90 · box-shadow |
| `var(--shadow-existing-ede8be8b)` | 1 | src/styles.css:136 · box-shadow |
| `var(--shadow-existing-64d41a81)` | 1 | src/styles.css:268 · box-shadow |
| `var(--shadow-existing-09971116)` | 1 | src/styles.css:271 · box-shadow |

## Motion (146 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `none !important` | 18 | src/favorite-button.css:34 · animation |
| `none` | 15 | src/cloud-storage.css:52 · transition |
| `scale(1)` | 12 | src/favorite-button.css:12 · transform |
| `translateX(0)` | 6 | src/folders.css:97 · transform |
| `translateY(-50%)` | 5 | src/note-outline.css:7 · transform |
| `translateY(0)` | 4 | src/feedback.css:2 · transform |
| `blur(0)` | 4 | src/feedback.css:3 · filter |
| `50% 100%` | 4 | src/feedback.css:65 · transform-origin |
| `rotate(360deg)` | 3 | src/cloud-storage.css:66 · transform |
| `var(--tt-transition-duration-default)` | 3 | src/components/tiptap-ui-primitive/badge/badge.scss:16 · transition-duration |
| `var(--tt-transition-easing-default)` | 3 | src/components/tiptap-ui-primitive/badge/badge.scss:17 · transition-timing-function |
| `var(--radix-dropdown-menu-content-transform-origin)` | 3 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:35 · transform-origin |
| `0s` | 3 | src/create-menu.css:314 · transition-delay |
| `scale(0.95)` | 3 | src/styles/_keyframe-animations.scss:20 · transform |
| `background, color, opacity` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:15 · transition-property |
| `blur(var(--text-swap-blur))` | 2 | src/feedback.css:13 · filter |
| `translateX(-50%)` | 2 | src/feedback.css:28 · transform |
| `blur(var(--stack-blur))` | 2 | src/feedback.css:75 · filter |
| `color var(--tabs-dur) var(--tabs-ease)` | 2 | src/folders.css:78 · transition |
| `none!important` | 2 | src/folders.css:104 · transition |
| `scale(var(--dropdown-pre-scale))` | 2 | src/motion.css:5 · transform |
| `scale(var(--dropdown-closing-scale))` | 2 | src/motion.css:25 · transform |
| `center` | 2 | src/motion.css:42 · transform-origin |
| `var(--tt-in-dur)` | 2 | src/motion.css:195 · transition-duration |
| `var(--tt-in-ease)` | 2 | src/motion.css:196 · transition-timing-function |
| `var(--tt-delay)` | 2 | src/motion.css:197 · transition-delay |
| `translateX(-100%)` | 2 | src/motion.css:295 · transform |
| `transform, opacity, filter, visibility` | 2 | src/motion.css:297 · transition-property |
| `var(--acc-expand)` | 2 | src/motion.css:330 · transition-duration |
| `rotate(180deg)` | 2 | src/motion.css:335 · transform |
| `rotate(-90deg)` | 2 | src/note-actions.css:42 · transform |
| `left center` | 2 | src/note-outline.css:45 · transform-origin |
| `opacity 150ms var(--resize-ease), visibility 0s 150ms` | 2 | src/sidebar.css:68 · transition |
| `background .14s` | 2 | src/styles.css:3 · transition |
| `opacity .14s` | 2 | src/styles.css:175 · transition |
| `opacity .14s ease` | 2 | src/styles.css:207 · transition |
| `scaleX(-1)` | 1 | src/buttons.css:19 · transform |
| `background-color 150ms ease-in-out` | 1 | src/cloud-storage.css:28 · transition |
| `opacity 150ms ease-in-out` | 1 | src/cloud-storage.css:48 · transition |
| `cloud-sync-spin 1s linear infinite` | 1 | src/cloud-storage.css:65 · animation |
| `background-color, border-color, color` | 1 | src/components/tiptap-ui-primitive/button/button.scss:206 · transition-property |
| `scale 340ms cubic-bezier(0.22, 1, 0.36, 1)` | 1 | src/create-menu.css:91 · transition |
| `scale 120ms cubic-bezier(0.35, 0, 0.5, 1)` | 1 | src/create-menu.css:120 · transition |
| `scale 260ms cubic-bezier(0.22, 1, 0.36, 1)` | 1 | src/create-menu.css:127 · transition |
| `width 380ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 160ms ease,
    scale 340ms cubic-bezier(0.22, 1, 0.36, 1)` | 1 | src/create-menu.css:172 · transition |
| `opacity 120ms ease` | 1 | src/create-menu.css:180 · transition |
| `width 380ms cubic-bezier(0.22, 1, 0.36, 1)` | 1 | src/create-menu.css:195 · transition |
| `translateY(6px)` | 1 | src/create-menu.css:219 · transform |
| `opacity 150ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1)` | 1 | src/create-menu.css:220 · transition |
| `color 200ms ease` | 1 | src/create-menu.css:249 · transition |
| `opacity 220ms ease` | 1 | src/create-menu.css:265 · transition |
| `140ms` | 1 | src/create-menu.css:270 · transition-duration |
| `1ms` | 1 | src/create-menu.css:279 · transition-duration |
| `scale 340ms cubic-bezier(.22,1,.36,1),background-color 180ms ease,border-color 180ms ease` | 1 | src/create-menu.css:308 · transition |
| `scale 120ms cubic-bezier(.35,0,.5,1),background-color 180ms ease` | 1 | src/create-menu.css:312 · transition |
| `visibility 260ms` | 1 | src/create-menu.css:313 · transition |
| `color var(--like-fill) var(--like-ease)` | 1 | src/favorite-button.css:1 · transition |
| `fill var(--like-fill) var(--like-ease), stroke var(--like-fill) var(--like-ease)` | 1 | src/favorite-button.css:3 · transition |
| `t-like-pop var(--like-pop) var(--like-pop-ease)` | 1 | src/favorite-button.css:11 · animation |
| `scale(0.82)` | 1 | src/favorite-button.css:12 · transform |
| `translate(0, 0) scale(0.4)` | 1 | src/favorite-button.css:25 · transform |
| `translate(calc(var(--px) * 0.25), calc(var(--py) * 0.25)) scale(1)` | 1 | src/favorite-button.css:26 · transform |
| `translate(var(--px), var(--py)) scale(var(--p-end-scale, 0.6))` | 1 | src/favorite-button.css:27 · transform |
| `t-like-burst var(--pdur, var(--like-particle-dur)) ease-out var(--pdelay, 0ms) forwards` | 1 | src/favorite-button.css:29 · animation |
| `opacity var(--like-fill) var(--like-ease), color var(--like-fill) var(--like-ease)` | 1 | src/favorite-button.css:41 · transition |
| `transform var(--text-swap-dur) var(--text-swap-ease),
    filter    var(--text-swap-dur) var(--text-swap-ease),
    opacity   var(--text-swap-dur) var(--text-swap-ease)` | 1 | src/feedback.css:5 · transition |
| `translateY(calc(var(--text-swap-translate-y) * -1))` | 1 | src/feedback.css:12 · transform |
| `translateY(var(--text-swap-translate-y))` | 1 | src/feedback.css:17 · transform |
| `50% 50%` | 1 | src/feedback.css:50 · transform-origin |
| `transform var(--stack-open) var(--stack-ease),
    opacity var(--stack-open) var(--stack-ease),
    filter var(--stack-open) var(--stack-ease)` | 1 | src/feedback.css:53 · transition |
| `translateY(0) scale(1)` | 1 | src/feedback.css:60 · transform |
| `translateY(calc(var(--stack-peek) * -1))
             scale(calc(1 - var(--stack-depth-scale)))` | 1 | src/feedback.css:66 · transform |
| `blur(var(--stack-depth1-blur))` | 1 | src/feedback.css:69 · filter |
| `translateY(var(--stack-rise)) scale(var(--stack-scale))` | 1 | src/feedback.css:73 · transform |
| `translateY(calc(var(--stack-peek) * -3))
             scale(calc(1 - var(--stack-depth-scale) * 3))` | 1 | src/feedback.css:80 · transform |
| `transform var(--stack-close) var(--stack-ease),
    opacity var(--stack-close) var(--stack-ease),
    filter var(--stack-close) var(--stack-ease)` | 1 | src/feedback.css:84 · transition |
| `translate(var(--x,0px),var(--y,0px)) rotate(var(--r,0deg))` | 1 | src/folders.css:23 · transform |
| `transform .42s cubic-bezier(.34,1.3,.64,1),color 150ms ease,border-color 150ms ease` | 1 | src/folders.css:25 · transition |
| `translate(var(--open-x),var(--open-y)) rotate(var(--open-r))` | 1 | src/folders.css:45 · transform |
| `translate(var(--x),var(--y)) rotate(var(--r))` | 1 | src/folders.css:50 · transform |
| `transform var(--tabs-dur) var(--tabs-ease),width var(--tabs-dur) var(--tabs-ease)` | 1 | src/folders.css:98 · transition |
| `border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease` | 1 | src/folders.css:158 · transition |
| `translateY(-2px)` | 1 | src/folders.css:163 · transform |
| `transform 0.16s ease, opacity 0.16s ease` | 1 | src/folders.css:183 · transition |
| `scale(1.05)` | 1 | src/folders.css:188 · transform |
| `opacity 0.16s ease` | 1 | src/folders.css:196 · transition |
| `opacity 0.14s ease` | 1 | src/folders.css:263 · transition |
| `top left` | 1 | src/motion.css:4 · transform-origin |
| `transform var(--dropdown-open-dur) var(--dropdown-ease),
    opacity   var(--dropdown-open-dur) var(--dropdown-ease)` | 1 | src/motion.css:8 · transition |
| `top right` | 1 | src/motion.css:14 · transform-origin |
| `top center` | 1 | src/motion.css:15 · transform-origin |
| `bottom left` | 1 | src/motion.css:16 · transform-origin |
| `bottom center` | 1 | src/motion.css:17 · transform-origin |
| `bottom right` | 1 | src/motion.css:18 · transform-origin |
| `transform var(--dropdown-close-dur) var(--dropdown-ease),
    opacity   var(--dropdown-close-dur) var(--dropdown-ease)` | 1 | src/motion.css:28 · transition |
| `scale(var(--modal-scale))` | 1 | src/motion.css:43 · transform |
| `transform var(--modal-open-dur) var(--modal-ease),
    opacity   var(--modal-open-dur) var(--modal-ease)` | 1 | src/motion.css:46 · transition |
| `scale(var(--modal-scale-close))` | 1 | src/motion.css:57 · transform |
| `transform var(--modal-close-dur) var(--modal-ease),
    opacity   var(--modal-close-dur) var(--modal-ease)` | 1 | src/motion.css:60 · transition |
| `translateY(var(--panel-translate-y))` | 1 | src/motion.css:75 · transform |
| `blur(var(--panel-blur))` | 1 | src/motion.css:77 · filter |
| `transform var(--panel-close-dur) var(--panel-ease),
    opacity   var(--panel-close-dur) var(--panel-ease),
    filter    var(--panel-close-dur) var(--panel-ease)` | 1 | src/motion.css:79 · transition |
| `transform var(--panel-open-dur) var(--panel-ease),
    opacity   var(--panel-open-dur) var(--panel-ease),
    filter    var(--panel-open-dur) var(--panel-ease)` | 1 | src/motion.css:90 · transition |
| `transform var(--tabs-dur) var(--tabs-ease),
    width     var(--tabs-dur) var(--tabs-ease)` | 1 | src/motion.css:147 · transition |
| `translate(-50%, 0) scale(var(--tt-scale))` | 1 | src/motion.css:171 · transform |
| `opacity   var(--tt-out-dur) var(--tt-out-ease),
    transform var(--tt-out-dur) var(--tt-out-ease)` | 1 | src/motion.css:182 · transition |
| `translate(-50%, 0) scale(1)` | 1 | src/motion.css:194 · transform |
| `opacity   var(--icon-swap-dur) var(--icon-swap-ease),
    filter    var(--icon-swap-dur) var(--icon-swap-ease),
    transform var(--icon-swap-dur) var(--icon-swap-ease)` | 1 | src/motion.css:218 · transition |
| `blur(var(--icon-swap-blur))` | 1 | src/motion.css:233 · filter |
| `scale(var(--icon-swap-start-scale))` | 1 | src/motion.css:234 · transform |
| `notes-dropdown-in var(--dropdown-open-dur) var(--dropdown-ease) both` | 1 | src/motion.css:242 · animation |
| `notes-dropdown-out var(--dropdown-close-dur) var(--dropdown-ease) both` | 1 | src/motion.css:246 · animation |
| `opacity var(--modal-close-dur) var(--modal-ease)` | 1 | src/motion.css:258 · transition |
| `var(--modal-open-dur)` | 1 | src/motion.css:262 · transition-duration |
| `notes-tooltip-in var(--tt-in-dur) var(--tt-in-ease) both` | 1 | src/motion.css:287 · animation |
| `scale(var(--tt-scale))` | 1 | src/motion.css:291 · transform |
| `var(--panel-close-dur), var(--panel-close-dur), var(--panel-close-dur), 0s` | 1 | src/motion.css:298 · transition-duration |
| `0s, 0s, 0s, var(--panel-close-dur)` | 1 | src/motion.css:299 · transition-delay |
| `var(--panel-ease)` | 1 | src/motion.css:300 · transition-timing-function |
| `var(--panel-open-dur), var(--panel-open-dur), var(--panel-open-dur), 0s` | 1 | src/motion.css:305 · transition-duration |
| `grid-template-rows var(--acc-collapse) var(--acc-ease),
    opacity var(--acc-collapse) var(--acc-ease)` | 1 | src/motion.css:323 · transition |
| `transform var(--acc-chevron) var(--acc-ease)` | 1 | src/motion.css:334 · transition |
| `background 0.12s ease` | 1 | src/note-actions.css:24 · transition |
| `left var(--resize-dur) var(--resize-ease)` | 1 | src/note-outline.css:8 · transition |
| `width var(--tt-in-dur) var(--dropdown-ease),
    opacity var(--tt-in-dur) var(--dropdown-ease),
    background-color var(--tt-in-dur) var(--dropdown-ease)` | 1 | src/note-outline.css:46 · transition |
| `translate(0, -50%) scale(var(--tt-scale))` | 1 | src/note-outline.css:73 · transform |
| `translate(0, -50%) scale(1)` | 1 | src/note-outline.css:81 · transform |
| `width  var(--resize-dur) var(--resize-ease),
    height var(--resize-dur) var(--resize-ease)` | 1 | src/sidebar.css:1 · transition |
| `transform var(--acc-chevron) var(--acc-ease),opacity 150ms ease` | 1 | src/sidebar.css:31 · transition |
| `grid-template-rows var(--acc-collapse) var(--acc-ease),opacity var(--acc-collapse) var(--acc-ease)` | 1 | src/sidebar.css:34 · transition |
| `margin-left var(--resize-dur) var(--resize-ease)` | 1 | src/sidebar.css:59 · transition |
| `opacity 150ms var(--resize-ease), visibility 0s` | 1 | src/sidebar.css:62 · transition |
| `translateY(-0.5rem)` | 1 | src/styles/_keyframe-animations.scss:49 · transform |
| `translateX(0.5rem)` | 1 | src/styles/_keyframe-animations.scss:58 · transform |
| `translateX(-0.5rem)` | 1 | src/styles/_keyframe-animations.scss:67 · transform |
| `translateY(0.5rem)` | 1 | src/styles/_keyframe-animations.scss:76 · transform |
| `rotate(0deg)` | 1 | src/styles/_keyframe-animations.scss:85 · transform |
| `none var(--tt-transition-duration-default)
      var(--tt-transition-easing-default)` | 1 | src/styles/_variables.scss:16 · transition |
| `transform .18s` | 1 | src/styles.css:6 · transition |
| `saving-spin .8s linear infinite` | 1 | src/styles.css:38 · animation |
| `background 0.12s, color 0.12s` | 1 | src/styles.css:110 · transition |
| `border-color .14s ease` | 1 | src/styles.css:279 · transition |
| `translate(-2px,2px)` | 1 | src/styles.css:295 · transform |
| `opacity .14s ease,transform .14s ease` | 1 | src/styles.css:295 · transition |
| `--palette-start 350ms ease-in-out, --palette-middle 350ms ease-in-out, --palette-end 350ms ease-in-out,
    --accent 350ms ease-in-out, --secondary 350ms ease-in-out, --muted 350ms ease-in-out,
    --line 350ms ease-in-out, --hover 350ms ease-in-out, --surface 350ms ease-in-out, --sidebar 350ms ease-in-out` | 1 | src/themes.css:12 · transition |
| `background-color 250ms ease-in-out, color 250ms ease-in-out` | 1 | src/themes.css:34 · transition |

## Dimensões (122 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `0` | 33 | src/cloud-storage.css:9 · min-height |
| `100%` | 29 | src/cloud-storage.css:12 · width |
| `32px` | 18 | src/folders.css:302 · width |
| `28px` | 16 | src/buttons.css:6 · min-height |
| `24px` | 15 | src/buttons.css:43 · width |
| `30px` | 11 | src/buttons.css:42 · min-width |
| `36px` | 11 | src/folders.css:6 · width |
| `1rem` | 9 | src/components/tiptap-ui-primitive/badge/badge.scss:30 · height |
| `0.875rem` | 9 | src/components/tiptap-ui-primitive/button/button.scss:92 · width |
| `44px` | 7 | src/delete-note-dialog.css:29 · min-height |
| `1px` | 7 | src/feedback.css:43 · width |
| `80px` | 7 | src/sidebar.css:25 · min-height |
| `1.5rem` | 6 | src/components/tiptap-ui-primitive/badge/badge.scss:22 · height |
| `0.625rem` | 6 | src/components/tiptap-ui-primitive/badge/badge.scss:54 · width |
| `0.75rem` | 6 | src/components/tiptap-ui-primitive/badge/badge.scss:59 · width |
| `1.125rem` | 5 | src/components/tiptap-ui-primitive/button/button.scss:87 · width |
| `18px` | 4 | src/cloud-storage.css:31 · width |
| `auto` | 4 | src/cloud-storage.css:91 · width |
| `16px` | 4 | src/folders.css:38 · width |
| `29px` | 4 | src/sidebar.css:44 · width |
| `0.5rem` | 3 | src/components/tiptap-ui-primitive/button/button.scss:140 · width |
| `max-content` | 3 | src/components/tiptap-ui-primitive/card/card.scss:51 · min-width |
| `38px` | 3 | src/create-menu.css:293 · height |
| `calc(100vw - 24px)` | 3 | src/note-actions.css:3 · max-width |
| `240px` | 3 | src/note-outline.css:62 · max-width |
| `258px` | 3 | src/sidebar.css:106 · width |
| `100dvh` | 3 | src/styles.css:3 · min-height |
| `19px` | 2 | src/cloud-storage.css:71 · width |
| `1.25rem` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:7 · height |
| `2rem` | 2 | src/components/tiptap-ui-primitive/button/button.scss:7 · height |
| `2.375rem` | 2 | src/components/tiptap-ui-primitive/button/button.scss:42 · height |
| `var(--radix-dropdown-menu-content-available-height)` | 2 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:27 · max-height |
| `244px` | 2 | src/create-menu.css:23 · width |
| `var(--pill-w)` | 2 | src/create-menu.css:165 · width |
| `calc(var(--like-particle-size) * var(--psize, 1))` | 2 | src/favorite-button.css:19 · width |
| `none` | 2 | src/feedback.css:28 · max-width |
| `2px` | 2 | src/folders.css:39 · height |
| `280px` | 2 | src/note-find.css:5 · width |
| `calc(100vw - 32px)` | 2 | src/note-find.css:6 · max-width |
| `60px` | 2 | src/styles.css:3 · height |
| `768px` | 2 | src/styles.css:3 · max-width |
| `190px` | 2 | src/styles.css:3 · max-width |
| `380px` | 2 | src/styles.css:3 · min-height |
| `400px` | 2 | src/styles.css:3 · max-width |
| `5px` | 2 | src/styles.css:3 · width |
| `56px` | 2 | src/styles.css:6 · height |
| `20px` | 2 | src/styles.css:6 · width |
| `15px` | 2 | src/styles.css:33 · width |
| `12px` | 2 | src/styles.css:38 · width |
| `66px` | 2 | src/styles.css:64 · min-width |
| `0!important` | 2 | src/styles.css:315 · min-height |
| `'100%'` | 1 | src/App.tsx:795 · width |
| `min(900px,calc(100% - 32px))` | 1 | src/cloud-storage.css:1 · width |
| `min(640px,calc(100dvh - 32px))` | 1 | src/cloud-storage.css:2 · height |
| `calc(100dvh - 32px)` | 1 | src/cloud-storage.css:3 · max-height |
| `0.125rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:239 · height |
| `8rem` | 1 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:26 · min-width |
| `6rem` | 1 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:66 · min-width |
| `var(--w)` | 1 | src/create-menu.css:87 · width |
| `var(--h)` | 1 | src/create-menu.css:88 · height |
| `var(--pill-h)` | 1 | src/create-menu.css:166 · height |
| `var(--panel-w)` | 1 | src/create-menu.css:205 · width |
| `var(--panel-h)` | 1 | src/create-menu.css:206 · height |
| `34px` | 1 | src/create-menu.css:233 · height |
| `sayW` | 1 | src/CreateMenu.tsx:119 · width |
| `min(440px,calc(100vw - 32px))` | 1 | src/delete-note-dialog.css:1 · width |
| `min(380px,calc(100vw - 32px))` | 1 | src/feedback.css:28 · width |
| `calc(100dvh - 48px)` | 1 | src/feedback.css:28 · max-height |
| `inherit` | 1 | src/feedback.css:30 · max-height |
| `min(380px,calc(100vw - var(--sidebar-width,258px) - 32px))` | 1 | src/feedback.css:42 · width |
| `var(--stack-front-height,52px)` | 1 | src/feedback.css:92 · height |
| `9px` | 1 | src/folders.css:44 · width |
| `248px` | 1 | src/note-actions.css:2 · width |
| `180px` | 1 | src/note-actions.css:41 · width |
| `calc((100vw - 30px) / 2)` | 1 | src/note-actions.css:44 · width |
| `var(--outline-item-height)` | 1 | src/note-outline.css:34 · height |
| `var(--outline-width)` | 1 | src/note-outline.css:40 · width |
| `var(--sidebar-expanded-width)` | 1 | src/sidebar.css:15 · width |
| `var(--sidebar-width)` | 1 | src/sidebar.css:58 · width |
| `var(--sidebar-rail-width)` | 1 | src/sidebar.css:76 · width |
| `62px` | 1 | src/styles.css:3 · min-height |
| `800px` | 1 | src/styles.css:3 · max-width |
| `42px` | 1 | src/styles.css:3 · min-height |
| `124px` | 1 | src/styles.css:3 · width |
| `440px` | 1 | src/styles.css:3 · min-height |
| `1060px` | 1 | src/styles.css:3 · max-width |
| `46px` | 1 | src/styles.css:3 · height |
| `22px` | 1 | src/styles.css:3 · width |
| `115px` | 1 | src/styles.css:3 · max-width |
| `65px` | 1 | src/styles.css:3 · width |
| `min(520px,calc(100% - 32px))` | 1 | src/styles.css:3 · width |
| `85dvh` | 1 | src/styles.css:3 · max-height |
| `90%` | 1 | src/styles.css:3 · max-width |
| `300px` | 1 | src/styles.css:4 · max-width |
| `220px` | 1 | src/styles.css:5 · max-width |
| `150px` | 1 | src/styles.css:6 · max-width |
| `230px` | 1 | src/styles.css:6 · max-width |
| `26px` | 1 | src/styles.css:6 · min-width |
| `160px` | 1 | src/styles.css:7 · max-width |
| `110px` | 1 | src/styles.css:19 · max-width |
| `1.3em` | 1 | src/styles.css:21 · min-height |
| `76px` | 1 | src/styles.css:40 · height |
| `calc(100% - 36px)` | 1 | src/styles.css:40 · max-width |
| `27px` | 1 | src/styles.css:64 · min-width |
| `540px` | 1 | src/styles.css:65 · max-width |
| `260px` | 1 | src/styles.css:66 · max-height |
| `130px` | 1 | src/styles.css:95 · min-width |
| `min(450px,calc(100% - 32px))` | 1 | src/styles.css:186 · width |
| `min(720px,calc(100% - 32px))` | 1 | src/styles.css:260 · width |
| `min(460px,calc(100dvh - 40px))` | 1 | src/styles.css:261 · height |
| `min(620px,calc(100dvh - 40px))` | 1 | src/styles.css:262 · max-height |
| `104px` | 1 | src/styles.css:273 · min-height |
| `calc(100% - 66px - var(--modal-scroll-inset))` | 1 | src/styles.css:285 · height |
| `54px` | 1 | src/styles.css:288 · min-height |
| `calc(100% - 20px)` | 1 | src/styles.css:300 · width |
| `min(460px,calc(100dvh - 20px))` | 1 | src/styles.css:300 · height |
| `calc(100dvh - 20px)` | 1 | src/styles.css:300 · max-height |
| `calc(100% - 60px - var(--modal-scroll-inset))` | 1 | src/styles.css:300 · height |
| `auto!important` | 1 | src/styles.css:317 · width |
| `none!important` | 1 | src/styles.css:317 · max-width |
| `100%!important` | 1 | src/styles.css:326 · max-width |
| `calc(100% - 48px)` | 1 | src/user-profile.css:9 · max-width |

## Variáveis existentes

| Variável | Valor | Arquivo |
|---|---|---|
| `--tt-badge-border-color` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:1 |
| `--tt-badge-border-color-subdued` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:7 |
| `--tt-badge-border-color-emphasized` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:8 |
| `--tt-badge-text-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:9 |
| `--tt-badge-text-color-subdued` | `var(
    --tt-gray-light-a-400
  )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:10 |
| `--tt-badge-bg-color-subdued` | `var(--white)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:17 |
| `--tt-badge-icon-color-subdued` | `var(
    --tt-gray-light-a-400
  )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:20 |
| `--tt-badge-border-color` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:29 |
| `--tt-badge-border-color-subdued` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:30 |
| `--tt-badge-border-color-emphasized` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:31 |
| `--tt-badge-text-color` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:32 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-gray-dark-a-400
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:33 |
| `--tt-badge-bg-color-subdued` | `var(--black)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:40 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-gray-dark-a-400
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:43 |
| `--tt-badge-border-color` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:56 |
| `--tt-badge-border-color-subdued` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:58 |
| `--tt-badge-border-color-emphasized` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:59 |
| `--tt-badge-text-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:60 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-gray-light-a-400
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:61 |
| `--tt-badge-bg-color-subdued` | `var(--transparent)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:68 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-gray-light-a-400
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:71 |
| `--tt-badge-border-color` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:80 |
| `--tt-badge-border-color-subdued` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:81 |
| `--tt-badge-border-color-emphasized` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:82 |
| `--tt-badge-text-color` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:83 |
| `--tt-badge-text-color-subdued` | `var(
        --tt-gray-dark-a-400
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:84 |
| `--tt-badge-bg-color-subdued` | `var(--transparent)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:91 |
| `--tt-badge-icon-color-subdued` | `var(
        --tt-gray-dark-a-400
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:94 |
| `--tt-badge-border-color` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:108 |
| `--tt-badge-border-color-subdued` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:110 |
| `--tt-badge-border-color-emphasized` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:111 |
| `--tt-badge-text-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:112 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-gray-light-a-400
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:113 |
| `--tt-badge-bg-color-subdued` | `var(
      --tt-gray-light-a-50
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:118 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-gray-light-a-400
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:125 |
| `--tt-badge-border-color` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:132 |
| `--tt-badge-border-color-subdued` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:133 |
| `--tt-badge-border-color-emphasized` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:134 |
| `--tt-badge-text-color` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:135 |
| `--tt-badge-text-color-subdued` | `var(
        --tt-gray-dark-a-400
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:136 |
| `--tt-badge-bg-color-subdued` | `var(
        --tt-gray-dark-a-50
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:141 |
| `--tt-badge-icon-color-subdued` | `var(
        --tt-gray-dark-a-400
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:148 |
| `--tt-badge-border-color` | `var(--tt-color-green-inc-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:160 |
| `--tt-badge-border-color-subdued` | `var(--tt-color-green-inc-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:162 |
| `--tt-badge-border-color-emphasized` | `var(--tt-color-green-dec-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:163 |
| `--tt-badge-text-color` | `var(--tt-color-green-dec-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:164 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-color-green-dec-2
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:165 |
| `--tt-badge-bg-color-subdued` | `var(
      --tt-color-green-inc-5
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:172 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-color-green-dec-2
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:179 |
| `--tt-badge-border-color` | `var(--tt-color-green-dec-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:188 |
| `--tt-badge-border-color-subdued` | `var(--tt-color-green-dec-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:189 |
| `--tt-badge-border-color-emphasized` | `var(--tt-color-green-base)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:190 |
| `--tt-badge-text-color` | `var(--tt-color-green-inc-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:191 |
| `--tt-badge-text-color-subdued` | `var(
        --tt-color-green-inc-2
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:192 |
| `--tt-badge-bg-color-subdued` | `var(
        --tt-color-green-dec-5
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:199 |
| `--tt-badge-icon-color-subdued` | `var(
        --tt-color-green-inc-2
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:206 |
| `--tt-badge-border-color` | `var(--tt-color-yellow-inc-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:220 |
| `--tt-badge-border-color-subdued` | `var(--tt-color-yellow-inc-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:222 |
| `--tt-badge-border-color-emphasized` | `var(--tt-color-yellow-dec-1)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:223 |
| `--tt-badge-text-color` | `var(--tt-color-yellow-dec-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:224 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-color-yellow-dec-2
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:225 |
| `--tt-badge-bg-color-subdued` | `var(
      --tt-color-yellow-inc-5
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:232 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-color-yellow-dec-2
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:239 |
| `--tt-badge-border-color` | `var(--tt-color-yellow-dec-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:248 |
| `--tt-badge-border-color-subdued` | `var(--tt-color-yellow-dec-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:249 |
| `--tt-badge-border-color-emphasized` | `var(--tt-color-yellow-inc-1)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:250 |
| `--tt-badge-text-color` | `var(--tt-color-yellow-inc-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:251 |
| `--tt-badge-text-color-subdued` | `var(
        --tt-color-yellow-inc-2
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:252 |
| `--tt-badge-bg-color-subdued` | `var(
        --tt-color-yellow-dec-5
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:259 |
| `--tt-badge-icon-color-subdued` | `var(
        --tt-color-yellow-inc-2
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:266 |
| `--tt-badge-border-color` | `var(--tt-color-red-inc-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:280 |
| `--tt-badge-border-color-subdued` | `var(--tt-color-red-inc-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:282 |
| `--tt-badge-border-color-emphasized` | `var(--tt-color-red-dec-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:283 |
| `--tt-badge-text-color` | `var(--tt-color-red-dec-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:284 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-color-red-dec-2
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:285 |
| `--tt-badge-bg-color-subdued` | `var(
      --tt-color-red-inc-5
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:292 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-color-red-dec-2
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:299 |
| `--tt-badge-border-color` | `var(--tt-color-red-dec-2)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:308 |
| `--tt-badge-border-color-subdued` | `var(--tt-color-red-dec-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:309 |
| `--tt-badge-border-color-emphasized` | `var(--tt-color-red-base)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:310 |
| `--tt-badge-text-color` | `var(--tt-color-red-inc-3)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:311 |
| `--tt-badge-text-color-subdued` | `var(
        --tt-color-red-inc-2
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:312 |
| `--tt-badge-bg-color-subdued` | `var(
        --tt-color-red-dec-5
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:319 |
| `--tt-badge-icon-color-subdued` | `var(
        --tt-color-red-inc-2
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:326 |
| `--tt-badge-border-color` | `var(--tt-brand-color-300)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:340 |
| `--tt-badge-border-color-subdued` | `var(--tt-brand-color-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:342 |
| `--tt-badge-border-color-emphasized` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:343 |
| `--tt-badge-text-color` | `var(--tt-brand-color-800)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:344 |
| `--tt-badge-text-color-subdued` | `var(
      --tt-brand-color-700
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:345 |
| `--tt-badge-bg-color-subdued` | `var(
      --tt-brand-color-50
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:352 |
| `--tt-badge-icon-color-subdued` | `var(
      --tt-brand-color-700
    )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:359 |
| `--tt-badge-border-color` | `var(--tt-brand-color-700)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:368 |
| `--tt-badge-border-color-subdued` | `var(--tt-brand-color-800)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:369 |
| `--tt-badge-border-color-emphasized` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:370 |
| `--tt-badge-text-color` | `var(--tt-brand-color-200)` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:371 |
| `--tt-badge-text-color-subdued` | `var(
        --tt-brand-color-300
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:372 |
| `--tt-badge-bg-color-subdued` | `var(
        --tt-brand-color-950
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:379 |
| `--tt-badge-icon-color-subdued` | `var(
        --tt-brand-color-300
      )` | src/components/tiptap-ui-primitive/badge/badge-colors.scss:386 |
| `--tt-button-default-bg-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:1 |
| `--tt-button-hover-bg-color` | `var(--tt-gray-light-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:7 |
| `--tt-button-active-bg-color` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:8 |
| `--tt-button-active-bg-color-emphasized` | `var(
    --tt-brand-color-100
  )` | src/components/tiptap-ui-primitive/button/button-colors.scss:9 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(
    --tt-brand-color-200
  )` | src/components/tiptap-ui-primitive/button/button-colors.scss:16 |
| `--tt-button-default-bg-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:26 |
| `--tt-button-hover-bg-color` | `var(--tt-gray-dark-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:27 |
| `--tt-button-active-bg-color` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:28 |
| `--tt-button-active-bg-color-emphasized` | `var(
      --tt-brand-color-900
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:29 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(
      --tt-brand-color-800
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:36 |
| `--tt-button-default-text-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:44 |
| `--tt-button-hover-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:51 |
| `--tt-button-active-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:52 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:53 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:54 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:55 |
| `--tt-button-default-text-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:59 |
| `--tt-button-hover-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:60 |
| `--tt-button-active-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:61 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:62 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:63 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:64 |
| `--tt-button-default-icon-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:66 |
| `--tt-button-hover-icon-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:73 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:74 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:75 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:76 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:77 |
| `--tt-button-default-icon-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:81 |
| `--tt-button-hover-icon-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:82 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:83 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:84 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:85 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:86 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:88 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:95 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:96 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:97 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:98 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:99 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:103 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:104 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:105 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:106 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:107 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:108 |
| `--tt-button-default-dropdown-arrows-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:110 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--tt-gray-light-a-700)` | src/components/tiptap-ui-primitive/button/button-colors.scss:117 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:118 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
    --tt-gray-light-a-700
  )` | src/components/tiptap-ui-primitive/button/button-colors.scss:119 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:122 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:123 |
| `--tt-button-default-dropdown-arrows-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:127 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--tt-gray-dark-a-700)` | src/components/tiptap-ui-primitive/button/button-colors.scss:128 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:129 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
      --tt-gray-dark-a-700
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:130 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:133 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:134 |
| `--tt-button-check-bg-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:142 |
| `--tt-button-check-hover-bg-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:144 |
| `--tt-button-check-border-color` | `var(--tt-gray-light-a-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:145 |
| `--tt-button-check-hover-border-color` | `var(--tt-gray-light-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:146 |
| `--tt-button-check-checked-bg-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:147 |
| `--tt-button-check-checked-border-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:148 |
| `--tt-button-check-checked-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:149 |
| `--tt-button-check-checked-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:150 |
| `--tt-button-check-focus-ring-color` | `color-mix(
      in srgb,
      var(--tt-brand-color-500) 20%,
      transparent
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:151 |
| `--tt-button-check-bg-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:159 |
| `--tt-button-check-hover-bg-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:160 |
| `--tt-button-check-border-color` | `var(--tt-gray-dark-a-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:161 |
| `--tt-button-check-hover-border-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:162 |
| `--tt-button-check-checked-bg-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:163 |
| `--tt-button-check-checked-border-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:164 |
| `--tt-button-check-checked-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:165 |
| `--tt-button-check-checked-icon-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:166 |
| `--tt-button-check-focus-ring-color` | `color-mix(
        in srgb,
        var(--tt-brand-color-400) 25%,
        transparent
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:167 |
| `--tt-button-default-bg-color` | `var(--transparent)` | src/components/tiptap-ui-primitive/button/button-colors.scss:184 |
| `--tt-button-hover-bg-color` | `var(--tt-gray-light-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:190 |
| `--tt-button-active-bg-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:191 |
| `--tt-button-active-bg-color-emphasized` | `var(
      --tt-brand-color-100
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:192 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(
      --tt-brand-color-200
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:199 |
| `--tt-button-default-bg-color` | `var(--transparent)` | src/components/tiptap-ui-primitive/button/button-colors.scss:209 |
| `--tt-button-hover-bg-color` | `var(--tt-gray-dark-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:210 |
| `--tt-button-active-bg-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:211 |
| `--tt-button-active-bg-color-emphasized` | `var(
        --tt-brand-color-900
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:212 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(
        --tt-brand-color-800
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:219 |
| `--tt-button-default-text-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:227 |
| `--tt-button-hover-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:234 |
| `--tt-button-active-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:235 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:236 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:237 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:238 |
| `--tt-button-default-text-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:242 |
| `--tt-button-hover-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:243 |
| `--tt-button-active-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:244 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:245 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:246 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:247 |
| `--tt-button-default-icon-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:249 |
| `--tt-button-hover-icon-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:256 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:257 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:258 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:259 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:260 |
| `--tt-button-default-icon-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:264 |
| `--tt-button-hover-icon-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:265 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:266 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:267 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:268 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:269 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:271 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:278 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:279 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:280 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:281 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:282 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:286 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:287 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:288 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:289 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:290 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:291 |
| `--tt-button-default-dropdown-arrows-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:293 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--tt-gray-light-a-700)` | src/components/tiptap-ui-primitive/button/button-colors.scss:300 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:301 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
      --tt-gray-light-a-700
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:302 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(
      --tt-gray-light-a-600
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:305 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:308 |
| `--tt-button-default-dropdown-arrows-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:312 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--tt-gray-dark-a-700)` | src/components/tiptap-ui-primitive/button/button-colors.scss:313 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:314 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
        --tt-gray-dark-a-700
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:315 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(
        --tt-gray-dark-a-600
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:318 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:321 |
| `--tt-button-default-bg-color` | `var(--tt-brand-color-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:330 |
| `--tt-button-hover-bg-color` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:336 |
| `--tt-button-active-bg-color` | `var(--tt-brand-color-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:337 |
| `--tt-button-active-bg-color-emphasized` | `var(
      --tt-brand-color-100
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:338 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(
      --tt-brand-color-200
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:345 |
| `--tt-button-default-bg-color` | `var(--tt-brand-color-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:355 |
| `--tt-button-hover-bg-color` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:356 |
| `--tt-button-active-bg-color` | `var(--tt-brand-color-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:357 |
| `--tt-button-active-bg-color-emphasized` | `var(
        --tt-brand-color-900
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:358 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(
        --tt-brand-color-800
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:365 |
| `--tt-button-default-text-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:373 |
| `--tt-button-hover-text-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:380 |
| `--tt-button-active-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:381 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:382 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:383 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:384 |
| `--tt-button-default-text-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:388 |
| `--tt-button-hover-text-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:389 |
| `--tt-button-active-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:390 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:391 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:392 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:393 |
| `--tt-button-default-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:395 |
| `--tt-button-hover-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:402 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:403 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:404 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:405 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:406 |
| `--tt-button-default-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:410 |
| `--tt-button-hover-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:411 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:412 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:413 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:414 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:415 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:417 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:424 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:425 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:426 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:427 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:428 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:432 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-dark-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:433 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:434 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:435 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:436 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:437 |
| `--tt-button-default-dropdown-arrows-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:439 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:446 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-light-a-700)` | src/components/tiptap-ui-primitive/button/button-colors.scss:447 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
      --tt-gray-light-a-700
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:448 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(
      --tt-gray-light-a-700
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:451 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:454 |
| `--tt-button-default-dropdown-arrows-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:458 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:459 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:460 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
        --tt-gray-dark-a-600
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:461 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(
        --tt-gray-dark-a-600
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:464 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:467 |
| `--tt-button-default-bg-color` | `var(--tt-gray-light-800)` | src/components/tiptap-ui-primitive/button/button-colors.scss:480 |
| `--tt-button-hover-bg-color` | `var(--tt-gray-light-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:486 |
| `--tt-button-active-bg-color` | `var(--tt-brand-color-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:487 |
| `--tt-button-active-bg-color-emphasized` | `var(--tt-brand-color-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:488 |
| `--tt-button-active-bg-color-subdued` | `var(--tt-brand-color-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:489 |
| `--tt-button-active-hover-bg-color` | `var(--tt-brand-color-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:490 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(--tt-brand-color-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:491 |
| `--tt-button-active-hover-bg-color-subdued` | `var(--tt-brand-color-200)` | src/components/tiptap-ui-primitive/button/button-colors.scss:492 |
| `--tt-button-disabled-bg-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:493 |
| `--tt-button-default-bg-color` | `var(--tt-gray-dark-800)` | src/components/tiptap-ui-primitive/button/button-colors.scss:497 |
| `--tt-button-hover-bg-color` | `var(--tt-gray-dark-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:498 |
| `--tt-button-active-bg-color` | `var(--tt-brand-color-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:499 |
| `--tt-button-active-bg-color-emphasized` | `var(--tt-brand-color-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:500 |
| `--tt-button-active-bg-color-subdued` | `var(--tt-brand-color-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:501 |
| `--tt-button-active-hover-bg-color` | `var(--tt-brand-color-800)` | src/components/tiptap-ui-primitive/button/button-colors.scss:502 |
| `--tt-button-active-hover-bg-color-emphasized` | `var(--tt-brand-color-800)` | src/components/tiptap-ui-primitive/button/button-colors.scss:503 |
| `--tt-button-active-hover-bg-color-subdued` | `var(--tt-brand-color-800)` | src/components/tiptap-ui-primitive/button/button-colors.scss:504 |
| `--tt-button-disabled-bg-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:505 |
| `--tt-button-default-text-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:507 |
| `--tt-button-hover-text-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:514 |
| `--tt-button-active-text-color` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:515 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:516 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-light-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:517 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:518 |
| `--tt-button-default-text-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:522 |
| `--tt-button-hover-text-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:523 |
| `--tt-button-active-text-color` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:524 |
| `--tt-button-active-text-color-emphasized` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:525 |
| `--tt-button-active-text-color-subdued` | `var(--tt-gray-dark-a-900)` | src/components/tiptap-ui-primitive/button/button-colors.scss:526 |
| `--tt-button-disabled-text-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:527 |
| `--tt-button-default-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:529 |
| `--tt-button-hover-icon-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:536 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:537 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:538 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-brand-color-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:539 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:540 |
| `--tt-button-default-icon-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:544 |
| `--tt-button-hover-icon-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:545 |
| `--tt-button-active-icon-color` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:546 |
| `--tt-button-active-icon-color-emphasized` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:547 |
| `--tt-button-active-icon-color-subdued` | `var(--tt-brand-color-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:548 |
| `--tt-button-disabled-icon-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:549 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:551 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:558 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:559 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:560 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-light-a-500)` | src/components/tiptap-ui-primitive/button/button-colors.scss:561 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:562 |
| `--tt-button-default-icon-sub-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:566 |
| `--tt-button-hover-icon-sub-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:567 |
| `--tt-button-active-icon-sub-color` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:568 |
| `--tt-button-active-icon-sub-color-emphasized` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:569 |
| `--tt-button-active-icon-sub-color-subdued` | `var(--tt-gray-dark-a-300)` | src/components/tiptap-ui-primitive/button/button-colors.scss:570 |
| `--tt-button-disabled-icon-sub-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/button/button-colors.scss:571 |
| `--tt-button-default-dropdown-arrows-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:573 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--white)` | src/components/tiptap-ui-primitive/button/button-colors.scss:580 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-light-a-700)` | src/components/tiptap-ui-primitive/button/button-colors.scss:581 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
      --tt-gray-light-a-700
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:582 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(
      --tt-gray-light-a-700
    )` | src/components/tiptap-ui-primitive/button/button-colors.scss:585 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:588 |
| `--tt-button-default-dropdown-arrows-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:592 |
| `--tt-button-hover-dropdown-arrows-color` | `var(--black)` | src/components/tiptap-ui-primitive/button/button-colors.scss:593 |
| `--tt-button-active-dropdown-arrows-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/button/button-colors.scss:594 |
| `--tt-button-active-dropdown-arrows-color-emphasized` | `var(
        --tt-gray-dark-a-600
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:595 |
| `--tt-button-active-dropdown-arrows-color-subdued` | `var(
        --tt-gray-dark-a-600
      )` | src/components/tiptap-ui-primitive/button/button-colors.scss:598 |
| `--tt-button-disabled-dropdown-arrows-color` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/button/button-colors.scss:601 |
| `--tiptap-card-bg-color` | `var(--white)` | src/components/tiptap-ui-primitive/card/card.scss:1 |
| `--tiptap-card-border-color` | `var(--tt-gray-light-a-100)` | src/components/tiptap-ui-primitive/card/card.scss:2 |
| `--tiptap-card-group-label-color` | `var(--tt-gray-light-a-800)` | src/components/tiptap-ui-primitive/card/card.scss:3 |
| `--tiptap-card-bg-color` | `var(--tt-gray-dark-50)` | src/components/tiptap-ui-primitive/card/card.scss:7 |
| `--tiptap-card-border-color` | `var(--tt-gray-dark-a-100)` | src/components/tiptap-ui-primitive/card/card.scss:8 |
| `--tiptap-card-group-label-color` | `var(--tt-gray-dark-a-800)` | src/components/tiptap-ui-primitive/card/card.scss:9 |
| `--padding` | `0.375rem` | src/components/tiptap-ui-primitive/card/card.scss:13 |
| `--border-width` | `1px` | src/components/tiptap-ui-primitive/card/card.scss:14 |
| `--tt-dropdown-menu-bg-color` | `var(--white)` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:1 |
| `--tt-dropdown-menu-text-color` | `var(--tt-gray-light-a-600)` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:2 |
| `--tt-dropdown-menu-label-color` | `var(--tt-gray-light-a-800)` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:3 |
| `--tt-dropdown-menu-bg-color` | `var(--tt-gray-dark-50)` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:8 |
| `--tt-dropdown-menu-text-color` | `var(--tt-gray-dark-a-600)` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:9 |
| `--tt-dropdown-menu-label-color` | `var(--tt-gray-dark-a-800)` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:10 |
| `--slide-x` | `0px` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:20 |
| `--slide-y` | `0px` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:21 |
| `--padding` | `0.375rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:22 |
| `--slide-y` | `-0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:39 |
| `--slide-y` | `0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:42 |
| `--slide-x` | `0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:45 |
| `--slide-x` | `-0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:48 |
| `--slide-x` | `0px` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:61 |
| `--slide-y` | `0px` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:62 |
| `--padding` | `0.375rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:63 |
| `--slide-y` | `-0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:77 |
| `--slide-y` | `0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:80 |
| `--slide-x` | `0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:83 |
| `--slide-x` | `-0.5rem` | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:86 |
| `--tt-tooltip-radius` | `var(--tooltip-radius)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:1 |
| `--tt-tooltip-padding` | `var(--space-6) var(--space-10)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:2 |
| `--tt-tooltip-bg` | `var(--tt-gray-light-900)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:3 |
| `--tt-tooltip-text` | `var(--white)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:4 |
| `--tt-kbd` | `var(--tt-gray-dark-a-400)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:5 |
| `--tt-tooltip-bg` | `var(--white)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:8 |
| `--tt-tooltip-text` | `var(--tt-gray-light-600)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:9 |
| `--tt-kbd` | `var(--tt-gray-light-a-400)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:10 |
| `--pill-w` | `120px` | src/create-menu.css:24 |
| `--pill-h` | `38px` | src/create-menu.css:31 |
| `--panel-w` | `212px` | src/create-menu.css:32 |
| `--panel-h` | `166px` | src/create-menu.css:33 |
| `--w` | `var(--pill-w)` | src/create-menu.css:34 |
| `--h` | `var(--pill-h)` | src/create-menu.css:35 |
| `--r` | `var(--crt-shut-r, 999px)` | src/create-menu.css:36 |
| `--w` | `var(--panel-w)` | src/create-menu.css:39 |
| `--h` | `var(--panel-h)` | src/create-menu.css:40 |
| `--r` | `var(--crt-r, 28px)` | src/create-menu.css:41 |
| `--slab` | `var(--surface)` | src/create-menu.css:147 |
| `--on-slab` | `var(--ink)` | src/create-menu.css:151 |
| `--panel-w` | `160px` | src/create-menu.css:297 |
| `--slab` | `var(--accent)` | src/create-menu.css:298 |
| `--on-slab` | `var(--accent-text)` | src/create-menu.css:299 |
| `--slab` | `var(--surface)` | src/create-menu.css:302 |
| `--on-slab` | `var(--ink)` | src/create-menu.css:302 |
| `--like-color` | `var(--ink)` | src/favorite-button.css:39 |
| `--tabs-dur` | `250ms` | src/folders.css:57 |
| `--tabs-ease` | `cubic-bezier(0.22,1,0.36,1)` | src/folders.css:58 |
| `--tabs-bar-bg` | `transparent` | src/motion.css:265 |
| `--tabs-pill-bg` | `var(--hover)` | src/motion.css:266 |
| `--tabs-text-muted` | `var(--muted)` | src/motion.css:267 |
| `--tabs-text-active` | `var(--ink)` | src/motion.css:268 |
| `--outline-item-height` | `14px` | src/note-outline.css:12 |
| `--outline-gap` | `4px` | src/note-outline.css:13 |
| `--outline-item-height` | `10px` | src/note-outline.css:22 |
| `--outline-gap` | `3px` | src/note-outline.css:23 |
| `--outline-item-height` | `8px` | src/note-outline.css:26 |
| `--outline-gap` | `1px` | src/note-outline.css:27 |
| `--sidebar-expanded-width` | `258px` | src/sidebar.css:11 |
| `--sidebar-rail-width` | `50px` | src/sidebar.css:11 |
| `--sidebar-width` | `var(--sidebar-expanded-width)` | src/sidebar.css:56 |
| `--sidebar-width` | `var(--sidebar-rail-width)` | src/sidebar.css:57 |
| `--sidebar-expanded-width` | `240px` | src/sidebar.css:101 |
| `--surface` | `var(--primitive-color-a685aa00)` | src/styles.css:78 |
| `--paper` | `var(--primitive-color-fef85bb3)` | src/styles.css:79 |
| `--ink` | `var(--primitive-color-f62328de)` | src/styles.css:80 |
| `--secondary` | `var(--primitive-color-4a720451)` | src/styles.css:81 |
| `--muted` | `var(--primitive-color-58070751)` | src/styles.css:82 |
| `--line` | `var(--primitive-color-79bef13b)` | src/styles.css:83 |
| `--hover` | `var(--primitive-color-79bef13b)` | src/styles.css:84 |
| `--danger` | `var(--primitive-color-f3fdaef0)` | src/styles.css:85 |
| `--surface` | `var(--primitive-color-a685aa00)` | src/styles.css:126 |
| `--paper` | `var(--primitive-color-fef85bb3)` | src/styles.css:127 |
| `--ink` | `var(--primitive-color-f62328de)` | src/styles.css:128 |
| `--secondary` | `var(--primitive-color-4a720451)` | src/styles.css:129 |
| `--muted` | `var(--primitive-color-58070751)` | src/styles.css:130 |
| `--line` | `var(--primitive-color-79bef13b)` | src/styles.css:131 |
| `--hover` | `var(--primitive-color-79bef13b)` | src/styles.css:132 |
| `--danger` | `var(--primitive-color-f3fdaef0)` | src/styles.css:133 |
| `--modal-scroll-inset` | `8px` | src/styles.css:244 |
| `--modal-scale-close` | `1` | src/styles.css:259 |
