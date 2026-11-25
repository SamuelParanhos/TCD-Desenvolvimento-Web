import type { AttitudeAssessment, AttitudeCategory, Classroom, Student, Teacher } from "../../types/domain";
import { assertValidStudents } from "../domain/validation";
import { MOCK_ASSESSMENTS } from "./assessments";
import { MOCK_ATTITUDE_CATEGORIES } from "./categories";
import { MOCK_CLASSROOMS } from "./classrooms";
import { MOCK_STUDENTS } from "./students";
import { MOCK_TEACHERS } from "./teachers";

export type MockScenario = "success" | "empty" | "error";
export type MockQueryOptions = { scenario?: MockScenario };
export const MOCK_DELAY_MS = 650;

async function simulateLatency(options?: MockQueryOptions): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  if (options?.scenario === "error") {
    throw new Error("Não foi possível carregar os dados. Tente novamente.");
  }
}

export async function listStudents(options?: MockQueryOptions): Promise<Student[]> {
  await simulateLatency(options);
  if (options?.scenario === "empty") return [];
  assertValidStudents(MOCK_STUDENTS, MOCK_CLASSROOMS.map((classroom) => classroom.id));
  // Cada registro contém somente campos escalares: a cópia também isola todos os valores.
  return MOCK_STUDENTS.map((student) => ({ ...student }));
}

export async function getStudent(id: string, options?: MockQueryOptions): Promise<Student | null> {
  await simulateLatency(options);
  if (options?.scenario === "empty") return null;
  assertValidStudents(MOCK_STUDENTS, MOCK_CLASSROOMS.map((classroom) => classroom.id));
  const student = MOCK_STUDENTS.find((candidate) => candidate.id === id);
  return student ? { ...student } : null;
}

export async function listClassrooms(options?: MockQueryOptions): Promise<Classroom[]> {
  await simulateLatency(options);
  return options?.scenario === "empty" ? [] : MOCK_CLASSROOMS.map((classroom) => ({ ...classroom }));
}

export async function listTeachers(options?: MockQueryOptions): Promise<Teacher[]> {
  await simulateLatency(options);
  return options?.scenario === "empty" ? [] : MOCK_TEACHERS.map((teacher) => ({ ...teacher }));
}

export async function listAttitudeCategories(options?: MockQueryOptions): Promise<AttitudeCategory[]> {
  await simulateLatency(options);
  return options?.scenario === "empty" ? [] : MOCK_ATTITUDE_CATEGORIES.map((category) => ({ ...category }));
}

export async function listAssessments(studentId?: string, options?: MockQueryOptions): Promise<AttitudeAssessment[]> {
  await simulateLatency(options);
  if (options?.scenario === "empty") return [];
  return MOCK_ASSESSMENTS
    .filter((assessment) => studentId === undefined || assessment.studentId === studentId)
    .map((assessment) => ({ ...assessment }));
}
