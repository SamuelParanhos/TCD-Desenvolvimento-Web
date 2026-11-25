import type { Classroom } from "../../types/domain";

/** Turmas fictícias. Cada nome é único dentro de um ano letivo. */
export const MOCK_CLASSROOMS: readonly Readonly<Classroom>[] = Object.freeze([
  Object.freeze({ id: "10000000-0000-4000-8000-000000000001", name: "1º ano A", schoolYear: 2026, createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies Classroom),
  Object.freeze({ id: "10000000-0000-4000-8000-000000000002", name: "2º ano A", schoolYear: 2026, createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies Classroom),
  Object.freeze({ id: "10000000-0000-4000-8000-000000000003", name: "3º ano A", schoolYear: 2026, createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies Classroom),
]);
