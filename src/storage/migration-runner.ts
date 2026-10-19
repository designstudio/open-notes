export type MigrationContext = {
  database: IDBDatabase;
  transaction: IDBTransaction;
  /** Queue IndexedDB work; exceptions and request failures abort the upgrade. */
  request<T>(request: IDBRequest<T>, success: (value: T) => void): void;
};

export type DatabaseMigration = {
  /** Destination version. Every integer from 1 to the target must be present. */
  version: number;
  name: string;
  /** Call done last, from the final IndexedDB callback. Never await external work. */
  upgrade(context: MigrationContext, done: () => void): void;
  /** Read back the persisted result, inside the same versionchange transaction. */
  validate(context: MigrationContext, done: () => void): void;
};

export class DatabaseCompatibilityError extends Error {
  constructor(cause: unknown) {
    super('Este banco foi atualizado por uma versão mais recente do Open Notes. Atualize o aplicativo para abrir suas notas. Os dados foram preservados.', { cause });
    this.name = 'DatabaseCompatibilityError';
  }
}

type DatabasePlan = { name: string; version: number; migrations: readonly DatabaseMigration[] };

function requireSynchronous(result: unknown) {
  if (result === undefined) return;
  // A rejected async function must not also become an unhandled rejection
  // after its forbidden return value has already caused a safe rollback.
  if (result instanceof Promise) void result.catch(() => {});
  throw new Error('Migrações e callbacks devem ser síncronos, sem Promises ou retornos assíncronos.');
}

function migrationPlan({ version, migrations }: DatabasePlan) {
  if (!Number.isSafeInteger(version) || version < 1 || migrations.length !== version ||
      Array.from({ length: version }, (_, index) => migrations[index]).some((step, index) => !step || step.version !== index + 1 || !step.name ||
        typeof step.upgrade !== 'function' || typeof step.validate !== 'function')) {
    throw new Error('Plano de migração inválido: as versões devem ser sequenciais, sem lacunas ou duplicações.');
  }
}

/** All pending steps share the one atomic transaction supplied by IndexedDB. */
export function openVersionedDatabase(factory: IDBFactory, plan: DatabasePlan): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    migrationPlan(plan);
    let abandoned = false;
    let migrationError: unknown;
    const request = factory.open(plan.name, plan.version);
    request.onupgradeneeded = event => {
      const database = request.result;
      const transaction = request.transaction!;
      if (abandoned) { transaction.abort(); return; }
      let failed = false;
      let finished = false;
      let pending = 0;
      let phase = '';
      const fail = (error: unknown) => {
        if (failed) return;
        failed = true;
        migrationError = error;
        try { transaction.abort(); } catch { /* A failed IDB request may already have aborted it. */ }
      };
      const guard = (operation: () => void) => {
        if (failed) return;
        try {
          operation();
          // Abort while the transaction is still active, before IDB can
          // auto-commit a step that forgot its final validation callback.
          if (!finished && pending === 0) throw new Error(`Migração incompleta (${phase}).`);
        } catch (error) { fail(error); }
      };
      const context: MigrationContext = {
        database, transaction,
        request(operation, success) {
          pending++;
          operation.addEventListener('success', () => {
            pending--;
            guard(() => {
              const result: unknown = success(operation.result);
              requireSynchronous(result);
            });
          }, { once: true });
          operation.addEventListener('error', () => fail(operation.error), { once: true });
        },
      };
      const invoke = (step: DatabaseMigration, method: 'upgrade' | 'validate', next: () => void) => guard(() => {
        phase = `${step.version}: ${step.name} / ${method}`;
        let called = false;
        const result: unknown = step[method](context, () => guard(() => {
          if (called) throw new Error(`Conclusão duplicada da migração ${step.version}.`);
          called = true;
          next();
        }));
        requireSynchronous(result);
      });
      const advance = (index: number) => {
        if (index === plan.migrations.length) { finished = true; return; }
        const step = plan.migrations[index];
        invoke(step, 'upgrade', () => invoke(step, 'validate', () => advance(index + 1)));
      };
      const oldVersion = event.oldVersion;
      // Validate the source before touching it; a malformed old DB is not a
      // fresh install and must never be silently replaced with example notes.
      if (oldVersion) invoke(plan.migrations[oldVersion - 1], 'validate', () => advance(oldVersion));
      else advance(0);
    };
    request.onsuccess = () => {
      const database = request.result;
      if (abandoned || migrationError) {
        database.close();
        if (migrationError) reject(migrationError);
        return;
      }
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(migrationError || (request.error?.name === 'VersionError'
      ? new DatabaseCompatibilityError(request.error) : request.error));
    request.onblocked = () => {
      abandoned = true;
      reject(new Error('Feche outras abas do Open Notes e tente novamente.'));
    };
  });
}
