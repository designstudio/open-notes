# Benchmark Open Notes

Execução: 2026-10-20T03:04:27.092Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 34.2 / 38.6 | 270.5 / 286.5 | 521.5 / 569.9 |
| load | 35.2 / 36.2 | 178.8 / 180.2 | 369.5 / 392.2 |
| unchangedSave | 4.4 / 5.6 | 2.8 / 4.1 | 5.3 / 6.4 |
| editOne | 0.8 / 1.2 | 2.5 / 2.9 | 5.4 / 5.7 |
| createOne | 1.1 / 1.3 | 3.3 / 3.9 | 5.9 / 8.0 |
| deleteOne | 0.8 / 1.0 | 3.0 / 3.4 | 6.4 / 25.6 |
| selectWorkspace | 0.2 / 0.7 | 2.3 / 52.6 | 6.8 / 8.4 |
| fingerprint | 10.8 / 12.2 | 59.2 / 64.8 | 131.3 / 159.7 |
| compareSame | 21.0 / 22.8 | 126.0 / 151.8 | 297.9 / 347.6 |
| compareConflict | 26.7 / 35.4 | 154.8 / 199.8 | 401.3 / 413.4 |
| serializeUpload | 1.6 / 2.0 | 15.7 / 18.9 | 32.1 / 34.6 |
| backupTwoCopies | 21.7 / 29.2 | 130.8 / 221.5 | 397.6 / 421.6 |
| UI: libraryStartup | 269.3 / 292.5 | 635.8 / 659.5 | 1042.7 / 1063.4 |
| UI: renderAllNotes | 904.6 / 975.3 | 3391.5 / 3624.4 | 6786.0 / 7185.8 |
| UI: searchRare | 127.4 / 151.0 | 690.5 / 804.5 | 1346.4 / 1468.8 |
| UI: clearSearch | 599.8 / 633.7 | 3874.3 / 3979.4 | 6899.9 / 7126.2 |
| UI: openEditor | 197.2 / 229.5 | 989.0 / 1033.1 | 1678.9 / 1732.1 |
| UI: editTitleToPersistence | 81.1 / 83.9 | 182.2 / 183.1 | 285.6 / 298.4 |
| UI DOM: nodes at library startup | 2245 | 10245 | 20245 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
