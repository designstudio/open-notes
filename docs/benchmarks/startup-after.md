# Benchmark Open Notes

Execução: 2026-10-19T02:01:17.022Z. Chromium 156.0.8078.4, win32 x64, 3 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas |
| --- | ---: |
| initialSave | 32.2 / 33.1 |
| load | 28.3 / 29.0 |
| unchangedSave | 4.0 / 4.0 |
| editOne | 0.9 / 0.9 |
| createOne | 0.9 / 1.0 |
| deleteOne | 0.7 / 0.9 |
| selectWorkspace | 0.4 / 0.4 |
| fingerprint | 11.8 / 12.8 |
| compareSame | 17.2 / 18.8 |
| compareConflict | 24.4 / 25.2 |
| serializeUpload | 1.6 / 2.0 |
| backupTwoCopies | 22.7 / 29.7 |
| UI: libraryStartup | 251.8 / 253.1 |
| UI: renderAllNotes | 873.6 / 887.8 |
| UI: searchRare | 126.1 / 126.7 |
| UI: clearSearch | 535.0 / 551.3 |
| UI: openEditor | 197.3 / 214.8 |
| UI: editTitleToPersistence | 65.8 / 80.2 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
