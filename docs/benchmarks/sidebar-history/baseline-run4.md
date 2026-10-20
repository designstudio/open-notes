# Benchmark Open Notes

Execução: 2026-10-20T03:20:40.358Z. Chromium 156.0.8078.4, win32 x64, 5 amostras após uma rodada de aquecimento.

Tempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.

| Operação | 1000 notas | 5000 notas | 10000 notas |
| --- | ---: | ---: | ---: |
| initialSave | 35.3 / 40.2 | 246.2 / 576.6 | 504.7 / 512.7 |
| load | 31.3 / 34.1 | 163.8 / 178.4 | 331.7 / 339.7 |
| unchangedSave | 4.1 / 4.4 | 2.6 / 28.7 | 4.4 / 4.9 |
| editOne | 0.9 / 1.2 | 2.8 / 21.8 | 4.3 / 5.3 |
| createOne | 0.9 / 1.1 | 3.6 / 4.3 | 7.0 / 7.3 |
| deleteOne | 0.8 / 1.2 | 3.6 / 6.1 | 5.4 / 6.0 |
| selectWorkspace | 0.3 / 0.5 | 2.1 / 3.5 | 4.9 / 5.8 |
| fingerprint | 10.8 / 13.4 | 57.1 / 68.0 | 105.2 / 111.2 |
| compareSame | 19.5 / 23.2 | 116.8 / 120.9 | 258.5 / 265.1 |
| compareConflict | 26.3 / 26.9 | 147.7 / 157.5 | 332.7 / 343.5 |
| serializeUpload | 1.5 / 2.6 | 13.8 / 14.0 | 29.7 / 32.9 |
| backupTwoCopies | 23.3 / 26.7 | 123.1 / 128.1 | 356.5 / 397.0 |
| UI: libraryStartup | 249.7 / 270.0 | 633.0 / 671.8 | 1050.3 / 1122.8 |
| UI: renderAllNotes | 845.6 / 992.5 | 3297.1 / 4061.4 | 6401.0 / 6761.1 |
| UI: searchRare | 137.5 / 142.8 | 606.4 / 689.7 | 1322.1 / 1379.9 |
| UI: clearSearch | 569.8 / 618.5 | 3194.9 / 4097.0 | 6718.0 / 7193.4 |
| UI: openEditor | 210.8 / 212.6 | 852.2 / 1019.0 | 1702.1 / 1872.6 |
| UI: editTitleToPersistence | 67.2 / 82.9 | 164.4 / 182.4 | 285.3 / 331.9 |
| UI DOM: nodes at library startup | 2242 | 10245 | 20245 |

Dados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.
