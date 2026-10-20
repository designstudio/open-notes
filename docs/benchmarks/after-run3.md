# Benchmark Open Notes

Execução: 2026-10-20T03:02:34.007Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 37.9 / 41.6 | 230.1 / 256.5 | 486.3 / 498.5 |
| load | 31.5 / 36.3 | 161.4 / 181.6 | 314.4 / 345.2 |
| unchangedSave | 4.7 / 5.0 | 2.9 / 17.3 | 4.6 / 4.7 |
| editOne | 1.0 / 1.2 | 2.5 / 3.1 | 3.9 / 4.3 |
| createOne | 1.0 / 1.1 | 3.1 / 7.6 | 5.5 / 6.9 |
| deleteOne | 0.9 / 0.9 | 2.7 / 3.8 | 5.3 / 6.0 |
| selectWorkspace | 0.4 / 0.6 | 1.7 / 2.1 | 5.2 / 5.4 |
| fingerprint | 12.9 / 16.2 | 48.5 / 56.2 | 103.4 / 110.0 |
| compareSame | 22.2 / 24.4 | 106.8 / 123.7 | 219.5 / 233.5 |
| compareConflict | 27.9 / 29.2 | 168.6 / 228.8 | 293.5 / 306.1 |
| serializeUpload | 1.6 / 2.4 | 12.8 / 15.1 | 27.0 / 28.6 |
| backupTwoCopies | 23.2 / 27.7 | 115.0 / 136.5 | 338.3 / 361.0 |
| UI: libraryStartup | 199.3 / 235.2 | 360.9 / 406.7 | 650.4 / 654.5 |
| UI: renderAllNotes | 840.2 / 893.7 | 3642.0 / 3896.7 | 9638.3 / 10601.9 |
| UI: searchRare | 127.2 / 137.5 | 566.1 / 604.2 | 1525.2 / 1669.1 |
| UI: clearSearch | 551.4 / 582.0 | 2994.9 / 3158.3 | 8173.0 / 8337.7 |
| UI: openEditor | 197.8 / 229.3 | 828.8 / 872.8 | 2051.9 / 2196.6 |
| UI: editTitleToPersistence | 65.9 / 66.4 | 149.2 / 318.0 | 313.9 / 334.7 |
| UI DOM: nodes at library startup | 244 | 244 | 244 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
