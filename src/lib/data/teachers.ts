import type { Teacher } from "../../types/domain";

/** Pessoas fictícias; example.com é um domínio reservado para exemplos. */
export const MOCK_TEACHERS: readonly Readonly<Teacher>[] = Object.freeze([
  Object.freeze({ id: "20000000-0000-4000-8000-000000000001", name: "Helena Costa", email: "helena.costa@example.com", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies Teacher),
  Object.freeze({ id: "20000000-0000-4000-8000-000000000002", name: "Rafael Mendes", email: "rafael.mendes@example.com", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies Teacher),
  Object.freeze({ id: "20000000-0000-4000-8000-000000000003", name: "Beatriz Souza", email: "beatriz.souza@example.com", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies Teacher),
]);
