# Inventário do design existente — antes da migração

CSS global + SCSS do editor; sem Tailwind, CSS Modules ou styled-components. Inventário estático de valores declarados: inclui overrides, tokens e cores do conteúdo editorial; não representa sozinho o estilo final computado. Localização completa no JSON adjacente.

## Cores literais (271 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `#fff` | 16 | src/profile.ts:36 · literal |
| `#171717` | 10 | src/styles.css:2 · literal |
| `#f9f9f9` | 7 | src/styles.css:1 · literal |
| `#0002` | 5 | src/feedback.css:40 · literal |
| `#383838` | 5 | src/styles.css:2 · literal |
| `#2f2f2f` | 3 | src/motion.css:199 · literal |
| `#0d0d0d` | 3 | src/styles.css:1 · literal |
| `#ff938a` | 3 | src/styles.css:2 · literal |
| `#aaa` | 3 | src/styles.css:83 · literal |
| `#0001` | 2 | src/input-focus.css:10 · literal |
| `#ffffff` | 2 | src/motion.css:131 · literal |
| `rgba(0, 0, 0, 0.06)` | 2 | src/motion.css:219 · literal |
| `rgba(0, 0, 0, 0.05)` | 2 | src/motion.css:220 · literal |
| `#e9b949` | 2 | src/note-find.css:31 · literal |
| `rgba(17, 24, 39, 0.04)` | 2 | src/styles/_variables.scss:129 · literal |
| `rgba(17, 24, 39, 0.02)` | 2 | src/styles/_variables.scss:131 · literal |
| `#666` | 2 | src/styles.css:1 · literal |
| `#777` | 2 | src/styles.css:1 · literal |
| `#e9e9e9` | 2 | src/styles.css:1 · literal |
| `#303030` | 2 | src/styles.css:2 · literal |
| `#111` | 2 | src/styles.css:2 · literal |
| `#ddd` | 2 | src/styles.css:3 · literal |
| `#0006` | 2 | src/styles.css:3 · literal |
| `#202020` | 2 | src/styles.css:69 · literal |
| `#242424` | 2 | src/styles.css:80 · literal |
| `#f5f5f5` | 2 | src/styles.css:81 · literal |
| `#e5e5e5` | 2 | src/styles.css:82 · literal |
| `rgba(0, 0, 0, 0.4)` | 2 | src/styles.css:91 · literal |
| `#fcfcfc` | 2 | src/themes.css:23 · literal |
| `#222` | 2 | src/themes.css:24 · literal |
| `#a2d3ff` | 2 | src/themes.css:25 · literal |
| `#ffdbc5` | 2 | src/themes.css:26 · literal |
| `#90e3c6` | 2 | src/themes.css:27 · literal |
| `#ffb6bf` | 2 | src/themes.css:28 · literal |
| `#febd99` | 2 | src/themes.css:29 · literal |
| `rgb(255,219,197)` | 2 | src/themes.ts:4 · literal |
| `rgb(0 0 0 / 0.1)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:25 · literal |
| `#f40051` | 1 | src/favorite-button.css:2 · literal |
| `oklch(0 0 0 / .05)` | 1 | src/folders.css:23 · literal |
| `oklch(0 0 0 / .04)` | 1 | src/folders.css:23 · literal |
| `rgba(0, 0, 0, 0.045)` | 1 | src/folders.css:158 · literal |
| `rgba(0, 0, 0, 0.075)` | 1 | src/folders.css:163 · literal |
| `rgba(0, 0, 0, 0.08)` | 1 | src/folders.css:175 · literal |
| `rgba(15, 15, 15, 0.8)` | 1 | src/motion.css:128 · literal |
| `#0f0f0f` | 1 | src/motion.css:129 · literal |
| `#f1f1f1` | 1 | src/motion.css:130 · literal |
| `rgb(0 0 0 / .1)` | 1 | src/motion.css:329 · literal |
| `#b38620` | 1 | src/note-find.css:32 · literal |
| `#fef08a` | 1 | src/SelectionMenu.tsx:88 · literal |
| `#bbf7d0` | 1 | src/SelectionMenu.tsx:89 · literal |
| `#bfdbfe` | 1 | src/SelectionMenu.tsx:90 · literal |
| `#fbcfe8` | 1 | src/SelectionMenu.tsx:91 · literal |
| `#ddd6fe` | 1 | src/SelectionMenu.tsx:92 · literal |
| `rgba(56, 56, 56, 0.04)` | 1 | src/styles/_variables.scss:19 · literal |
| `rgba(15, 22, 36, 0.05)` | 1 | src/styles/_variables.scss:20 · literal |
| `rgba(37, 39, 45, 0.1)` | 1 | src/styles/_variables.scss:21 · literal |
| `rgba(47, 50, 55, 0.2)` | 1 | src/styles/_variables.scss:22 · literal |
| `rgba(40, 44, 51, 0.42)` | 1 | src/styles/_variables.scss:23 · literal |
| `rgba(52, 55, 60, 0.64)` | 1 | src/styles/_variables.scss:24 · literal |
| `rgba(36, 39, 46, 0.78)` | 1 | src/styles/_variables.scss:25 · literal |
| `rgba(35, 37, 42, 0.87)` | 1 | src/styles/_variables.scss:26 · literal |
| `rgba(30, 32, 36, 0.95)` | 1 | src/styles/_variables.scss:27 · literal |
| `rgba(29, 30, 32, 0.98)` | 1 | src/styles/_variables.scss:28 · literal |
| `rgba(250, 250, 250, 1)` | 1 | src/styles/_variables.scss:31 · literal |
| `rgba(244, 244, 245, 1)` | 1 | src/styles/_variables.scss:32 · literal |
| `rgba(234, 234, 235, 1)` | 1 | src/styles/_variables.scss:33 · literal |
| `rgba(213, 214, 215, 1)` | 1 | src/styles/_variables.scss:34 · literal |
| `rgba(166, 167, 171, 1)` | 1 | src/styles/_variables.scss:35 · literal |
| `rgba(125, 127, 130, 1)` | 1 | src/styles/_variables.scss:36 · literal |
| `rgba(83, 86, 90, 1)` | 1 | src/styles/_variables.scss:37 · literal |
| `rgba(64, 65, 69, 1)` | 1 | src/styles/_variables.scss:38 · literal |
| `rgba(44, 45, 48, 1)` | 1 | src/styles/_variables.scss:39 · literal |
| `rgba(34, 35, 37, 1)` | 1 | src/styles/_variables.scss:40 · literal |
| `rgba(232, 232, 253, 0.05)` | 1 | src/styles/_variables.scss:43 · literal |
| `rgba(231, 231, 243, 0.07)` | 1 | src/styles/_variables.scss:44 · literal |
| `rgba(238, 238, 246, 0.11)` | 1 | src/styles/_variables.scss:45 · literal |
| `rgba(239, 239, 245, 0.22)` | 1 | src/styles/_variables.scss:46 · literal |
| `rgba(244, 244, 255, 0.37)` | 1 | src/styles/_variables.scss:47 · literal |
| `rgba(236, 238, 253, 0.5)` | 1 | src/styles/_variables.scss:48 · literal |
| `rgba(247, 247, 253, 0.64)` | 1 | src/styles/_variables.scss:49 · literal |
| `rgba(251, 251, 254, 0.75)` | 1 | src/styles/_variables.scss:50 · literal |
| `rgba(253, 253, 253, 0.88)` | 1 | src/styles/_variables.scss:51 · literal |
| `rgba(255, 255, 255, 0.96)` | 1 | src/styles/_variables.scss:52 · literal |
| `rgba(25, 25, 26, 1)` | 1 | src/styles/_variables.scss:55 · literal |
| `rgba(32, 32, 34, 1)` | 1 | src/styles/_variables.scss:56 · literal |
| `rgba(45, 45, 47, 1)` | 1 | src/styles/_variables.scss:57 · literal |
| `rgba(70, 70, 73, 1)` | 1 | src/styles/_variables.scss:58 · literal |
| `rgba(99, 99, 105, 1)` | 1 | src/styles/_variables.scss:59 · literal |
| `rgba(124, 124, 131, 1)` | 1 | src/styles/_variables.scss:60 · literal |
| `rgba(163, 163, 168, 1)` | 1 | src/styles/_variables.scss:61 · literal |
| `rgba(192, 192, 195, 1)` | 1 | src/styles/_variables.scss:62 · literal |
| `rgba(224, 224, 225, 1)` | 1 | src/styles/_variables.scss:63 · literal |
| `rgba(245, 245, 245, 1)` | 1 | src/styles/_variables.scss:64 · literal |
| `rgba(239, 238, 255, 1)` | 1 | src/styles/_variables.scss:67 · literal |
| `rgba(222, 219, 255, 1)` | 1 | src/styles/_variables.scss:68 · literal |
| `rgba(195, 189, 255, 1)` | 1 | src/styles/_variables.scss:69 · literal |
| `rgba(157, 138, 255, 1)` | 1 | src/styles/_variables.scss:70 · literal |
| `rgba(122, 82, 255, 1)` | 1 | src/styles/_variables.scss:71 · literal |
| `rgba(98, 41, 255, 1)` | 1 | src/styles/_variables.scss:72 · literal |
| `rgba(84, 0, 229, 1)` | 1 | src/styles/_variables.scss:73 · literal |
| `rgba(75, 0, 204, 1)` | 1 | src/styles/_variables.scss:74 · literal |
| `rgba(56, 0, 153, 1)` | 1 | src/styles/_variables.scss:75 · literal |
| `rgba(43, 25, 102, 1)` | 1 | src/styles/_variables.scss:76 · literal |
| `hsla(257, 100%, 9%, 1)` | 1 | src/styles/_variables.scss:77 · literal |
| `hsla(129, 100%, 97%, 1)` | 1 | src/styles/_variables.scss:80 · literal |
| `hsla(129, 100%, 92%, 1)` | 1 | src/styles/_variables.scss:81 · literal |
| `hsla(131, 100%, 86%, 1)` | 1 | src/styles/_variables.scss:82 · literal |
| `hsla(133, 98%, 78%, 1)` | 1 | src/styles/_variables.scss:83 · literal |
| `hsla(137, 99%, 70%, 1)` | 1 | src/styles/_variables.scss:84 · literal |
| `hsla(147, 99%, 50%, 1)` | 1 | src/styles/_variables.scss:85 · literal |
| `hsla(147, 97%, 41%, 1)` | 1 | src/styles/_variables.scss:86 · literal |
| `hsla(146, 98%, 32%, 1)` | 1 | src/styles/_variables.scss:87 · literal |
| `hsla(146, 100%, 24%, 1)` | 1 | src/styles/_variables.scss:88 · literal |
| `hsla(144, 100%, 16%, 1)` | 1 | src/styles/_variables.scss:89 · literal |
| `hsla(140, 100%, 9%, 1)` | 1 | src/styles/_variables.scss:90 · literal |
| `hsla(50, 100%, 97%, 1)` | 1 | src/styles/_variables.scss:93 · literal |
| `hsla(50, 100%, 91%, 1)` | 1 | src/styles/_variables.scss:94 · literal |
| `hsla(50, 100%, 84%, 1)` | 1 | src/styles/_variables.scss:95 · literal |
| `hsla(50, 100%, 77%, 1)` | 1 | src/styles/_variables.scss:96 · literal |
| `hsla(50, 100%, 68%, 1)` | 1 | src/styles/_variables.scss:97 · literal |
| `hsla(52, 100%, 50%, 1)` | 1 | src/styles/_variables.scss:98 · literal |
| `hsla(52, 100%, 41%, 1)` | 1 | src/styles/_variables.scss:99 · literal |
| `hsla(52, 100%, 32%, 1)` | 1 | src/styles/_variables.scss:100 · literal |
| `hsla(52, 100%, 24%, 1)` | 1 | src/styles/_variables.scss:101 · literal |
| `hsla(51, 100%, 16%, 1)` | 1 | src/styles/_variables.scss:102 · literal |
| `hsla(50, 100%, 9%, 1)` | 1 | src/styles/_variables.scss:103 · literal |
| `hsla(11, 100%, 96%, 1)` | 1 | src/styles/_variables.scss:106 · literal |
| `hsla(11, 100%, 88%, 1)` | 1 | src/styles/_variables.scss:107 · literal |
| `hsla(10, 100%, 80%, 1)` | 1 | src/styles/_variables.scss:108 · literal |
| `hsla(9, 100%, 73%, 1)` | 1 | src/styles/_variables.scss:109 · literal |
| `hsla(7, 100%, 64%, 1)` | 1 | src/styles/_variables.scss:110 · literal |
| `hsla(7, 100%, 54%, 1)` | 1 | src/styles/_variables.scss:111 · literal |
| `hsla(7, 100%, 41%, 1)` | 1 | src/styles/_variables.scss:112 · literal |
| `hsla(5, 100%, 32%, 1)` | 1 | src/styles/_variables.scss:113 · literal |
| `hsla(4, 100%, 24%, 1)` | 1 | src/styles/_variables.scss:114 · literal |
| `hsla(3, 100%, 16%, 1)` | 1 | src/styles/_variables.scss:115 · literal |
| `hsla(1, 100%, 9%, 1)` | 1 | src/styles/_variables.scss:116 · literal |
| `rgba(255, 255, 255, 1)` | 1 | src/styles/_variables.scss:119 · literal |
| `rgba(14, 14, 17, 1)` | 1 | src/styles/_variables.scss:120 · literal |
| `rgba(255, 255, 255, 0)` | 1 | src/styles/_variables.scss:121 · literal |
| `rgba(157, 138, 255, 0.2)` | 1 | src/styles/_variables.scss:188 · literal |
| `rgba(122, 82, 255, 0.2)` | 1 | src/styles/_variables.scss:201 · literal |
| `rgba(0, 0, 0, 0.5)` | 1 | src/styles/_variables.scss:206 · literal |
| `rgba(0, 0, 0, 0.24)` | 1 | src/styles/_variables.scss:206 · literal |
| `rgba(0, 0, 0, 0.22)` | 1 | src/styles/_variables.scss:207 · literal |
| `rgba(0, 0, 0, 0.12)` | 1 | src/styles/_variables.scss:207 · literal |
| `hsl(45, 2%, 46%)` | 1 | src/styles/_variables.scss:212 · literal |
| `hsl(19, 31%, 47%)` | 1 | src/styles/_variables.scss:213 · literal |
| `hsl(30, 89%, 45%)` | 1 | src/styles/_variables.scss:214 · literal |
| `hsl(38, 62%, 49%)` | 1 | src/styles/_variables.scss:215 · literal |
| `hsl(148, 32%, 39%)` | 1 | src/styles/_variables.scss:216 · literal |
| `hsl(202, 54%, 43%)` | 1 | src/styles/_variables.scss:217 · literal |
| `hsl(274, 32%, 54%)` | 1 | src/styles/_variables.scss:218 · literal |
| `hsl(328, 49%, 53%)` | 1 | src/styles/_variables.scss:219 · literal |
| `hsl(2, 62%, 55%)` | 1 | src/styles/_variables.scss:220 · literal |
| `hsla(39, 26%, 26%, 0.15)` | 1 | src/styles/_variables.scss:222 · literal |
| `hsla(18, 43%, 69%, 0.35)` | 1 | src/styles/_variables.scss:223 · literal |
| `hsla(24, 73%, 55%, 0.27)` | 1 | src/styles/_variables.scss:224 · literal |
| `hsla(44, 82%, 59%, 0.39)` | 1 | src/styles/_variables.scss:225 · literal |
| `hsla(126, 29%, 60%, 0.27)` | 1 | src/styles/_variables.scss:226 · literal |
| `hsla(202, 54%, 59%, 0.27)` | 1 | src/styles/_variables.scss:227 · literal |
| `hsla(274, 37%, 64%, 0.27)` | 1 | src/styles/_variables.scss:228 · literal |
| `hsla(331, 60%, 71%, 0.27)` | 1 | src/styles/_variables.scss:229 · literal |
| `hsla(8, 79%, 79%, 0.4)` | 1 | src/styles/_variables.scss:230 · literal |
| `hsl(0, 0%, 61%)` | 1 | src/styles/_variables.scss:234 · literal |
| `hsl(18, 35%, 58%)` | 1 | src/styles/_variables.scss:235 · literal |
| `hsl(25, 53%, 53%)` | 1 | src/styles/_variables.scss:236 · literal |
| `hsl(36, 54%, 55%)` | 1 | src/styles/_variables.scss:237 · literal |
| `hsl(145, 32%, 47%)` | 1 | src/styles/_variables.scss:238 · literal |
| `hsl(202, 64%, 52%)` | 1 | src/styles/_variables.scss:239 · literal |
| `hsl(270, 55%, 62%)` | 1 | src/styles/_variables.scss:240 · literal |
| `hsl(329, 57%, 58%)` | 1 | src/styles/_variables.scss:241 · literal |
| `hsl(1, 69%, 60%)` | 1 | src/styles/_variables.scss:242 · literal |
| `hsla(0, 0%, 100%, 0.09)` | 1 | src/styles/_variables.scss:244 · literal |
| `hsla(17, 45%, 50%, 0.25)` | 1 | src/styles/_variables.scss:245 · literal |
| `hsla(27, 82%, 53%, 0.2)` | 1 | src/styles/_variables.scss:246 · literal |
| `hsla(35, 49%, 47%, 0.2)` | 1 | src/styles/_variables.scss:247 · literal |
| `hsla(151, 55%, 39%, 0.2)` | 1 | src/styles/_variables.scss:248 · literal |
| `hsla(202, 54%, 43%, 0.2)` | 1 | src/styles/_variables.scss:249 · literal |
| `hsla(271, 56%, 60%, 0.18)` | 1 | src/styles/_variables.scss:250 · literal |
| `hsla(331, 67%, 58%, 0.22)` | 1 | src/styles/_variables.scss:251 · literal |
| `hsla(0, 67%, 60%, 0.25)` | 1 | src/styles/_variables.scss:252 · literal |
| `#fef9c3` | 1 | src/styles/_variables.scss:257 · literal |
| `#dcfce7` | 1 | src/styles/_variables.scss:258 · literal |
| `#e0f2fe` | 1 | src/styles/_variables.scss:259 · literal |
| `#f3e8ff` | 1 | src/styles/_variables.scss:260 · literal |
| `#ffe4e6` | 1 | src/styles/_variables.scss:261 · literal |
| `rgb(248, 248, 247)` | 1 | src/styles/_variables.scss:262 · literal |
| `rgb(244, 238, 238)` | 1 | src/styles/_variables.scss:263 · literal |
| `rgb(251, 236, 221)` | 1 | src/styles/_variables.scss:264 · literal |
| `rgb(252, 241, 246)` | 1 | src/styles/_variables.scss:265 · literal |
| `#fbe604` | 1 | src/styles/_variables.scss:267 · literal |
| `#c7fad8` | 1 | src/styles/_variables.scss:268 · literal |
| `#ceeafd` | 1 | src/styles/_variables.scss:269 · literal |
| `#e4ccff` | 1 | src/styles/_variables.scss:270 · literal |
| `#ffccd0` | 1 | src/styles/_variables.scss:271 · literal |
| `rgba(84, 72, 49, 0.15)` | 1 | src/styles/_variables.scss:272 · literal |
| `rgba(210, 162, 141, 0.35)` | 1 | src/styles/_variables.scss:273 · literal |
| `rgba(224, 124, 57, 0.27)` | 1 | src/styles/_variables.scss:274 · literal |
| `rgba(225, 136, 179, 0.27)` | 1 | src/styles/_variables.scss:275 · literal |
| `#6b6524` | 1 | src/styles/_variables.scss:279 · literal |
| `#509568` | 1 | src/styles/_variables.scss:280 · literal |
| `#6e92aa` | 1 | src/styles/_variables.scss:281 · literal |
| `#583e74` | 1 | src/styles/_variables.scss:282 · literal |
| `#743e42` | 1 | src/styles/_variables.scss:283 · literal |
| `rgb(47, 47, 47)` | 1 | src/styles/_variables.scss:284 · literal |
| `rgb(74, 50, 40)` | 1 | src/styles/_variables.scss:285 · literal |
| `rgb(92, 59, 35)` | 1 | src/styles/_variables.scss:286 · literal |
| `rgb(78, 44, 60)` | 1 | src/styles/_variables.scss:287 · literal |
| `#58531e` | 1 | src/styles/_variables.scss:289 · literal |
| `#47855d` | 1 | src/styles/_variables.scss:290 · literal |
| `#5e86a1` | 1 | src/styles/_variables.scss:291 · literal |
| `#4c3564` | 1 | src/styles/_variables.scss:292 · literal |
| `#643539` | 1 | src/styles/_variables.scss:293 · literal |
| `rgba(255, 255, 255, 0.094)` | 1 | src/styles/_variables.scss:294 · literal |
| `rgba(184, 101, 69, 0.25)` | 1 | src/styles/_variables.scss:295 · literal |
| `rgba(233, 126, 37, 0.2)` | 1 | src/styles/_variables.scss:296 · literal |
| `rgba(220, 76, 145, 0.22)` | 1 | src/styles/_variables.scss:297 · literal |
| `#b42318` | 1 | src/styles.css:1 · literal |
| `rgba(229,231,235,.5)` | 1 | src/styles.css:1 · literal |
| `#212121` | 1 | src/styles.css:2 · literal |
| `#ececec` | 1 | src/styles.css:2 · literal |
| `#b4b4b4` | 1 | src/styles.css:2 · literal |
| `#a0a0a0` | 1 | src/styles.css:2 · literal |
| `#f4f4f4` | 1 | src/styles.css:2 · literal |
| `rgba(0,0,0,.5)` | 1 | src/styles.css:2 · literal |
| `rgba(0,0,0,0.35)` | 1 | src/styles.css:43 · literal |
| `rgba(0,0,0,0.2)` | 1 | src/styles.css:43 · literal |
| `rgba(0, 0, 0, 0.25)` | 1 | src/styles.css:137 · literal |
| `#e32136` | 1 | src/styles.css:186 · literal |
| `#c9192c` | 1 | src/styles.css:186 · literal |
| `rgba(0,0,0,.12)` | 1 | src/styles.css:267 · literal |
| `rgba(0,0,0,.18)` | 1 | src/styles.css:270 · literal |
| `rgba(0,0,0,.08)` | 1 | src/styles.css:270 · literal |
| `rgba(255,255,255,.12)` | 1 | src/styles.css:272 · literal |
| `rgba(0,0,0,.48)` | 1 | src/styles.css:272 · literal |
| `rgba(0,0,0,.28)` | 1 | src/styles.css:272 · literal |
| `#f6f6f6` | 1 | src/styles.css:326 · literal |
| `rgba(0,0,0,.05)` | 1 | src/themes.css:9 · literal |
| `#ecf3f8` | 1 | src/themes.css:25 · literal |
| `#c5eafe` | 1 | src/themes.css:25 · literal |
| `#24669a` | 1 | src/themes.css:25 · literal |
| `#eaddff` | 1 | src/themes.css:26 · literal |
| `#f4dcdf` | 1 | src/themes.css:26 · literal |
| `#7353a6` | 1 | src/themes.css:26 · literal |
| `#ecf4f1` | 1 | src/themes.css:27 · literal |
| `#c4f1e0` | 1 | src/themes.css:27 · literal |
| `#25745b` | 1 | src/themes.css:27 · literal |
| `#fcf2f3` | 1 | src/themes.css:28 · literal |
| `#ffd9df` | 1 | src/themes.css:28 · literal |
| `#a44760` | 1 | src/themes.css:28 · literal |
| `#f8f0ec` | 1 | src/themes.css:29 · literal |
| `#995631` | 1 | src/themes.css:29 · literal |
| `#404040` | 1 | src/themes.css:34 · literal |
| `#555` | 1 | src/themes.css:35 · literal |
| `#ccc` | 1 | src/themes.css:45 · literal |
| `#d8bfff` | 1 | src/themes.css:53 · literal |
| `rgba(0,0,0,.14)` | 1 | src/themes.css:81 · literal |
| `rgb(236,243,248)` | 1 | src/themes.ts:3 · literal |
| `rgb(197,234,254)` | 1 | src/themes.ts:3 · literal |
| `rgb(162,211,255)` | 1 | src/themes.ts:3 · literal |
| `rgb(234,221,255)` | 1 | src/themes.ts:4 · literal |
| `rgb(236,244,241)` | 1 | src/themes.ts:5 · literal |
| `rgb(196,241,224)` | 1 | src/themes.ts:5 · literal |
| `rgb(144,227,198)` | 1 | src/themes.ts:5 · literal |
| `rgb(252,242,243)` | 1 | src/themes.ts:6 · literal |
| `rgb(255,217,223)` | 1 | src/themes.ts:6 · literal |
| `rgb(255,182,191)` | 1 | src/themes.ts:6 · literal |
| `rgb(248,240,236)` | 1 | src/themes.ts:7 · literal |
| `rgb(254,189,153)` | 1 | src/themes.ts:7 · literal |
| `#0007` | 1 | src/user-profile.css:6 · literal |

## Tipografia (60 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `13px` | 40 | src/cloud-storage.css:12 · font-size |
| `12px` | 33 | src/buttons.css:13 · font-size |
| `11px` | 24 | src/cloud-storage.css:74 · font-size |
| `14px` | 18 | src/cloud-storage.css:11 · font-size |
| `600` | 17 | src/cloud-storage.css:17 · font-weight |
| `500` | 13 | src/cloud-storage.css:11 · font-weight |
| `20px` | 8 | src/cloud-storage.css:69 · line-height |
| `inherit` | 8 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:58 · font |
| `10px` | 8 | src/styles.css:3 · font-size |
| `15px` | 7 | src/cloud-storage.css:17 · font-size |
| `1.5` | 7 | src/cloud-storage.css:70 · line-height |
| `18px` | 6 | src/buttons.css:14 · line-height |
| `0.75rem` | 5 | src/components/tiptap-ui-primitive/badge/badge.scss:21 · font-size |
| `16px` | 4 | src/cloud-storage.css:22 · font-size |
| `1.4` | 4 | src/delete-note-dialog.css:23 · line-height |
| `1.6` | 4 | src/delete-note-dialog.css:24 · line-height |
| `1.35` | 4 | src/folders.css:230 · line-height |
| `400` | 3 | src/folders.css:283 · font-weight |
| `normal` | 3 | src/components/tiptap-ui-primitive/card/card.scss:67 · line-height |
| `1.3` | 3 | src/folders.css:240 · line-height |
| `1.7` | 2 | src/cloud-storage.css:55 · line-height |
| `"salt" on,
    "cv01" on` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:3 · font-feature-settings |
| `1.15` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:6 · line-height |
| `1.2` | 2 | src/components/tiptap-ui-primitive/button/button.scss:50 · line-height |
| `tabular-nums` | 2 | src/note-find.css:20 · font-variant-numeric |
| `1.65` | 2 | src/styles.css:3 · line-height |
| `28px` | 2 | src/styles.css:3 · font-size |
| `-.3px` | 2 | src/styles.css:3 · letter-spacing |
| `25px` | 2 | src/styles.css:5 · font-size |
| `26px` | 2 | src/styles.css:6 · font-size |
| `24px` | 2 | src/styles.css:7 · font-size |
| `650` | 1 | src/styles.css:320 · font-weight |
| `700` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:2 · font-weight |
| `0.625rem` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:1 · font-size |
| `0.875rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:1 · font-size |
| `0.9375rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:41 · font-size |
| `1.5rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:62 · line-height |
| `1rem` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:21 · line-height |
| `ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial,
      "Noto Sans",
      sans-serif` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:31 · font-family |
| `13.5px` | 1 | src/create-menu.css:170 · font-size |
| `0.6px` | 1 | src/folders.css:125 · letter-spacing |
| `12.5px` | 1 | src/folders.css:303 · font-size |
| `"DM Sans",Arial,Helvetica,sans-serif` | 1 | src/styles.css:1 · font-family |
| `auto` | 1 | src/styles.css:1 · font-optical-sizing |
| `none` | 1 | src/styles.css:1 · font-synthesis |
| `-.5px` | 1 | src/styles.css:3 · letter-spacing |
| `30px` | 1 | src/styles.css:3 · font-size |
| `-.8px` | 1 | src/styles.css:3 · letter-spacing |
| `ui-monospace,SFMono-Regular,Consolas,monospace` | 1 | src/styles.css:3 · font-family |
| `1.9` | 1 | src/styles.css:3 · line-height |
| `21px` | 1 | src/styles.css:3 · font-size |
| `-.7px` | 1 | src/styles.css:3 · letter-spacing |
| `27px` | 1 | src/styles.css:4 · font-size |
| `-.6px` | 1 | src/styles.css:6 · letter-spacing |
| `23px` | 1 | src/styles.css:7 · font-size |
| `17px` | 1 | src/styles.css:74 · font-size |
| `25pt` | 1 | src/styles.css:320 · font-size |
| `-.5pt` | 1 | src/styles.css:320 · letter-spacing |
| `11pt` | 1 | src/styles.css:322 · font-size |
| `22px` | 1 | src/user-profile.css:9 · line-height |

## Spacing (151 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `0` | 51 | src/cloud-storage.css:5 · padding |
| `8px` | 33 | src/buttons.css:25 · padding |
| `12px` | 28 | src/cloud-storage.css:21 · gap |
| `4px` | 19 | src/buttons.css:45 · padding |
| `10px` | 19 | src/cloud-storage.css:12 · gap |
| `6px` | 18 | src/buttons.css:7 · gap |
| `2px` | 18 | src/cloud-storage.css:56 · padding-left |
| `16px` | 15 | src/cloud-storage.css:59 · padding |
| `5px` | 13 | src/folders.css:33 · gap |
| `24px` | 12 | src/cloud-storage.css:19 · padding-top |
| `20px` | 11 | src/cloud-storage.css:21 · margin-bottom |
| `3px` | 10 | src/folders.css:239 · margin-top |
| `auto` | 9 | src/cloud-storage.css:63 · margin-left |
| `7px` | 8 | src/cloud-storage.css:27 · gap |
| `0.25rem` | 8 | src/components/tiptap-ui-primitive/badge/badge-group.scss:4 · gap |
| `9px` | 8 | src/styles.css:3 · gap |
| `18px` | 7 | src/sidebar.css:95 · margin-top |
| `0.375rem` | 5 | src/components/tiptap-ui-primitive/badge/badge.scss:24 · padding |
| `14px` | 5 | src/styles.css:3 · margin-bottom |
| `4px 8px` | 4 | src/buttons.css:9 · padding |
| `4px 0` | 4 | src/cloud-storage.css:35 · padding |
| `22px` | 4 | src/folders.css:289 · margin-bottom |
| `0!important` | 4 | src/styles.css:316 · margin |
| `10px 16px` | 3 | src/cloud-storage.css:27 · padding |
| `1px` | 3 | src/cloud-storage.css:71 · margin-top |
| `0.125rem` | 3 | src/components/tiptap-ui-primitive/badge/badge.scss:32 · padding |
| `10px 12px` | 3 | src/note-actions.css:17 · padding |
| `28px` | 3 | src/styles.css:3 · margin-top |
| `9px 12px` | 2 | src/cloud-storage.css:12 · padding |
| `0 0 8px` | 2 | src/cloud-storage.css:60 · margin |
| `6px 10px` | 2 | src/cloud-storage.css:91 · padding |
| `0 0.125rem` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:38 · padding |
| `0.5rem` | 2 | src/components/tiptap-ui-primitive/button/button.scss:10 · padding |
| `0.75rem 0.5rem 0.25rem` | 2 | src/components/tiptap-ui-primitive/card/card.scss:66 · padding |
| `var(--tt-tooltip-padding)` | 2 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:19 · padding |
| `0 14px` | 2 | src/create-menu.css:234 · padding |
| `36px` | 2 | src/folders.css:53 · margin-bottom |
| `0 5px` | 2 | src/folders.css:276 · margin |
| `8px 12px` | 2 | src/motion.css:212 · padding |
| `9px 8px 0` | 2 | src/sidebar.css:22 · padding |
| `3px 0` | 2 | src/sidebar.css:33 · padding |
| `24px 0` | 2 | src/styles.css:3 · padding |
| `24px 0 12px` | 2 | src/styles.css:3 · margin |
| `15px` | 2 | src/styles.css:3 · gap |
| `0 3px` | 2 | src/styles.css:3 · margin |
| `var(--modal-scroll-inset)` | 2 | src/styles.css:286 · margin-right |
| `24px 12px` | 1 | src/cloud-storage.css:10 · padding |
| `0 12px 24px` | 1 | src/cloud-storage.css:11 · margin |
| `56px var(--modal-scroll-inset) var(--modal-scroll-inset) 0` | 1 | src/cloud-storage.css:14 · padding |
| `0 16px 16px 24px` | 1 | src/cloud-storage.css:16 · padding |
| `0 0 16px` | 1 | src/cloud-storage.css:17 · margin |
| `10px 0` | 1 | src/cloud-storage.css:24 · padding |
| `12px 0 24px` | 1 | src/cloud-storage.css:55 · margin |
| `12px 0` | 1 | src/cloud-storage.css:61 · margin |
| `2px 6px` | 1 | src/cloud-storage.css:74 · padding |
| `20px 8px` | 1 | src/cloud-storage.css:79 · padding |
| `0 8px 12px 16px` | 1 | src/cloud-storage.css:81 · padding |
| `31px` | 1 | src/cloud-storage.css:84 · margin-left |
| `16px 52px 16px 16px` | 1 | src/cloud-storage.css:88 · padding |
| `0.625rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:44 · padding |
| `0.3125rem` | 1 | src/components/tiptap-ui-primitive/button/button.scss:53 · padding |
| `1.75rem` | 1 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:107 · padding-left |
| `0 0.375rem` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:54 · padding |
| `11px 10px` | 1 | src/create-menu.css:206 · padding |
| `max(0px,calc((var(--panel-w) - var(--pill-w)) / 2 - 8px))` | 1 | src/create-menu.css:319 · margin-right |
| `20px 24px` | 1 | src/delete-note-dialog.css:25 · padding |
| `9px 14px` | 1 | src/delete-note-dialog.css:26 · padding |
| `12px 12px 12px 16px` | 1 | src/feedback.css:40 · padding |
| `-1px` | 1 | src/feedback.css:50 · margin |
| `10px 0 14px` | 1 | src/folders.css:9 · margin |
| `0 0 5px` | 1 | src/folders.css:17 · padding |
| `-20px 0 32px` | 1 | src/folders.css:63 · margin |
| `9px 16px` | 1 | src/folders.css:73 · padding |
| `10px 1px 0` | 1 | src/folders.css:223 · padding |
| `9px 14px 9px 18px` | 1 | src/folders.css:246 · padding |
| `4px 12px` | 1 | src/motion.css:152 · padding |
| `6px 8px` | 1 | src/note-actions.css:39 · margin |
| `8px 10px` | 1 | src/note-actions.css:40 · padding |
| `10px 8px` | 1 | src/note-actions.css:45 · padding |
| `6px 12px` | 1 | src/note-find.css:26 · padding |
| `48px` | 1 | src/note-find.css:35 · padding-top |
| `128px` | 1 | src/note-find.css:36 · padding-top |
| `var(--outline-gap)` | 1 | src/note-outline.css:16 · gap |
| `6px 0 8px` | 1 | src/sidebar.css:30 · padding |
| `34px` | 1 | src/sidebar.css:56 · padding-left |
| `var(--sidebar-width)` | 1 | src/sidebar.css:63 · margin-left |
| `9px 0 16px` | 1 | src/sidebar.css:81 · padding |
| `0 4px 0 8px` | 1 | src/styles.css:3 · padding |
| `9px 8px` | 1 | src/styles.css:3 · padding |
| `23px 8px 8px` | 1 | src/styles.css:3 · margin |
| `26px` | 1 | src/styles.css:3 · margin-top |
| `9px 6px` | 1 | src/styles.css:3 · padding |
| `258px` | 1 | src/styles.css:3 · margin-left |
| `0 28px` | 1 | src/styles.css:3 · padding |
| `0 32px 30px` | 1 | src/styles.css:3 · padding |
| `5px auto 0` | 1 | src/styles.css:3 · margin |
| `7px 0` | 1 | src/styles.css:3 · padding |
| `38px auto 0` | 1 | src/styles.css:3 · margin |
| `0 0 18px` | 1 | src/styles.css:3 · padding |
| `14px 0 27px` | 1 | src/styles.css:3 · margin |
| `4px 7px` | 1 | src/styles.css:3 · padding |
| `5px 0` | 1 | src/styles.css:3 · padding |
| `0 11px` | 1 | src/styles.css:3 · padding |
| `25px 0` | 1 | src/styles.css:3 · padding |
| `20px 0 10px` | 1 | src/styles.css:3 · margin |
| `25px` | 1 | src/styles.css:3 · padding-left |
| `0 0 14px` | 1 | src/styles.css:3 · margin |
| `2px 0` | 1 | src/styles.css:3 · margin |
| `16px 0` | 1 | src/styles.css:3 · margin |
| `0 0 0 19px` | 1 | src/styles.css:3 · padding |
| `20px 0` | 1 | src/styles.css:3 · padding |
| `0 4px` | 1 | src/styles.css:3 · margin |
| `20px auto` | 1 | src/styles.css:3 · margin |
| `14px 16px` | 1 | src/styles.css:3 · padding |
| `0 auto` | 1 | src/styles.css:3 · margin |
| `54px 48px 30px` | 1 | src/styles.css:3 · padding |
| `40px` | 1 | src/styles.css:3 · margin-bottom |
| `19px 8px` | 1 | src/styles.css:3 · padding |
| `13px` | 1 | src/styles.css:3 · gap |
| `65px 15px` | 1 | src/styles.css:3 · padding |
| `12px 0 22px` | 1 | src/styles.css:3 · margin |
| `22px 0 9px` | 1 | src/styles.css:3 · margin |
| `13px 8px` | 1 | src/styles.css:3 · padding |
| `22px 0` | 1 | src/styles.css:3 · padding |
| `13px 20px` | 1 | src/styles.css:3 · padding |
| `40px 28px` | 1 | src/styles.css:4 · padding |
| `240px` | 1 | src/styles.css:5 · margin-left |
| `30px 24px` | 1 | src/styles.css:5 · padding |
| `0 12px` | 1 | src/styles.css:6 · padding |
| `0 21px 20px` | 1 | src/styles.css:6 · padding |
| `27px` | 1 | src/styles.css:6 · margin-top |
| `13px 0 22px` | 1 | src/styles.css:6 · margin |
| `32px 20px` | 1 | src/styles.css:6 · padding |
| `32px` | 1 | src/styles.css:6 · margin-bottom |
| `17px 2px` | 1 | src/styles.css:6 · padding |
| `17px` | 1 | src/styles.css:7 · padding-inline |
| `-9px` | 1 | src/styles.css:9 · margin-top |
| `2px 4px` | 1 | src/styles.css:62 · padding |
| `1px 0` | 1 | src/styles.css:72 · padding |
| `16px 0 8px` | 1 | src/styles.css:73 · margin |
| `5px 8px` | 1 | src/styles.css:141 · padding |
| `38px` | 1 | src/styles.css:173 · padding-right |
| `16px 0 22px` | 1 | src/styles.css:190 · margin |
| `0 18px 0 24px` | 1 | src/styles.css:280 · padding |
| `12px 14px 18px` | 1 | src/styles.css:286 · padding |
| `6px 12px 8px` | 1 | src/styles.css:287 · padding |
| `58px 24px 64px` | 1 | src/styles.css:298 · padding |
| `20mm 18mm 22mm` | 1 | src/styles.css:312 · margin |
| `0 0 24px` | 1 | src/styles.css:320 · margin |
| `20px 0 24px` | 1 | src/themes.css:75 · padding |
| `14px 8px` | 1 | src/themes.css:83 · gap |

## Raios (47 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `12px` | 16 | src/cloud-storage.css:24 · border-radius |
| `50%` | 11 | src/cloud-storage.css:30 · border-radius |
| `var(--button-radius)` | 9 | src/buttons.css:11 · border-radius |
| `24px` | 9 | src/buttons.css:25 · border-radius |
| `16px` | 9 | src/buttons.css:26 · border-radius |
| `6px` | 8 | src/note-find.css:21 · border-radius |
| `8px` | 6 | src/cloud-storage.css:12 · border-radius |
| `999px` | 5 | src/components/tiptap-ui-primitive/button/button.scss:240 · border-radius |
| `10px` | 3 | src/buttons.css:67 · border-radius |
| `calc(var(--padding) + var(--tt-radius-lg))` | 3 | src/components/tiptap-ui-primitive/card/card.scss:15 · border-radius |
| `2px` | 3 | src/folders.css:40 · border-radius |
| `48px` | 3 | src/motion.css:143 · border-radius |
| `0` | 2 | src/feedback.css:35 · border-radius |
| `4px` | 2 | src/cloud-storage.css:74 · border-radius |
| `var(--tt-radius-lg, 0.75rem)` | 2 | src/components/tiptap-ui-primitive/button/button.scss:15 · border-radius |
| `var(--tt-radius-md, 0.5rem)` | 2 | src/components/tiptap-ui-primitive/button/button.scss:54 · border-radius |
| `0.25rem` | 2 | src/components/tiptap-ui-primitive/button/button.scss:203 · border-radius |
| `var(--tt-tooltip-radius)` | 2 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:17 · border-radius |
| `var(--confirmation-radius)` | 2 | src/delete-note-dialog.css:4 · border-radius |
| `7px` | 2 | src/folders.css:19 · border-radius |
| `22px` | 2 | src/folders.css:247 · border-radius |
| `9px` | 2 | src/styles.css:3 · border-radius |
| `18px` | 2 | src/styles.css:3 · border-radius |
| `9999px` | 1 | src/buttons.css:1 · --button-radius |
| `12px !important` | 1 | src/buttons.css:92 · border-radius |
| `9px !important` | 1 | src/buttons.css:96 · border-radius |
| `var(--tt-radius-sm, 0.375rem)` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:14 · border-radius |
| `var(--tt-radius-md, 0.375rem)` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:25 · border-radius |
| `var(--tt-radius-xs, 0.25rem)` | 1 | src/components/tiptap-ui-primitive/badge/badge.scss:33 · border-radius |
| `var(--r)` | 1 | src/create-menu.css:88 · border-radius |
| `var(--crt-row-r, 999px)` | 1 | src/create-menu.css:237 · border-radius |
| `inherit` | 1 | src/create-menu.css:262 · border-radius |
| `var(--crt-row-r)` | 1 | src/create-menu.css:315 · border-radius |
| `15px` | 1 | src/folders.css:152 · border-radius |
| `14px` | 1 | src/folders.css:296 · border-radius |
| `var(--radius)` | 1 | src/note-find.css:8 · border-radius |
| `var(--button-radius, 8px)` | 1 | src/note-find.css:26 · border-radius |
| `0.125rem` | 1 | src/styles/_variables.scss:132 · --tt-radius-xxs |
| `0.375rem` | 1 | src/styles/_variables.scss:139 · --tt-radius-sm |
| `0.5rem` | 1 | src/styles/_variables.scss:140 · --tt-radius-md |
| `0.75rem` | 1 | src/styles/_variables.scss:141 · --tt-radius-lg |
| `1rem` | 1 | src/styles/_variables.scss:142 · --tt-radius-xl |
| `20px` | 1 | src/styles.css:3 · border-radius |
| `36px` | 1 | src/styles.css:3 · border-radius |
| `13px` | 1 | src/styles.css:43 · border-radius |
| `3px` | 1 | src/styles.css:72 · border-radius |
| `var(--button-radius, 9999px)` | 1 | src/styles.css:142 · border-radius |

## Sombras (22 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `var(--tt-shadow-elevated-md)` | 3 | src/components/tiptap-ui-primitive/card/card.scss:17 · box-shadow |
| `0 8px 28px #0002` | 3 | src/feedback.css:40 · box-shadow |
| `0 0 0 3px var(--tt-button-check-focus-ring-color)` | 1 | src/components/tiptap-ui-primitive/button/button.scss:252 · box-shadow |
| `0 4px 6px -1px rgb(0 0 0 / 0.1)` | 1 | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:24 · box-shadow |
| `0 0 0 1px var(--line)` | 1 | src/create-menu.css:6 · box-shadow |
| `0 1px 2px oklch(0 0 0 / .05),0 3px 8px oklch(0 0 0 / .04)` | 1 | src/folders.css:22 · box-shadow |
| `0 3px 12px rgba(0, 0, 0, 0.045)` | 1 | src/folders.css:157 · box-shadow |
| `0 6px 18px rgba(0, 0, 0, 0.075)` | 1 | src/folders.css:162 · box-shadow |
| `0 4px 16px rgba(0, 0, 0, 0.08)` | 1 | src/folders.css:174 · box-shadow |
| `0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent)` | 1 | src/input-focus.css:6 · box-shadow |
| `0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent), 0 4px 20px #0001` | 1 | src/input-focus.css:9 · box-shadow |
| `0 0 0 1px rgba(0, 0, 0, 0.06),
    0 2px 6px 0 rgba(0, 0, 0, 0.05),
    0 4px 42px 0 rgba(0, 0, 0, 0.06)` | 1 | src/motion.css:217 · box-shadow |
| `0 4px 6px -1px rgb(0 0 0 / .1)` | 1 | src/motion.css:328 · box-shadow |
| `0 4px 20px #0001` | 1 | src/note-find.css:11 · box-shadow |
| `0px 16px 48px 0px rgba(17, 24, 39, 0.04),
    0px 12px 24px 0px rgba(17, 24, 39, 0.04),
    0px 6px 8px 0px rgba(17, 24, 39, 0.02),
    0px 2px 3px 0px rgba(17, 24, 39, 0.02)` | 1 | src/styles/_variables.scss:121 · --tt-shadow-elevated-md |
| `0px 16px 48px 0px rgba(0, 0, 0, 0.5), 0px 12px 24px 0px rgba(0, 0, 0, 0.24),
    0px 6px 8px 0px rgba(0, 0, 0, 0.22), 0px 2px 3px 0px rgba(0, 0, 0, 0.12)` | 1 | src/styles/_variables.scss:203 · --tt-shadow-elevated-md |
| `0 16px 60px #0002` | 1 | src/styles.css:3 · box-shadow |
| `0 8px 30px rgba(0,0,0,0.35),0 2px 8px rgba(0,0,0,0.2)` | 1 | src/styles.css:43 · box-shadow |
| `0 8px 24px rgba(0, 0, 0, 0.4)` | 1 | src/styles.css:90 · box-shadow |
| `0 8px 30px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.25)` | 1 | src/styles.css:136 · box-shadow |
| `0 24px 70px rgba(0,0,0,.18),0 4px 16px rgba(0,0,0,.08)` | 1 | src/styles.css:269 · box-shadow |
| `0 24px 70px rgba(0,0,0,.48),0 4px 16px rgba(0,0,0,.28)` | 1 | src/styles.css:272 · box-shadow |

## Motion (146 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `none !important` | 18 | src/favorite-button.css:46 · animation |
| `none` | 15 | src/cloud-storage.css:52 · transition |
| `scale(1)` | 12 | src/favorite-button.css:24 · transform |
| `translateX(0)` | 6 | src/folders.css:97 · transform |
| `translateY(-50%)` | 5 | src/note-outline.css:7 · transform |
| `translateY(0)` | 4 | src/feedback.css:9 · transform |
| `blur(0)` | 4 | src/feedback.css:10 · filter |
| `50% 100%` | 4 | src/feedback.css:85 · transform-origin |
| `rotate(360deg)` | 3 | src/cloud-storage.css:66 · transform |
| `var(--tt-transition-duration-default)` | 3 | src/components/tiptap-ui-primitive/badge/badge.scss:16 · transition-duration |
| `var(--tt-transition-easing-default)` | 3 | src/components/tiptap-ui-primitive/badge/badge.scss:17 · transition-timing-function |
| `var(--radix-dropdown-menu-content-transform-origin)` | 3 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:35 · transform-origin |
| `0s` | 3 | src/create-menu.css:314 · transition-delay |
| `scale(0.95)` | 3 | src/styles/_keyframe-animations.scss:20 · transform |
| `background, color, opacity` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:15 · transition-property |
| `blur(var(--text-swap-blur))` | 2 | src/feedback.css:20 · filter |
| `translateX(-50%)` | 2 | src/feedback.css:35 · transform |
| `blur(var(--stack-blur))` | 2 | src/feedback.css:95 · filter |
| `color var(--tabs-dur) var(--tabs-ease)` | 2 | src/folders.css:78 · transition |
| `none!important` | 2 | src/folders.css:104 · transition |
| `scale(var(--dropdown-pre-scale))` | 2 | src/motion.css:12 · transform |
| `scale(var(--dropdown-closing-scale))` | 2 | src/motion.css:32 · transform |
| `center` | 2 | src/motion.css:56 · transform-origin |
| `var(--tt-in-dur)` | 2 | src/motion.css:236 · transition-duration |
| `var(--tt-in-ease)` | 2 | src/motion.css:237 · transition-timing-function |
| `var(--tt-delay)` | 2 | src/motion.css:238 · transition-delay |
| `translateX(-100%)` | 2 | src/motion.css:342 · transform |
| `transform, opacity, filter, visibility` | 2 | src/motion.css:344 · transition-property |
| `var(--acc-expand)` | 2 | src/motion.css:383 · transition-duration |
| `rotate(180deg)` | 2 | src/motion.css:388 · transform |
| `rotate(-90deg)` | 2 | src/note-actions.css:42 · transform |
| `left center` | 2 | src/note-outline.css:45 · transform-origin |
| `opacity 150ms var(--resize-ease), visibility 0s 150ms` | 2 | src/sidebar.css:72 · transition |
| `background .14s` | 2 | src/styles.css:3 · transition |
| `opacity .14s` | 2 | src/styles.css:175 · transition |
| `opacity .14s ease` | 2 | src/styles.css:208 · transition |
| `scaleX(-1)` | 1 | src/buttons.css:21 · transform |
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
| `color var(--like-fill) var(--like-ease)` | 1 | src/favorite-button.css:13 · transition |
| `fill var(--like-fill) var(--like-ease), stroke var(--like-fill) var(--like-ease)` | 1 | src/favorite-button.css:15 · transition |
| `t-like-pop var(--like-pop) var(--like-pop-ease)` | 1 | src/favorite-button.css:23 · animation |
| `scale(0.82)` | 1 | src/favorite-button.css:24 · transform |
| `translate(0, 0) scale(0.4)` | 1 | src/favorite-button.css:37 · transform |
| `translate(calc(var(--px) * 0.25), calc(var(--py) * 0.25)) scale(1)` | 1 | src/favorite-button.css:38 · transform |
| `translate(var(--px), var(--py)) scale(var(--p-end-scale, 0.6))` | 1 | src/favorite-button.css:39 · transform |
| `t-like-burst var(--pdur, var(--like-particle-dur)) ease-out var(--pdelay, 0ms) forwards` | 1 | src/favorite-button.css:41 · animation |
| `opacity var(--like-fill) var(--like-ease), color var(--like-fill) var(--like-ease)` | 1 | src/favorite-button.css:53 · transition |
| `transform var(--text-swap-dur) var(--text-swap-ease),
    filter    var(--text-swap-dur) var(--text-swap-ease),
    opacity   var(--text-swap-dur) var(--text-swap-ease)` | 1 | src/feedback.css:12 · transition |
| `translateY(calc(var(--text-swap-translate-y) * -1))` | 1 | src/feedback.css:19 · transform |
| `translateY(var(--text-swap-translate-y))` | 1 | src/feedback.css:24 · transform |
| `50% 50%` | 1 | src/feedback.css:70 · transform-origin |
| `transform var(--stack-open) var(--stack-ease),
    opacity var(--stack-open) var(--stack-ease),
    filter var(--stack-open) var(--stack-ease)` | 1 | src/feedback.css:73 · transition |
| `translateY(0) scale(1)` | 1 | src/feedback.css:80 · transform |
| `translateY(calc(var(--stack-peek) * -1))
             scale(calc(1 - var(--stack-depth-scale)))` | 1 | src/feedback.css:86 · transform |
| `blur(var(--stack-depth1-blur))` | 1 | src/feedback.css:89 · filter |
| `translateY(var(--stack-rise)) scale(var(--stack-scale))` | 1 | src/feedback.css:93 · transform |
| `translateY(calc(var(--stack-peek) * -3))
             scale(calc(1 - var(--stack-depth-scale) * 3))` | 1 | src/feedback.css:100 · transform |
| `transform var(--stack-close) var(--stack-ease),
    opacity var(--stack-close) var(--stack-ease),
    filter var(--stack-close) var(--stack-ease)` | 1 | src/feedback.css:104 · transition |
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
| `top left` | 1 | src/motion.css:11 · transform-origin |
| `transform var(--dropdown-open-dur) var(--dropdown-ease),
    opacity   var(--dropdown-open-dur) var(--dropdown-ease)` | 1 | src/motion.css:15 · transition |
| `top right` | 1 | src/motion.css:21 · transform-origin |
| `top center` | 1 | src/motion.css:22 · transform-origin |
| `bottom left` | 1 | src/motion.css:23 · transform-origin |
| `bottom center` | 1 | src/motion.css:24 · transform-origin |
| `bottom right` | 1 | src/motion.css:25 · transform-origin |
| `transform var(--dropdown-close-dur) var(--dropdown-ease),
    opacity   var(--dropdown-close-dur) var(--dropdown-ease)` | 1 | src/motion.css:35 · transition |
| `scale(var(--modal-scale))` | 1 | src/motion.css:57 · transform |
| `transform var(--modal-open-dur) var(--modal-ease),
    opacity   var(--modal-open-dur) var(--modal-ease)` | 1 | src/motion.css:60 · transition |
| `scale(var(--modal-scale-close))` | 1 | src/motion.css:71 · transform |
| `transform var(--modal-close-dur) var(--modal-ease),
    opacity   var(--modal-close-dur) var(--modal-ease)` | 1 | src/motion.css:74 · transition |
| `translateY(var(--panel-translate-y))` | 1 | src/motion.css:96 · transform |
| `blur(var(--panel-blur))` | 1 | src/motion.css:98 · filter |
| `transform var(--panel-close-dur) var(--panel-ease),
    opacity   var(--panel-close-dur) var(--panel-ease),
    filter    var(--panel-close-dur) var(--panel-ease)` | 1 | src/motion.css:100 · transition |
| `transform var(--panel-open-dur) var(--panel-ease),
    opacity   var(--panel-open-dur) var(--panel-ease),
    filter    var(--panel-open-dur) var(--panel-ease)` | 1 | src/motion.css:111 · transition |
| `transform var(--tabs-dur) var(--tabs-ease),
    width     var(--tabs-dur) var(--tabs-ease)` | 1 | src/motion.css:176 · transition |
| `translate(-50%, 0) scale(var(--tt-scale))` | 1 | src/motion.css:210 · transform |
| `opacity   var(--tt-out-dur) var(--tt-out-ease),
    transform var(--tt-out-dur) var(--tt-out-ease)` | 1 | src/motion.css:223 · transition |
| `translate(-50%, 0) scale(1)` | 1 | src/motion.css:235 · transform |
| `opacity   var(--icon-swap-dur) var(--icon-swap-ease),
    filter    var(--icon-swap-dur) var(--icon-swap-ease),
    transform var(--icon-swap-dur) var(--icon-swap-ease)` | 1 | src/motion.css:265 · transition |
| `blur(var(--icon-swap-blur))` | 1 | src/motion.css:280 · filter |
| `scale(var(--icon-swap-start-scale))` | 1 | src/motion.css:281 · transform |
| `notes-dropdown-in var(--dropdown-open-dur) var(--dropdown-ease) both` | 1 | src/motion.css:289 · animation |
| `notes-dropdown-out var(--dropdown-close-dur) var(--dropdown-ease) both` | 1 | src/motion.css:293 · animation |
| `opacity var(--modal-close-dur) var(--modal-ease)` | 1 | src/motion.css:305 · transition |
| `var(--modal-open-dur)` | 1 | src/motion.css:309 · transition-duration |
| `notes-tooltip-in var(--tt-in-dur) var(--tt-in-ease) both` | 1 | src/motion.css:334 · animation |
| `scale(var(--tt-scale))` | 1 | src/motion.css:338 · transform |
| `var(--panel-close-dur), var(--panel-close-dur), var(--panel-close-dur), 0s` | 1 | src/motion.css:345 · transition-duration |
| `0s, 0s, 0s, var(--panel-close-dur)` | 1 | src/motion.css:346 · transition-delay |
| `var(--panel-ease)` | 1 | src/motion.css:347 · transition-timing-function |
| `var(--panel-open-dur), var(--panel-open-dur), var(--panel-open-dur), 0s` | 1 | src/motion.css:352 · transition-duration |
| `grid-template-rows var(--acc-collapse) var(--acc-ease),
    opacity var(--acc-collapse) var(--acc-ease)` | 1 | src/motion.css:376 · transition |
| `transform var(--acc-chevron) var(--acc-ease)` | 1 | src/motion.css:387 · transition |
| `background 0.12s ease` | 1 | src/note-actions.css:24 · transition |
| `left var(--resize-dur) var(--resize-ease)` | 1 | src/note-outline.css:8 · transition |
| `width var(--tt-in-dur) var(--dropdown-ease),
    opacity var(--tt-in-dur) var(--dropdown-ease),
    background-color var(--tt-in-dur) var(--dropdown-ease)` | 1 | src/note-outline.css:46 · transition |
| `translate(0, -50%) scale(var(--tt-scale))` | 1 | src/note-outline.css:73 · transform |
| `translate(0, -50%) scale(1)` | 1 | src/note-outline.css:81 · transform |
| `width  var(--resize-dur) var(--resize-ease),
    height var(--resize-dur) var(--resize-ease)` | 1 | src/sidebar.css:5 · transition |
| `transform var(--acc-chevron) var(--acc-ease),opacity 150ms ease` | 1 | src/sidebar.css:35 · transition |
| `grid-template-rows var(--acc-collapse) var(--acc-ease),opacity var(--acc-collapse) var(--acc-ease)` | 1 | src/sidebar.css:38 · transition |
| `margin-left var(--resize-dur) var(--resize-ease)` | 1 | src/sidebar.css:63 · transition |
| `opacity 150ms var(--resize-ease), visibility 0s` | 1 | src/sidebar.css:66 · transition |
| `translateY(-0.5rem)` | 1 | src/styles/_keyframe-animations.scss:49 · transform |
| `translateX(0.5rem)` | 1 | src/styles/_keyframe-animations.scss:58 · transform |
| `translateX(-0.5rem)` | 1 | src/styles/_keyframe-animations.scss:67 · transform |
| `translateY(0.5rem)` | 1 | src/styles/_keyframe-animations.scss:76 · transform |
| `rotate(0deg)` | 1 | src/styles/_keyframe-animations.scss:85 · transform |
| `none var(--tt-transition-duration-default)
      var(--tt-transition-easing-default)` | 1 | src/styles/_variables.scss:170 · transition |
| `transform .18s` | 1 | src/styles.css:6 · transition |
| `saving-spin .8s linear infinite` | 1 | src/styles.css:38 · animation |
| `background 0.12s, color 0.12s` | 1 | src/styles.css:110 · transition |
| `border-color .14s ease` | 1 | src/styles.css:280 · transition |
| `translate(-2px,2px)` | 1 | src/styles.css:296 · transform |
| `opacity .14s ease,transform .14s ease` | 1 | src/styles.css:296 · transition |
| `--palette-start 350ms ease-in-out, --palette-middle 350ms ease-in-out, --palette-end 350ms ease-in-out,
    --accent 350ms ease-in-out, --secondary 350ms ease-in-out, --muted 350ms ease-in-out,
    --line 350ms ease-in-out, --hover 350ms ease-in-out, --surface 350ms ease-in-out, --sidebar 350ms ease-in-out` | 1 | src/themes.css:18 · transition |
| `background-color 250ms ease-in-out, color 250ms ease-in-out` | 1 | src/themes.css:74 · transition |

## Dimensões (120 valores distintos)

| Valor | Ocorrências | Exemplo |
|---|---:|---|
| `0` | 33 | src/cloud-storage.css:9 · min-height |
| `100%` | 29 | src/cloud-storage.css:12 · width |
| `32px` | 18 | src/folders.css:299 · width |
| `28px` | 16 | src/buttons.css:8 · min-height |
| `24px` | 15 | src/buttons.css:45 · width |
| `30px` | 11 | src/buttons.css:44 · min-width |
| `36px` | 11 | src/folders.css:6 · width |
| `1rem` | 9 | src/components/tiptap-ui-primitive/badge/badge.scss:30 · height |
| `0.875rem` | 9 | src/components/tiptap-ui-primitive/button/button.scss:92 · width |
| `44px` | 7 | src/delete-note-dialog.css:29 · min-height |
| `1px` | 7 | src/feedback.css:50 · width |
| `80px` | 7 | src/sidebar.css:29 · min-height |
| `1.5rem` | 6 | src/components/tiptap-ui-primitive/badge/badge.scss:22 · height |
| `0.625rem` | 6 | src/components/tiptap-ui-primitive/badge/badge.scss:54 · width |
| `0.75rem` | 6 | src/components/tiptap-ui-primitive/badge/badge.scss:59 · width |
| `1.125rem` | 5 | src/components/tiptap-ui-primitive/button/button.scss:87 · width |
| `18px` | 4 | src/cloud-storage.css:31 · width |
| `auto` | 4 | src/cloud-storage.css:91 · width |
| `16px` | 4 | src/folders.css:38 · width |
| `29px` | 4 | src/sidebar.css:48 · width |
| `0.5rem` | 3 | src/components/tiptap-ui-primitive/button/button.scss:140 · width |
| `max-content` | 3 | src/components/tiptap-ui-primitive/card/card.scss:51 · min-width |
| `38px` | 3 | src/create-menu.css:293 · height |
| `calc(100vw - 24px)` | 3 | src/note-actions.css:3 · max-width |
| `240px` | 3 | src/note-outline.css:62 · max-width |
| `258px` | 3 | src/sidebar.css:110 · width |
| `100dvh` | 3 | src/styles.css:3 · min-height |
| `19px` | 2 | src/cloud-storage.css:71 · width |
| `1.25rem` | 2 | src/components/tiptap-ui-primitive/badge/badge.scss:7 · height |
| `2rem` | 2 | src/components/tiptap-ui-primitive/button/button.scss:7 · height |
| `2.375rem` | 2 | src/components/tiptap-ui-primitive/button/button.scss:42 · height |
| `var(--radix-dropdown-menu-content-available-height)` | 2 | src/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss:27 · max-height |
| `244px` | 2 | src/create-menu.css:23 · width |
| `var(--pill-w)` | 2 | src/create-menu.css:165 · width |
| `calc(var(--like-particle-size) * var(--psize, 1))` | 2 | src/favorite-button.css:31 · width |
| `none` | 2 | src/feedback.css:35 · max-width |
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
| `0!important` | 2 | src/styles.css:316 · min-height |
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
| `min(440px,calc(100vw - 32px))` | 1 | src/delete-note-dialog.css:1 · width |
| `min(380px,calc(100vw - 32px))` | 1 | src/feedback.css:35 · width |
| `calc(100dvh - 48px)` | 1 | src/feedback.css:35 · max-height |
| `inherit` | 1 | src/feedback.css:37 · max-height |
| `min(380px,calc(100vw - var(--sidebar-width,258px) - 32px))` | 1 | src/feedback.css:49 · width |
| `var(--stack-front-height,52px)` | 1 | src/feedback.css:112 · height |
| `9px` | 1 | src/folders.css:44 · width |
| `248px` | 1 | src/note-actions.css:2 · width |
| `180px` | 1 | src/note-actions.css:41 · width |
| `calc((100vw - 30px) / 2)` | 1 | src/note-actions.css:44 · width |
| `var(--outline-item-height)` | 1 | src/note-outline.css:34 · height |
| `var(--outline-width)` | 1 | src/note-outline.css:40 · width |
| `var(--sidebar-expanded-width)` | 1 | src/sidebar.css:19 · width |
| `var(--sidebar-width)` | 1 | src/sidebar.css:62 · width |
| `var(--sidebar-rail-width)` | 1 | src/sidebar.css:80 · width |
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
| `min(450px,calc(100% - 32px))` | 1 | src/styles.css:187 · width |
| `min(720px,calc(100% - 32px))` | 1 | src/styles.css:261 · width |
| `min(460px,calc(100dvh - 40px))` | 1 | src/styles.css:262 · height |
| `min(620px,calc(100dvh - 40px))` | 1 | src/styles.css:263 · max-height |
| `104px` | 1 | src/styles.css:274 · min-height |
| `calc(100% - 66px - var(--modal-scroll-inset))` | 1 | src/styles.css:286 · height |
| `54px` | 1 | src/styles.css:289 · min-height |
| `calc(100% - 20px)` | 1 | src/styles.css:301 · width |
| `min(460px,calc(100dvh - 20px))` | 1 | src/styles.css:301 · height |
| `calc(100dvh - 20px)` | 1 | src/styles.css:301 · max-height |
| `calc(100% - 60px - var(--modal-scroll-inset))` | 1 | src/styles.css:301 · height |
| `auto!important` | 1 | src/styles.css:318 · width |
| `none!important` | 1 | src/styles.css:318 · max-width |
| `100%!important` | 1 | src/styles.css:327 · max-width |
| `calc(100% - 48px)` | 1 | src/user-profile.css:9 · max-width |

## Variáveis existentes

| Variável | Valor | Arquivo |
|---|---|---|
| `--button-radius` | `9999px` | src/buttons.css:1 |
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
| `--tt-tooltip-radius` | `var(--tt-radius-lg, 0.75rem)` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:1 |
| `--tt-tooltip-padding` | `0.375rem 0.625rem` | src/components/tiptap-ui-primitive/tooltip/tooltip.scss:2 |
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
| `--like-color` | `#f40051` | src/favorite-button.css:1 |
| `--like-fill` | `150ms` | src/favorite-button.css:2 |
| `--like-pop` | `350ms` | src/favorite-button.css:3 |
| `--like-pop-ease` | `cubic-bezier(0.34, 1.96, 0.64, 1)` | src/favorite-button.css:4 |
| `--like-particle-dur` | `600ms` | src/favorite-button.css:5 |
| `--like-particle-dist` | `20px` | src/favorite-button.css:6 |
| `--like-particle-size` | `2.5px` | src/favorite-button.css:7 |
| `--like-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/favorite-button.css:8 |
| `--like-color` | `var(--ink)` | src/favorite-button.css:51 |
| `--text-swap-dur` | `150ms` | src/feedback.css:1 |
| `--text-swap-translate-y` | `4px` | src/feedback.css:2 |
| `--text-swap-blur` | `2px` | src/feedback.css:3 |
| `--text-swap-ease` | `ease-in-out` | src/feedback.css:4 |
| `--stack-open` | `450ms` | src/feedback.css:53 |
| `--stack-hold` | `200ms` | src/feedback.css:54 |
| `--stack-close` | `250ms` | src/feedback.css:55 |
| `--stack-rise` | `60px` | src/feedback.css:56 |
| `--stack-blur` | `2px` | src/feedback.css:57 |
| `--stack-scale` | `0.97` | src/feedback.css:58 |
| `--stack-peek` | `12px` | src/feedback.css:59 |
| `--stack-depth-scale` | `0.06` | src/feedback.css:60 |
| `--stack-depth-fade` | `0.4` | src/feedback.css:61 |
| `--stack-depth1-blur` | `1px` | src/feedback.css:62 |
| `--stack-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/feedback.css:63 |
| `--tabs-dur` | `250ms` | src/folders.css:57 |
| `--tabs-ease` | `cubic-bezier(0.22,1,0.36,1)` | src/folders.css:58 |
| `--dropdown-open-dur` | `250ms` | src/motion.css:2 |
| `--dropdown-close-dur` | `150ms` | src/motion.css:3 |
| `--dropdown-pre-scale` | `0.97` | src/motion.css:4 |
| `--dropdown-closing-scale` | `0.99` | src/motion.css:5 |
| `--dropdown-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/motion.css:6 |
| `--modal-open-dur` | `250ms` | src/motion.css:47 |
| `--modal-close-dur` | `150ms` | src/motion.css:48 |
| `--modal-scale` | `0.96` | src/motion.css:49 |
| `--modal-scale-close` | `0.96` | src/motion.css:50 |
| `--modal-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/motion.css:51 |
| `--panel-open-dur` | `400ms` | src/motion.css:86 |
| `--panel-close-dur` | `350ms` | src/motion.css:87 |
| `--panel-translate-y` | `100px` | src/motion.css:88 |
| `--panel-blur` | `2px` | src/motion.css:89 |
| `--panel-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/motion.css:90 |
| `--tabs-dur` | `250ms` | src/motion.css:125 |
| `--tabs-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/motion.css:126 |
| `--tabs-text-muted` | `rgba(15, 15, 15, 0.8)` | src/motion.css:127 |
| `--tabs-text-active` | `#0f0f0f` | src/motion.css:128 |
| `--tabs-bar-bg` | `#f1f1f1` | src/motion.css:129 |
| `--tabs-pill-bg` | `#ffffff` | src/motion.css:130 |
| `--tt-in-dur` | `150ms` | src/motion.css:191 |
| `--tt-out-dur` | `50ms` | src/motion.css:192 |
| `--tt-scale` | `0.98` | src/motion.css:193 |
| `--tt-delay` | `80ms` | src/motion.css:194 |
| `--tt-in-ease` | `ease-out` | src/motion.css:195 |
| `--tt-out-ease` | `ease-out` | src/motion.css:196 |
| `--tt-bg` | `#ffffff` | src/motion.css:197 |
| `--tt-fg` | `#2f2f2f` | src/motion.css:198 |
| `--icon-swap-dur` | `250ms` | src/motion.css:254 |
| `--icon-swap-blur` | `2px` | src/motion.css:255 |
| `--icon-swap-start-scale` | `0.25` | src/motion.css:256 |
| `--icon-swap-ease` | `ease-in-out` | src/motion.css:257 |
| `--tabs-bar-bg` | `transparent` | src/motion.css:312 |
| `--tabs-pill-bg` | `var(--hover)` | src/motion.css:313 |
| `--tabs-text-muted` | `var(--muted)` | src/motion.css:314 |
| `--tabs-text-active` | `var(--ink)` | src/motion.css:315 |
| `--acc-expand` | `250ms` | src/motion.css:366 |
| `--acc-collapse` | `250ms` | src/motion.css:367 |
| `--acc-chevron` | `250ms` | src/motion.css:368 |
| `--acc-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/motion.css:369 |
| `--outline-item-height` | `14px` | src/note-outline.css:12 |
| `--outline-gap` | `4px` | src/note-outline.css:13 |
| `--outline-item-height` | `10px` | src/note-outline.css:22 |
| `--outline-gap` | `3px` | src/note-outline.css:23 |
| `--outline-item-height` | `8px` | src/note-outline.css:26 |
| `--outline-gap` | `1px` | src/note-outline.css:27 |
| `--resize-dur` | `300ms` | src/sidebar.css:1 |
| `--resize-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | src/sidebar.css:2 |
| `--sidebar-expanded-width` | `258px` | src/sidebar.css:15 |
| `--sidebar-rail-width` | `50px` | src/sidebar.css:15 |
| `--sidebar-width` | `var(--sidebar-expanded-width)` | src/sidebar.css:60 |
| `--sidebar-width` | `var(--sidebar-rail-width)` | src/sidebar.css:61 |
| `--sidebar-expanded-width` | `240px` | src/sidebar.css:105 |
| `--tt-gray-light-a-50` | `rgba(56, 56, 56, 0.04)` | src/styles/_variables.scss:12 |
| `--tt-gray-light-a-100` | `rgba(15, 22, 36, 0.05)` | src/styles/_variables.scss:19 |
| `--tt-gray-light-a-200` | `rgba(37, 39, 45, 0.1)` | src/styles/_variables.scss:20 |
| `--tt-gray-light-a-300` | `rgba(47, 50, 55, 0.2)` | src/styles/_variables.scss:21 |
| `--tt-gray-light-a-400` | `rgba(40, 44, 51, 0.42)` | src/styles/_variables.scss:22 |
| `--tt-gray-light-a-500` | `rgba(52, 55, 60, 0.64)` | src/styles/_variables.scss:23 |
| `--tt-gray-light-a-600` | `rgba(36, 39, 46, 0.78)` | src/styles/_variables.scss:24 |
| `--tt-gray-light-a-700` | `rgba(35, 37, 42, 0.87)` | src/styles/_variables.scss:25 |
| `--tt-gray-light-a-800` | `rgba(30, 32, 36, 0.95)` | src/styles/_variables.scss:26 |
| `--tt-gray-light-a-900` | `rgba(29, 30, 32, 0.98)` | src/styles/_variables.scss:27 |
| `--tt-gray-light-50` | `rgba(250, 250, 250, 1)` | src/styles/_variables.scss:28 |
| `--tt-gray-light-100` | `rgba(244, 244, 245, 1)` | src/styles/_variables.scss:31 |
| `--tt-gray-light-200` | `rgba(234, 234, 235, 1)` | src/styles/_variables.scss:32 |
| `--tt-gray-light-300` | `rgba(213, 214, 215, 1)` | src/styles/_variables.scss:33 |
| `--tt-gray-light-400` | `rgba(166, 167, 171, 1)` | src/styles/_variables.scss:34 |
| `--tt-gray-light-500` | `rgba(125, 127, 130, 1)` | src/styles/_variables.scss:35 |
| `--tt-gray-light-600` | `rgba(83, 86, 90, 1)` | src/styles/_variables.scss:36 |
| `--tt-gray-light-700` | `rgba(64, 65, 69, 1)` | src/styles/_variables.scss:37 |
| `--tt-gray-light-800` | `rgba(44, 45, 48, 1)` | src/styles/_variables.scss:38 |
| `--tt-gray-light-900` | `rgba(34, 35, 37, 1)` | src/styles/_variables.scss:39 |
| `--tt-gray-dark-a-50` | `rgba(232, 232, 253, 0.05)` | src/styles/_variables.scss:40 |
| `--tt-gray-dark-a-100` | `rgba(231, 231, 243, 0.07)` | src/styles/_variables.scss:43 |
| `--tt-gray-dark-a-200` | `rgba(238, 238, 246, 0.11)` | src/styles/_variables.scss:44 |
| `--tt-gray-dark-a-300` | `rgba(239, 239, 245, 0.22)` | src/styles/_variables.scss:45 |
| `--tt-gray-dark-a-400` | `rgba(244, 244, 255, 0.37)` | src/styles/_variables.scss:46 |
| `--tt-gray-dark-a-500` | `rgba(236, 238, 253, 0.5)` | src/styles/_variables.scss:47 |
| `--tt-gray-dark-a-600` | `rgba(247, 247, 253, 0.64)` | src/styles/_variables.scss:48 |
| `--tt-gray-dark-a-700` | `rgba(251, 251, 254, 0.75)` | src/styles/_variables.scss:49 |
| `--tt-gray-dark-a-800` | `rgba(253, 253, 253, 0.88)` | src/styles/_variables.scss:50 |
| `--tt-gray-dark-a-900` | `rgba(255, 255, 255, 0.96)` | src/styles/_variables.scss:51 |
| `--tt-gray-dark-50` | `rgba(25, 25, 26, 1)` | src/styles/_variables.scss:52 |
| `--tt-gray-dark-100` | `rgba(32, 32, 34, 1)` | src/styles/_variables.scss:55 |
| `--tt-gray-dark-200` | `rgba(45, 45, 47, 1)` | src/styles/_variables.scss:56 |
| `--tt-gray-dark-300` | `rgba(70, 70, 73, 1)` | src/styles/_variables.scss:57 |
| `--tt-gray-dark-400` | `rgba(99, 99, 105, 1)` | src/styles/_variables.scss:58 |
| `--tt-gray-dark-500` | `rgba(124, 124, 131, 1)` | src/styles/_variables.scss:59 |
| `--tt-gray-dark-600` | `rgba(163, 163, 168, 1)` | src/styles/_variables.scss:60 |
| `--tt-gray-dark-700` | `rgba(192, 192, 195, 1)` | src/styles/_variables.scss:61 |
| `--tt-gray-dark-800` | `rgba(224, 224, 225, 1)` | src/styles/_variables.scss:62 |
| `--tt-gray-dark-900` | `rgba(245, 245, 245, 1)` | src/styles/_variables.scss:63 |
| `--tt-brand-color-50` | `rgba(239, 238, 255, 1)` | src/styles/_variables.scss:64 |
| `--tt-brand-color-100` | `rgba(222, 219, 255, 1)` | src/styles/_variables.scss:67 |
| `--tt-brand-color-200` | `rgba(195, 189, 255, 1)` | src/styles/_variables.scss:68 |
| `--tt-brand-color-300` | `rgba(157, 138, 255, 1)` | src/styles/_variables.scss:69 |
| `--tt-brand-color-400` | `rgba(122, 82, 255, 1)` | src/styles/_variables.scss:70 |
| `--tt-brand-color-500` | `rgba(98, 41, 255, 1)` | src/styles/_variables.scss:71 |
| `--tt-brand-color-600` | `rgba(84, 0, 229, 1)` | src/styles/_variables.scss:72 |
| `--tt-brand-color-700` | `rgba(75, 0, 204, 1)` | src/styles/_variables.scss:73 |
| `--tt-brand-color-800` | `rgba(56, 0, 153, 1)` | src/styles/_variables.scss:74 |
| `--tt-brand-color-900` | `rgba(43, 25, 102, 1)` | src/styles/_variables.scss:75 |
| `--tt-brand-color-950` | `hsla(257, 100%, 9%, 1)` | src/styles/_variables.scss:76 |
| `--tt-color-green-inc-5` | `hsla(129, 100%, 97%, 1)` | src/styles/_variables.scss:77 |
| `--tt-color-green-inc-4` | `hsla(129, 100%, 92%, 1)` | src/styles/_variables.scss:80 |
| `--tt-color-green-inc-3` | `hsla(131, 100%, 86%, 1)` | src/styles/_variables.scss:81 |
| `--tt-color-green-inc-2` | `hsla(133, 98%, 78%, 1)` | src/styles/_variables.scss:82 |
| `--tt-color-green-inc-1` | `hsla(137, 99%, 70%, 1)` | src/styles/_variables.scss:83 |
| `--tt-color-green-base` | `hsla(147, 99%, 50%, 1)` | src/styles/_variables.scss:84 |
| `--tt-color-green-dec-1` | `hsla(147, 97%, 41%, 1)` | src/styles/_variables.scss:85 |
| `--tt-color-green-dec-2` | `hsla(146, 98%, 32%, 1)` | src/styles/_variables.scss:86 |
| `--tt-color-green-dec-3` | `hsla(146, 100%, 24%, 1)` | src/styles/_variables.scss:87 |
| `--tt-color-green-dec-4` | `hsla(144, 100%, 16%, 1)` | src/styles/_variables.scss:88 |
| `--tt-color-green-dec-5` | `hsla(140, 100%, 9%, 1)` | src/styles/_variables.scss:89 |
| `--tt-color-yellow-inc-5` | `hsla(50, 100%, 97%, 1)` | src/styles/_variables.scss:90 |
| `--tt-color-yellow-inc-4` | `hsla(50, 100%, 91%, 1)` | src/styles/_variables.scss:93 |
| `--tt-color-yellow-inc-3` | `hsla(50, 100%, 84%, 1)` | src/styles/_variables.scss:94 |
| `--tt-color-yellow-inc-2` | `hsla(50, 100%, 77%, 1)` | src/styles/_variables.scss:95 |
| `--tt-color-yellow-inc-1` | `hsla(50, 100%, 68%, 1)` | src/styles/_variables.scss:96 |
| `--tt-color-yellow-base` | `hsla(52, 100%, 50%, 1)` | src/styles/_variables.scss:97 |
| `--tt-color-yellow-dec-1` | `hsla(52, 100%, 41%, 1)` | src/styles/_variables.scss:98 |
| `--tt-color-yellow-dec-2` | `hsla(52, 100%, 32%, 1)` | src/styles/_variables.scss:99 |
| `--tt-color-yellow-dec-3` | `hsla(52, 100%, 24%, 1)` | src/styles/_variables.scss:100 |
| `--tt-color-yellow-dec-4` | `hsla(51, 100%, 16%, 1)` | src/styles/_variables.scss:101 |
| `--tt-color-yellow-dec-5` | `hsla(50, 100%, 9%, 1)` | src/styles/_variables.scss:102 |
| `--tt-color-red-inc-5` | `hsla(11, 100%, 96%, 1)` | src/styles/_variables.scss:103 |
| `--tt-color-red-inc-4` | `hsla(11, 100%, 88%, 1)` | src/styles/_variables.scss:106 |
| `--tt-color-red-inc-3` | `hsla(10, 100%, 80%, 1)` | src/styles/_variables.scss:107 |
| `--tt-color-red-inc-2` | `hsla(9, 100%, 73%, 1)` | src/styles/_variables.scss:108 |
| `--tt-color-red-inc-1` | `hsla(7, 100%, 64%, 1)` | src/styles/_variables.scss:109 |
| `--tt-color-red-base` | `hsla(7, 100%, 54%, 1)` | src/styles/_variables.scss:110 |
| `--tt-color-red-dec-1` | `hsla(7, 100%, 41%, 1)` | src/styles/_variables.scss:111 |
| `--tt-color-red-dec-2` | `hsla(5, 100%, 32%, 1)` | src/styles/_variables.scss:112 |
| `--tt-color-red-dec-3` | `hsla(4, 100%, 24%, 1)` | src/styles/_variables.scss:113 |
| `--tt-color-red-dec-4` | `hsla(3, 100%, 16%, 1)` | src/styles/_variables.scss:114 |
| `--tt-color-red-dec-5` | `hsla(1, 100%, 9%, 1)` | src/styles/_variables.scss:115 |
| `--white` | `rgba(255, 255, 255, 1)` | src/styles/_variables.scss:116 |
| `--black` | `rgba(14, 14, 17, 1)` | src/styles/_variables.scss:119 |
| `--transparent` | `rgba(255, 255, 255, 0)` | src/styles/_variables.scss:120 |
| `--tt-shadow-elevated-md` | `0px 16px 48px 0px rgba(17, 24, 39, 0.04),
    0px 12px 24px 0px rgba(17, 24, 39, 0.04),
    0px 6px 8px 0px rgba(17, 24, 39, 0.02),
    0px 2px 3px 0px rgba(17, 24, 39, 0.02)` | src/styles/_variables.scss:121 |
| `--tt-radius-xxs` | `0.125rem` | src/styles/_variables.scss:132 |
| `--tt-radius-xs` | `0.25rem` | src/styles/_variables.scss:138 |
| `--tt-radius-sm` | `0.375rem` | src/styles/_variables.scss:139 |
| `--tt-radius-md` | `0.5rem` | src/styles/_variables.scss:140 |
| `--tt-radius-lg` | `0.75rem` | src/styles/_variables.scss:141 |
| `--tt-radius-xl` | `1rem` | src/styles/_variables.scss:142 |
| `--tt-transition-duration-short` | `0.1s` | src/styles/_variables.scss:143 |
| `--tt-transition-duration-default` | `0.2s` | src/styles/_variables.scss:149 |
| `--tt-transition-duration-long` | `0.64s` | src/styles/_variables.scss:150 |
| `--tt-transition-easing-default` | `cubic-bezier(0.46, 0.03, 0.52, 0.96)` | src/styles/_variables.scss:151 |
| `--tt-transition-easing-cubic` | `cubic-bezier(0.65, 0.05, 0.36, 1)` | src/styles/_variables.scss:152 |
| `--tt-transition-easing-quart` | `cubic-bezier(0.77, 0, 0.18, 1)` | src/styles/_variables.scss:153 |
| `--tt-transition-easing-circ` | `cubic-bezier(0.79, 0.14, 0.15, 0.86)` | src/styles/_variables.scss:154 |
| `--tt-transition-easing-back` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | src/styles/_variables.scss:155 |
| `--tt-accent-contrast` | `8%` | src/styles/_variables.scss:156 |
| `--tt-destructive-contrast` | `8%` | src/styles/_variables.scss:162 |
| `--tt-foreground-contrast` | `8%` | src/styles/_variables.scss:163 |
| `--tt-bg-color` | `var(--white)` | src/styles/_variables.scss:176 |
| `--tt-border-color` | `var(--tt-gray-light-a-200)` | src/styles/_variables.scss:182 |
| `--tt-border-color-tint` | `var(--tt-gray-light-a-100)` | src/styles/_variables.scss:183 |
| `--tt-sidebar-bg-color` | `var(--tt-gray-light-100)` | src/styles/_variables.scss:184 |
| `--tt-scrollbar-color` | `var(--tt-gray-light-a-200)` | src/styles/_variables.scss:185 |
| `--tt-cursor-color` | `var(--tt-brand-color-500)` | src/styles/_variables.scss:186 |
| `--tt-selection-color` | `rgba(157, 138, 255, 0.2)` | src/styles/_variables.scss:187 |
| `--tt-card-bg-color` | `var(--white)` | src/styles/_variables.scss:188 |
| `--tt-card-border-color` | `var(--tt-gray-light-a-100)` | src/styles/_variables.scss:189 |
| `--tt-bg-color` | `var(--black)` | src/styles/_variables.scss:194 |
| `--tt-border-color` | `var(--tt-gray-dark-a-200)` | src/styles/_variables.scss:195 |
| `--tt-border-color-tint` | `var(--tt-gray-dark-a-100)` | src/styles/_variables.scss:196 |
| `--tt-sidebar-bg-color` | `var(--tt-gray-dark-100)` | src/styles/_variables.scss:197 |
| `--tt-scrollbar-color` | `var(--tt-gray-dark-a-200)` | src/styles/_variables.scss:198 |
| `--tt-cursor-color` | `var(--tt-brand-color-400)` | src/styles/_variables.scss:199 |
| `--tt-selection-color` | `rgba(122, 82, 255, 0.2)` | src/styles/_variables.scss:200 |
| `--tt-card-bg-color` | `var(--tt-gray-dark-50)` | src/styles/_variables.scss:201 |
| `--tt-card-border-color` | `var(--tt-gray-dark-a-50)` | src/styles/_variables.scss:202 |
| `--tt-shadow-elevated-md` | `0px 16px 48px 0px rgba(0, 0, 0, 0.5), 0px 12px 24px 0px rgba(0, 0, 0, 0.24),
    0px 6px 8px 0px rgba(0, 0, 0, 0.22), 0px 2px 3px 0px rgba(0, 0, 0, 0.12)` | src/styles/_variables.scss:203 |
| `--tt-color-text-gray` | `hsl(45, 2%, 46%)` | src/styles/_variables.scss:211 |
| `--tt-color-text-brown` | `hsl(19, 31%, 47%)` | src/styles/_variables.scss:212 |
| `--tt-color-text-orange` | `hsl(30, 89%, 45%)` | src/styles/_variables.scss:213 |
| `--tt-color-text-yellow` | `hsl(38, 62%, 49%)` | src/styles/_variables.scss:214 |
| `--tt-color-text-green` | `hsl(148, 32%, 39%)` | src/styles/_variables.scss:215 |
| `--tt-color-text-blue` | `hsl(202, 54%, 43%)` | src/styles/_variables.scss:216 |
| `--tt-color-text-purple` | `hsl(274, 32%, 54%)` | src/styles/_variables.scss:217 |
| `--tt-color-text-pink` | `hsl(328, 49%, 53%)` | src/styles/_variables.scss:218 |
| `--tt-color-text-red` | `hsl(2, 62%, 55%)` | src/styles/_variables.scss:219 |
| `--tt-color-text-gray-contrast` | `hsla(39, 26%, 26%, 0.15)` | src/styles/_variables.scss:220 |
| `--tt-color-text-brown-contrast` | `hsla(18, 43%, 69%, 0.35)` | src/styles/_variables.scss:222 |
| `--tt-color-text-orange-contrast` | `hsla(24, 73%, 55%, 0.27)` | src/styles/_variables.scss:223 |
| `--tt-color-text-yellow-contrast` | `hsla(44, 82%, 59%, 0.39)` | src/styles/_variables.scss:224 |
| `--tt-color-text-green-contrast` | `hsla(126, 29%, 60%, 0.27)` | src/styles/_variables.scss:225 |
| `--tt-color-text-blue-contrast` | `hsla(202, 54%, 59%, 0.27)` | src/styles/_variables.scss:226 |
| `--tt-color-text-purple-contrast` | `hsla(274, 37%, 64%, 0.27)` | src/styles/_variables.scss:227 |
| `--tt-color-text-pink-contrast` | `hsla(331, 60%, 71%, 0.27)` | src/styles/_variables.scss:228 |
| `--tt-color-text-red-contrast` | `hsla(8, 79%, 79%, 0.4)` | src/styles/_variables.scss:229 |
| `--tt-color-text-gray` | `hsl(0, 0%, 61%)` | src/styles/_variables.scss:233 |
| `--tt-color-text-brown` | `hsl(18, 35%, 58%)` | src/styles/_variables.scss:234 |
| `--tt-color-text-orange` | `hsl(25, 53%, 53%)` | src/styles/_variables.scss:235 |
| `--tt-color-text-yellow` | `hsl(36, 54%, 55%)` | src/styles/_variables.scss:236 |
| `--tt-color-text-green` | `hsl(145, 32%, 47%)` | src/styles/_variables.scss:237 |
| `--tt-color-text-blue` | `hsl(202, 64%, 52%)` | src/styles/_variables.scss:238 |
| `--tt-color-text-purple` | `hsl(270, 55%, 62%)` | src/styles/_variables.scss:239 |
| `--tt-color-text-pink` | `hsl(329, 57%, 58%)` | src/styles/_variables.scss:240 |
| `--tt-color-text-red` | `hsl(1, 69%, 60%)` | src/styles/_variables.scss:241 |
| `--tt-color-text-gray-contrast` | `hsla(0, 0%, 100%, 0.09)` | src/styles/_variables.scss:242 |
| `--tt-color-text-brown-contrast` | `hsla(17, 45%, 50%, 0.25)` | src/styles/_variables.scss:244 |
| `--tt-color-text-orange-contrast` | `hsla(27, 82%, 53%, 0.2)` | src/styles/_variables.scss:245 |
| `--tt-color-text-yellow-contrast` | `hsla(35, 49%, 47%, 0.2)` | src/styles/_variables.scss:246 |
| `--tt-color-text-green-contrast` | `hsla(151, 55%, 39%, 0.2)` | src/styles/_variables.scss:247 |
| `--tt-color-text-blue-contrast` | `hsla(202, 54%, 43%, 0.2)` | src/styles/_variables.scss:248 |
| `--tt-color-text-purple-contrast` | `hsla(271, 56%, 60%, 0.18)` | src/styles/_variables.scss:249 |
| `--tt-color-text-pink-contrast` | `hsla(331, 67%, 58%, 0.22)` | src/styles/_variables.scss:250 |
| `--tt-color-text-red-contrast` | `hsla(0, 67%, 60%, 0.25)` | src/styles/_variables.scss:251 |
| `--tt-color-highlight-yellow` | `#fef9c3` | src/styles/_variables.scss:256 |
| `--tt-color-highlight-green` | `#dcfce7` | src/styles/_variables.scss:257 |
| `--tt-color-highlight-blue` | `#e0f2fe` | src/styles/_variables.scss:258 |
| `--tt-color-highlight-purple` | `#f3e8ff` | src/styles/_variables.scss:259 |
| `--tt-color-highlight-red` | `#ffe4e6` | src/styles/_variables.scss:260 |
| `--tt-color-highlight-gray` | `rgb(248, 248, 247)` | src/styles/_variables.scss:261 |
| `--tt-color-highlight-brown` | `rgb(244, 238, 238)` | src/styles/_variables.scss:262 |
| `--tt-color-highlight-orange` | `rgb(251, 236, 221)` | src/styles/_variables.scss:263 |
| `--tt-color-highlight-pink` | `rgb(252, 241, 246)` | src/styles/_variables.scss:264 |
| `--tt-color-highlight-yellow-contrast` | `#fbe604` | src/styles/_variables.scss:265 |
| `--tt-color-highlight-green-contrast` | `#c7fad8` | src/styles/_variables.scss:267 |
| `--tt-color-highlight-blue-contrast` | `#ceeafd` | src/styles/_variables.scss:268 |
| `--tt-color-highlight-purple-contrast` | `#e4ccff` | src/styles/_variables.scss:269 |
| `--tt-color-highlight-red-contrast` | `#ffccd0` | src/styles/_variables.scss:270 |
| `--tt-color-highlight-gray-contrast` | `rgba(84, 72, 49, 0.15)` | src/styles/_variables.scss:271 |
| `--tt-color-highlight-brown-contrast` | `rgba(210, 162, 141, 0.35)` | src/styles/_variables.scss:272 |
| `--tt-color-highlight-orange-contrast` | `rgba(224, 124, 57, 0.27)` | src/styles/_variables.scss:273 |
| `--tt-color-highlight-pink-contrast` | `rgba(225, 136, 179, 0.27)` | src/styles/_variables.scss:274 |
| `--tt-color-highlight-yellow` | `#6b6524` | src/styles/_variables.scss:278 |
| `--tt-color-highlight-green` | `#509568` | src/styles/_variables.scss:279 |
| `--tt-color-highlight-blue` | `#6e92aa` | src/styles/_variables.scss:280 |
| `--tt-color-highlight-purple` | `#583e74` | src/styles/_variables.scss:281 |
| `--tt-color-highlight-red` | `#743e42` | src/styles/_variables.scss:282 |
| `--tt-color-highlight-gray` | `rgb(47, 47, 47)` | src/styles/_variables.scss:283 |
| `--tt-color-highlight-brown` | `rgb(74, 50, 40)` | src/styles/_variables.scss:284 |
| `--tt-color-highlight-orange` | `rgb(92, 59, 35)` | src/styles/_variables.scss:285 |
| `--tt-color-highlight-pink` | `rgb(78, 44, 60)` | src/styles/_variables.scss:286 |
| `--tt-color-highlight-yellow-contrast` | `#58531e` | src/styles/_variables.scss:287 |
| `--tt-color-highlight-green-contrast` | `#47855d` | src/styles/_variables.scss:289 |
| `--tt-color-highlight-blue-contrast` | `#5e86a1` | src/styles/_variables.scss:290 |
| `--tt-color-highlight-purple-contrast` | `#4c3564` | src/styles/_variables.scss:291 |
| `--tt-color-highlight-red-contrast` | `#643539` | src/styles/_variables.scss:292 |
| `--tt-color-highlight-gray-contrast` | `rgba(255, 255, 255, 0.094)` | src/styles/_variables.scss:293 |
| `--tt-color-highlight-brown-contrast` | `rgba(184, 101, 69, 0.25)` | src/styles/_variables.scss:294 |
| `--tt-color-highlight-orange-contrast` | `rgba(233, 126, 37, 0.2)` | src/styles/_variables.scss:295 |
| `--tt-color-highlight-pink-contrast` | `rgba(220, 76, 145, 0.22)` | src/styles/_variables.scss:296 |
| `--paper` | `#fff` | src/styles.css:1 |
| `--sidebar` | `#f9f9f9` | src/styles.css:1 |
| `--surface` | `#fff` | src/styles.css:1 |
| `--ink` | `#0d0d0d` | src/styles.css:1 |
| `--secondary` | `#666` | src/styles.css:1 |
| `--muted` | `#777` | src/styles.css:1 |
| `--line` | `#e9e9e9` | src/styles.css:1 |
| `--hover` | `rgba(0, 0, 0, 0.05)` | src/styles.css:1 |
| `--accent` | `#0d0d0d` | src/styles.css:1 |
| `--accent-text` | `#fff` | src/styles.css:1 |
| `--danger` | `#b42318` | src/styles.css:1 |
| `--radius` | `12px` | src/styles.css:1 |
| `--modal-backdrop` | `rgba(229,231,235,.5)` | src/styles.css:1 |
| `--paper` | `#212121` | src/styles.css:2 |
| `--sidebar` | `#171717` | src/styles.css:2 |
| `--surface` | `#2f2f2f` | src/styles.css:2 |
| `--ink` | `#ececec` | src/styles.css:2 |
| `--secondary` | `#b4b4b4` | src/styles.css:2 |
| `--muted` | `#a0a0a0` | src/styles.css:2 |
| `--line` | `#383838` | src/styles.css:2 |
| `--hover` | `#303030` | src/styles.css:2 |
| `--accent` | `#f4f4f4` | src/styles.css:2 |
| `--accent-text` | `#111` | src/styles.css:2 |
| `--danger` | `#ff938a` | src/styles.css:2 |
| `--modal-backdrop` | `rgba(0,0,0,.5)` | src/styles.css:2 |
| `--surface` | `#171717` | src/styles.css:78 |
| `--paper` | `#242424` | src/styles.css:79 |
| `--ink` | `#f5f5f5` | src/styles.css:80 |
| `--secondary` | `#e5e5e5` | src/styles.css:81 |
| `--muted` | `#aaa` | src/styles.css:82 |
| `--line` | `#383838` | src/styles.css:83 |
| `--hover` | `#383838` | src/styles.css:84 |
| `--danger` | `#ff938a` | src/styles.css:85 |
| `--surface` | `#171717` | src/styles.css:126 |
| `--paper` | `#242424` | src/styles.css:127 |
| `--ink` | `#f5f5f5` | src/styles.css:128 |
| `--secondary` | `#e5e5e5` | src/styles.css:129 |
| `--muted` | `#aaa` | src/styles.css:130 |
| `--line` | `#383838` | src/styles.css:131 |
| `--hover` | `#383838` | src/styles.css:132 |
| `--danger` | `#ff938a` | src/styles.css:133 |
| `--confirmation-radius` | `24px` | src/styles.css:186 |
| `--confirmation-backdrop-blur` | `4px` | src/styles.css:186 |
| `--destructive-bg` | `#e32136` | src/styles.css:186 |
| `--destructive-text` | `#fff` | src/styles.css:186 |
| `--destructive-hover-bg` | `#c9192c` | src/styles.css:186 |
| `--modal-scroll-inset` | `8px` | src/styles.css:245 |
| `--modal-scale-close` | `1` | src/styles.css:260 |
| `--palette-start` | `#fff` | src/themes.css:12 |
| `--palette-middle` | `#fff` | src/themes.css:13 |
| `--palette-end` | `#fff` | src/themes.css:14 |
| `--palette-angle` | `180deg` | src/themes.css:15 |
| `--palette-strength` | `0%` | src/themes.css:16 |
| `--sidebar-palette-strength` | `0%` | src/themes.css:17 |
| `--palette-start` | `#fcfcfc` | src/themes.css:23 |
| `--palette-middle` | `#f9f9f9` | src/themes.css:23 |
| `--palette-end` | `#f9f9f9` | src/themes.css:23 |
| `--palette-angle` | `180deg` | src/themes.css:23 |
| `--sidebar-palette-strength` | `100%` | src/themes.css:23 |
| `--palette-start` | `#171717` | src/themes.css:24 |
| `--palette-middle` | `#222` | src/themes.css:24 |
| `--palette-end` | `#303030` | src/themes.css:24 |
| `--sidebar-palette-strength` | `100%` | src/themes.css:24 |
| `--palette-start` | `#ecf3f8` | src/themes.css:25 |
| `--palette-middle` | `#c5eafe` | src/themes.css:25 |
| `--palette-end` | `#a2d3ff` | src/themes.css:25 |
| `--accent` | `#24669a` | src/themes.css:25 |
| `--palette-start` | `#eaddff` | src/themes.css:26 |
| `--palette-middle` | `#f4dcdf` | src/themes.css:26 |
| `--palette-end` | `#ffdbc5` | src/themes.css:26 |
| `--palette-angle` | `180deg` | src/themes.css:26 |
| `--accent` | `#7353a6` | src/themes.css:26 |
| `--palette-start` | `#ecf4f1` | src/themes.css:27 |
| `--palette-middle` | `#c4f1e0` | src/themes.css:27 |
| `--palette-end` | `#90e3c6` | src/themes.css:27 |
| `--accent` | `#25745b` | src/themes.css:27 |
| `--palette-start` | `#fcf2f3` | src/themes.css:28 |
| `--palette-middle` | `#ffd9df` | src/themes.css:28 |
| `--palette-end` | `#ffb6bf` | src/themes.css:28 |
| `--accent` | `#a44760` | src/themes.css:28 |
| `--palette-start` | `#f8f0ec` | src/themes.css:29 |
| `--palette-middle` | `#ffdbc5` | src/themes.css:29 |
| `--palette-end` | `#febd99` | src/themes.css:29 |
| `--accent` | `#995631` | src/themes.css:29 |
| `--palette-strength` | `28%` | src/themes.css:30 |
| `--sidebar-palette-strength` | `50%` | src/themes.css:31 |
| `--accent-text` | `#fff` | src/themes.css:32 |
| `--secondary` | `color-mix(in srgb,var(--accent) 35%,#404040)` | src/themes.css:33 |
| `--muted` | `color-mix(in srgb,var(--accent) 30%,#555)` | src/themes.css:34 |
| `--line` | `color-mix(in srgb,var(--accent) 28%,var(--surface))` | src/themes.css:35 |
| `--hover` | `color-mix(in srgb,var(--accent) 10%,transparent)` | src/themes.css:36 |
| `--surface` | `color-mix(in srgb,var(--accent) 2%,#fff)` | src/themes.css:37 |
| `--sidebar` | `color-mix(in srgb,var(--accent) 5%,#f9f9f9)` | src/themes.css:38 |
| `--palette-strength` | `7%` | src/themes.css:41 |
| `--sidebar-palette-strength` | `12%` | src/themes.css:42 |
| `--accent-text` | `#111` | src/themes.css:43 |
| `--secondary` | `color-mix(in srgb,var(--accent) 20%,#ccc)` | src/themes.css:44 |
| `--muted` | `color-mix(in srgb,var(--accent) 20%,#aaa)` | src/themes.css:45 |
| `--line` | `color-mix(in srgb,var(--accent) 24%,var(--surface))` | src/themes.css:46 |
| `--hover` | `color-mix(in srgb,var(--accent) 14%,transparent)` | src/themes.css:47 |
| `--surface` | `color-mix(in srgb,var(--accent) 3%,#2f2f2f)` | src/themes.css:48 |
| `--sidebar` | `color-mix(in srgb,var(--accent) 4%,#171717)` | src/themes.css:49 |
| `--accent` | `#a2d3ff` | src/themes.css:52 |
| `--accent` | `#d8bfff` | src/themes.css:53 |
| `--accent` | `#90e3c6` | src/themes.css:54 |
| `--accent` | `#ffb6bf` | src/themes.css:55 |
| `--accent` | `#febd99` | src/themes.css:56 |
