# Benchmark Open Notes

Execução: 2026-10-20T01:41:41.806Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 30.1 / 32.6 | 225.7 / 274.5 | 502.1 / 516.6 |
| load | 26.1 / 28.2 | 146.1 / 148.8 | 305.0 / 316.0 |
| unchangedSave | 3.8 / 4.0 | 2.7 / 33.6 | 4.1 / 5.8 |
| editOne | 0.9 / 1.0 | 2.2 / 6.3 | 3.8 / 4.3 |
| createOne | 1.0 / 1.1 | 2.7 / 3.6 | 6.1 / 7.3 |
| deleteOne | 0.7 / 0.9 | 2.6 / 2.9 | 5.0 / 5.3 |
| selectWorkspace | 0.3 / 0.4 | 2.1 / 2.5 | 4.4 / 4.8 |
| fingerprint | 10.2 / 11.7 | 52.8 / 57.0 | 96.9 / 102.8 |
| compareSame | 17.6 / 21.3 | 106.3 / 115.2 | 216.1 / 236.4 |
| compareConflict | 24.8 / 25.2 | 141.7 / 146.2 | 287.7 / 300.1 |
| serializeUpload | 1.4 / 1.8 | 13.7 / 14.3 | 25.7 / 27.1 |
| backupTwoCopies | 23.3 / 28.3 | 114.4 / 122.4 | 229.1 / 333.4 |
| UI: libraryStartup | 187.3 / 188.5 | 336.8 / 356.9 | 544.7 / 549.3 |
| UI: renderAllNotes | 767.6 / 819.1 | 3553.9 / 3558.8 | 7476.8 / 7528.0 |
| UI: searchRare | 119.0 / 128.1 | 535.0 / 546.9 | 1300.1 / 1312.1 |
| UI: clearSearch | 515.0 / 518.3 | 2858.6 / 3159.4 | 6411.3 / 6800.1 |
| UI: openEditor | 181.5 / 196.8 | 756.4 / 769.2 | 1640.4 / 1726.6 |
| UI: editTitleToPersistence | 65.3 / 67.3 | 149.5 / 150.7 | 265.3 / 266.8 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
