# Benchmark Open Notes

Execução: 2026-10-19T01:55:50.537Z. Chromium 156.0.8078.4, win32 x64, 3 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas |
| --- | ---: |
| initialSave | 30.6 / 37.3 |
| load | 29.2 / 29.8 |
| unchangedSave | 3.3 / 4.3 |
| editOne | 0.9 / 1.0 |
| createOne | 1.0 / 1.0 |
| deleteOne | 0.8 / 0.8 |
| selectWorkspace | 0.2 / 0.3 |
| fingerprint | 11.5 / 20.0 |
| compareSame | 17.2 / 21.1 |
| compareConflict | 24.1 / 24.2 |
| serializeUpload | 1.8 / 2.1 |
| backupTwoCopies | 20.6 / 21.3 |
| UI: libraryStartup | 297.6 / 305.4 |
| UI: renderAllNotes | 841.1 / 857.0 |
| UI: searchRare | 125.8 / 140.1 |
| UI: clearSearch | 569.5 / 584.6 |
| UI: openEditor | 196.8 / 211.8 |
| UI: editTitleToPersistence | 65.6 / 66.9 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
