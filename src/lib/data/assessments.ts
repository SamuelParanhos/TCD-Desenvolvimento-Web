import type { AttitudeAssessment, AttitudeScore, ISODateTime } from "../../types/domain";
import { MOCK_ATTITUDE_CATEGORIES } from "./categories";
import { MOCK_STUDENTS } from "./students";
import { MOCK_TEACHERS } from "./teachers";

const scorePatterns: readonly (readonly AttitudeScore[])[] = [
  [5, 4, 5, 4, 5],
  [4, 4, 5, 3, 4],
  [3, 5, 4, 5, 4],
  [4, 3, 4, 4, 3],
  [5, 5, 5, 5, 4],
  [2, 3, 4, 3, 2],
  [4, 5, 5, 5, 4],
  [3, 3, 4, 3, 4],
  [5, 4, 5, 5, 5],
  [3, 4, 4, 4, 3],
  [4, 4, 5, 4, 4],
  [2, 1, 3, 2, 3],
  [5, 5, 4, 5, 5],
  [4, 3, 4, 3, 4],
  [3, 2, 4, 3, 3],
  [4, 5, 4, 4, 5],
];

const observations: readonly (string | null)[] = [
  "Organizou o material e iniciou a atividade no horário combinado.",
  "Compartilhou ideias e escutou as contribuições da turma.",
  "Demonstrou cuidado e respeito na convivência com os colegas.",
  "Colaborou com o grupo na divisão das tarefas.",
  null,
];

/**
 * 80 registros fictícios, determinísticos: cinco dimensões para 16 estudantes.
 * Dois estudantes sem registros exercitam o caso de ausência de avaliações.
 * As avaliações precedem as alterações de status de 20/11/2026.
 */
export const MOCK_ASSESSMENTS: readonly Readonly<AttitudeAssessment>[] = Object.freeze(
  MOCK_STUDENTS.slice(0, 16).flatMap((student, studentIndex) =>
    MOCK_ATTITUDE_CATEGORIES.map((category, categoryIndex) => {
      // toISOString garante o formato UTC; a construção usa somente datas válidas.
      const assessedAt = new Date(Date.UTC(2026, 10, 9 + studentIndex % 4, 13, categoryIndex * 10)).toISOString() as ISODateTime;
      return Object.freeze({
        id: `50000000-0000-4000-8000-${String(studentIndex * 5 + categoryIndex + 1).padStart(12, "0")}`,
        studentId: student.id,
        teacherId: MOCK_TEACHERS[studentIndex % MOCK_TEACHERS.length]!.id,
        categoryId: category.id,
        score: scorePatterns[studentIndex]![categoryIndex]!,
        assessedAt,
        observation: observations[categoryIndex]!,
        createdAt: assessedAt,
        updatedAt: assessedAt,
      } satisfies AttitudeAssessment);
    }),
  ),
);
