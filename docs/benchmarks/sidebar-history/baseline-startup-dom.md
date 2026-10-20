# Benchmark Open Notes

Execução: 2026-10-20T02:42:13.503Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 33.2 / 36.9 | 239.3 / 271.7 | 498.9 / 505.9 |
| load | 33.1 / 38.4 | 156.2 / 167.3 | 322.6 / 331.7 |
| unchangedSave | 4.3 / 4.4 | 2.4 / 23.2 | 4.5 / 5.6 |
| editOne | 1.0 / 1.1 | 2.2 / 17.4 | 4.5 / 5.1 |
| createOne | 1.0 / 1.0 | 3.0 / 3.1 | 6.4 / 7.0 |
| deleteOne | 0.9 / 1.1 | 2.6 / 3.4 | 5.1 / 6.9 |
| selectWorkspace | 0.3 / 0.8 | 1.9 / 2.1 | 4.6 / 5.4 |
| fingerprint | 12.8 / 13.0 | 56.5 / 63.6 | 104.9 / 117.7 |
| compareSame | 21.6 / 24.1 | 112.5 / 128.7 | 237.5 / 261.4 |
| compareConflict | 27.4 / 35.0 | 151.4 / 162.8 | 315.6 / 320.9 |
| serializeUpload | 1.8 / 2.4 | 13.5 / 13.9 | 28.3 / 29.8 |
| backupTwoCopies | 22.6 / 29.7 | 118.8 / 133.3 | 338.9 / 396.4 |
| UI: libraryStartup | 244.1 / 265.1 | 631.3 / 659.0 | 1029.0 / 1221.4 |
| UI: renderAllNotes | 802.5 / 851.2 | 2967.6 / 3081.9 | 6694.9 / 6952.8 |
| UI: searchRare | 128.0 / 129.6 | 608.2 / 618.7 | 1315.4 / 1464.2 |
| UI: clearSearch | 534.4 / 567.4 | 2953.5 / 3131.1 | 6861.5 / 7043.0 |
| UI: openEditor | 197.7 / 229.2 | 815.5 / 844.3 | 1710.3 / 1828.3 |
| UI: editTitleToPersistence | 65.9 / 67.4 | 149.7 / 182.7 | 283.6 / 314.7 |
| UI DOM: nodes at library startup | 2245 | 10242 | 20245 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
