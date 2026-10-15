# Histórico de alterações

## 2026-10-15

### Organização do aplicativo

- Separação do `App.tsx` em componentes de editor, cabeçalho, biblioteca, listagem, barra lateral e diálogos.
- Extração dos hooks de navegação, aparência, persistência, notificações e preferências.
- Preservação da sessão de edição durante substituições de módulos do Vite, evitando reaplicar a cópia antiga carregada ao abrir a aba.

### Persistência e recuperação

- IndexedDB versão 2 com registros individuais por nota e metadados separados para coleções, pastas, perfil e ordem das notas.
- Gravação somente das entidades alteradas, com fila de salvamentos e confirmação após o commit da transação.
- Migração automática do formato anterior com preservação do registro original e dos backups existentes.
- Página de consulta e exportação das notas e cópias de recuperação, sem escrita no armazenamento.

### Sincronização

- Novo envio automático quando uma edição feita durante um envio em andamento ainda estiver pendente após sua conclusão.
- Conclusão de requisições já emitidas respeita o estado de desconexão.
- Mantidas as escolhas explícitas de conflito e a preservação das versões antes de substituir dados.

### Testes e documentação

- Testes de migração, gravações granulares, rollback, filas e preservação de outras notas.
- Testes de integração de criação, edição, lixeira, restauração, exclusão permanente e integridade dos backups exportáveis.
- Testes de sincronização, conflitos, edições durante requisições, desconexão, modo offline, falhas HTTP e autorização.
- Suíte com 109 testes, usando armazenamento e API Google simulados; testes de integração não substituem E2E do navegador.
- Documentação de arquitetura, persistência, recuperação e testes, com navegação pelo README.
