# Benchmark Open Notes

Execução: 2026-10-20T03:17:02.985Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 40.4 / 46.2 | 235.7 / 255.3 | 501.2 / 680.9 |
| load | 33.3 / 36.9 | 152.7 / 167.1 | 320.6 / 342.3 |
| unchangedSave | 4.6 / 5.3 | 2.4 / 3.5 | 5.0 / 5.8 |
| editOne | 1.1 / 1.6 | 2.2 / 2.7 | 4.3 / 4.9 |
| createOne | 1.1 / 1.3 | 3.1 / 3.9 | 6.8 / 7.1 |
| deleteOne | 0.9 / 1.1 | 2.6 / 3.4 | 5.6 / 6.5 |
| selectWorkspace | 0.3 / 0.7 | 2.0 / 3.1 | 5.4 / 5.7 |
| fingerprint | 11.8 / 18.5 | 55.2 / 64.5 | 105.6 / 121.2 |
| compareSame | 19.0 / 23.6 | 115.0 / 178.4 | 224.3 / 305.3 |
| compareConflict | 26.2 / 34.0 | 148.3 / 206.5 | 310.2 / 539.1 |
| serializeUpload | 1.6 / 2.6 | 13.6 / 14.1 | 28.0 / 55.4 |
| backupTwoCopies | 22.3 / 30.7 | 120.6 / 152.9 | 357.0 / 750.3 |
| UI: libraryStartup | 263.2 / 396.3 | 621.6 / 720.2 | 1039.7 / 1132.4 |
| UI: renderAllNotes | 837.4 / 904.4 | 3449.2 / 3637.6 | 6738.0 / 7266.8 |
| UI: searchRare | 131.4 / 144.7 | 619.5 / 625.1 | 1313.3 / 1426.7 |
| UI: clearSearch | 566.3 / 583.6 | 3244.1 / 3256.3 | 7052.9 / 7287.9 |
| UI: openEditor | 196.1 / 197.7 | 787.1 / 867.3 | 1697.8 / 1785.3 |
| UI: editTitleToPersistence | 67.1 / 82.9 | 164.9 / 168.2 | 283.1 / 289.4 |
| UI DOM: nodes at library startup | 2245 | 10245 | 20245 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
