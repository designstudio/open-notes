# Benchmark Open Notes

Execução: 2026-10-20T01:36:22.615Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 30.3 / 32.0 | 235.1 / 279.0 | 508.0 / 537.4 |
| load | 29.2 / 30.2 | 155.6 / 159.2 | 328.2 / 335.5 |
| unchangedSave | 3.8 / 3.9 | 2.8 / 37.4 | 4.9 / 5.5 |
| editOne | 0.9 / 1.0 | 2.8 / 11.3 | 4.3 / 4.6 |
| createOne | 0.9 / 1.0 | 3.4 / 3.9 | 6.0 / 7.5 |
| deleteOne | 0.8 / 1.0 | 2.7 / 3.0 | 5.2 / 6.9 |
| selectWorkspace | 0.3 / 0.4 | 2.0 / 2.5 | 4.4 / 6.4 |
| fingerprint | 10.8 / 11.7 | 54.7 / 57.2 | 101.4 / 176.4 |
| compareSame | 17.4 / 19.4 | 108.5 / 119.7 | 227.2 / 242.1 |
| compareConflict | 23.8 / 24.3 | 147.0 / 158.4 | 294.0 / 322.9 |
| serializeUpload | 1.4 / 1.7 | 15.7 / 15.9 | 26.9 / 34.7 |
| backupTwoCopies | 20.7 / 24.4 | 117.9 / 121.3 | 246.9 / 262.0 |
| UI: libraryStartup | 236.7 / 275.9 | 625.3 / 681.6 | 1005.2 / 1057.0 |
| UI: renderAllNotes | 826.2 / 884.0 | 3239.5 / 3308.5 | 6434.3 / 8291.5 |
| UI: searchRare | 124.5 / 139.0 | 595.4 / 658.9 | 1360.9 / 1606.5 |
| UI: clearSearch | 518.6 / 567.9 | 3094.4 / 3221.2 | 6791.7 / 7252.5 |
| UI: openEditor | 180.7 / 196.1 | 819.6 / 860.3 | 1664.1 / 1885.4 |
| UI: editTitleToPersistence | 65.9 / 67.2 | 149.6 / 183.4 | 269.0 / 312.6 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
