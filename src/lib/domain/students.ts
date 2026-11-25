import type { AttitudeAssessment, AttitudeScore, Student, StudentStatus } from "../../types/domain";

export const statusLabels: Record<StudentStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  transferred: "Transferido",
};

export const scoreLabels: Record<AttitudeScore, string> = {
  1: "Necessita de apoio constante",
  2: "Em desenvolvimento",
  3: "Atende ao esperado",
  4: "Demonstra com consistência",
  5: "Demonstra com autonomia",
};

export type StudentFilters = {
  search?: string;
  status?: StudentStatus | "all";
  classroomId?: string;
  sort?: "name-asc" | "name-desc" | "registration";
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function filterStudents(students: readonly Student[], filters: StudentFilters = {}): Student[] {
  const search = normalize(filters.search ?? "");
  const result = students.filter((student) =>
    (!search || normalize(student.name).includes(search) || normalize(student.registration).includes(search))
    && (!filters.status || filters.status === "all" || student.status === filters.status)
    && (!filters.classroomId || filters.classroomId === "all" || student.classroomId === filters.classroomId),
  );
  return result.sort((left, right) => {
    if (filters.sort === "registration") return left.registration.localeCompare(right.registration, "pt-BR", { numeric: true });
    const comparison = left.name.localeCompare(right.name, "pt-BR");
    return filters.sort === "name-desc" ? -comparison : comparison;
  });
}

/** Média apenas das notas existentes; ausência de avaliações não equivale a zero. */
export function calculateAverage(scores: readonly number[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

export type StudentSummary = {
  assessmentCount: number;
  averageScore: number | null;
  lastAssessmentAt: string | null;
};

export function getStudentSummary(studentId: string, assessments: readonly AttitudeAssessment[]): StudentSummary {
  const selected = assessments.filter((assessment) => assessment.studentId === studentId);
  return {
    assessmentCount: selected.length,
    averageScore: calculateAverage(selected.map((assessment) => assessment.score)),
    lastAssessmentAt: selected.reduce<string | null>((latest, assessment) =>
      latest === null || assessment.assessedAt > latest ? assessment.assessedAt : latest, null),
  };
}

export function formatDate(value: string | null): string {
  if (value === null) return "Ainda não avaliado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date);
}
