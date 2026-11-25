import type { AttitudeCategory } from "../../types/domain";

export const MOCK_ATTITUDE_CATEGORIES: readonly Readonly<AttitudeCategory>[] = Object.freeze([
  Object.freeze({ id: "30000000-0000-4000-8000-000000000001", name: "Pontualidade", description: "Cumpre os horários combinados e se organiza para iniciar as atividades.", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies AttitudeCategory),
  Object.freeze({ id: "30000000-0000-4000-8000-000000000002", name: "Participação", description: "Contribui com perguntas, ideias e escuta durante as atividades propostas.", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies AttitudeCategory),
  Object.freeze({ id: "30000000-0000-4000-8000-000000000003", name: "Respeito", description: "Respeita as diferenças, a fala dos colegas e os acordos de convivência.", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies AttitudeCategory),
  Object.freeze({ id: "30000000-0000-4000-8000-000000000004", name: "Colaboração", description: "Coopera com o grupo e compartilha responsabilidades nas tarefas coletivas.", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies AttitudeCategory),
  Object.freeze({ id: "30000000-0000-4000-8000-000000000005", name: "Responsabilidade", description: "Cuida dos materiais, cumpre combinados e entrega as atividades propostas.", createdAt: "2026-02-02T12:00:00.000Z", updatedAt: "2026-02-02T12:00:00.000Z" } satisfies AttitudeCategory),
]);
