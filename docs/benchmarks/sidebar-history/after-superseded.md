# Benchmark Open Notes

Execução: 2026-10-20T00:47:42.681Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 47.0 / 55.7 | 337.0 / 408.0 | 616.6 / 655.3 |
| load | 42.5 / 45.7 | 199.2 / 244.3 | 399.7 / 461.1 |
| unchangedSave | 7.4 / 7.9 | 3.6 / 19.3 | 5.2 / 7.3 |
| editOne | 1.6 / 1.7 | 3.2 / 4.3 | 5.3 / 6.1 |
| createOne | 1.5 / 1.8 | 4.0 / 4.9 | 7.1 / 8.9 |
| deleteOne | 1.4 / 1.6 | 3.6 / 4.2 | 6.4 / 6.9 |
| selectWorkspace | 0.6 / 0.7 | 2.9 / 3.1 | 9.7 / 12.1 |
| fingerprint | 23.5 / 37.4 | 71.5 / 74.3 | 142.7 / 150.6 |
| compareSame | 25.7 / 36.0 | 149.7 / 181.6 | 291.7 / 329.7 |
| compareConflict | 36.0 / 48.6 | 209.5 / 259.1 | 404.1 / 425.3 |
| serializeUpload | 2.9 / 5.4 | 23.1 / 30.5 | 35.8 / 38.5 |
| backupTwoCopies | 37.4 / 46.7 | 186.7 / 193.3 | 457.8 / 477.1 |
| UI: libraryStartup | 270.6 / 298.2 | 490.7 / 503.7 | 785.3 / 2434.3 |
| UI: renderAllNotes | 1180.3 / 1277.6 | 5275.7 / 5382.7 | 9556.1 / 10063.6 |
| UI: searchRare | 169.0 / 192.8 | 739.0 / 755.2 | 1733.2 / 1739.5 |
| UI: clearSearch | 770.0 / 819.0 | 4147.1 / 4354.3 | 9360.5 / 9946.2 |
| UI: openEditor | 295.9 / 328.2 | 1076.0 / 1149.8 | 2176.1 / 2212.1 |
| UI: editTitleToPersistence | 81.5 / 83.9 | 199.5 / 216.0 | 363.3 / 365.7 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
