# Benchmark Open Notes

Execução: 2026-10-20T02:58:57.240Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 32.4 / 33.7 | 239.3 / 271.9 | 480.1 / 489.2 |
| load | 30.9 / 32.7 | 139.0 / 164.9 | 322.3 / 345.4 |
| unchangedSave | 4.3 / 4.8 | 2.8 / 24.1 | 4.4 / 5.2 |
| editOne | 0.8 / 1.0 | 2.5 / 17.8 | 3.9 / 4.6 |
| createOne | 0.8 / 1.0 | 3.1 / 3.6 | 6.3 / 6.6 |
| deleteOne | 0.8 / 1.0 | 2.9 / 3.9 | 5.3 / 6.0 |
| selectWorkspace | 0.2 / 0.7 | 2.1 / 2.7 | 4.5 / 5.5 |
| fingerprint | 10.8 / 14.2 | 56.6 / 62.0 | 99.1 / 99.6 |
| compareSame | 17.8 / 22.1 | 117.5 / 118.9 | 215.1 / 240.4 |
| compareConflict | 25.2 / 27.5 | 156.4 / 157.7 | 295.2 / 329.6 |
| serializeUpload | 1.5 / 2.0 | 14.0 / 16.3 | 25.5 / 35.1 |
| backupTwoCopies | 20.6 / 32.7 | 131.1 / 140.7 | 328.1 / 372.6 |
| UI: libraryStartup | 185.2 / 254.3 | 366.1 / 398.6 | 581.4 / 584.9 |
| UI: renderAllNotes | 778.1 / 828.1 | 3781.8 / 3921.7 | 7884.0 / 8120.3 |
| UI: searchRare | 128.3 / 129.9 | 584.2 / 621.7 | 1332.4 / 1377.9 |
| UI: clearSearch | 532.4 / 550.7 | 2960.2 / 3160.1 | 6711.1 / 7008.7 |
| UI: openEditor | 211.9 / 229.0 | 788.9 / 853.6 | 1668.6 / 1755.8 |
| UI: editTitleToPersistence | 65.9 / 66.3 | 165.3 / 166.7 | 266.4 / 267.4 |
| UI DOM: nodes at library startup | 244 | 244 | 244 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
