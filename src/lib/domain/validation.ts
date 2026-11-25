import type { ISODateTime, Student, StudentStatus } from "../../types/domain";

export function isUUID(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isISODateTime(value: unknown): value is ISODateTime {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export function isStudentStatus(value: unknown): value is StudentStatus {
  return value === "active" || value === "inactive" || value === "transferred";
}

/** Fronteira explícita de validação: um mock incompleto também produz erro legível. */
export function isStudent(value: unknown): value is Student {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const keys = ["id", "name", "registration", "classroomId", "status", "createdAt", "updatedAt"];
  return Object.keys(record).length === keys.length
    && keys.every((key) => Object.hasOwn(record, key))
    && isUUID(record.id)
    && typeof record.name === "string" && record.name.trim().length > 0
    && typeof record.registration === "string" && record.registration.trim().length > 0
    && isUUID(record.classroomId)
    && isStudentStatus(record.status)
    && isISODateTime(record.createdAt)
    && isISODateTime(record.updatedAt)
    && record.updatedAt >= record.createdAt;
}

export function assertValidStudents(values: readonly unknown[], classroomIds: readonly string[]): asserts values is readonly Student[] {
  if (!values.every(isStudent)) {
    throw new Error("Os dados dos estudantes estão incompletos ou inválidos.");
  }
  const ids = new Set(values.map((student) => student.id));
  const registrations = new Set(values.map((student) => student.registration));
  if (ids.size !== values.length || registrations.size !== values.length) {
    throw new Error("Os dados contêm identificadores ou matrículas duplicados.");
  }
  if (values.some((student) => !classroomIds.includes(student.classroomId))) {
    throw new Error("Há um estudante associado a uma turma inexistente.");
  }
}
