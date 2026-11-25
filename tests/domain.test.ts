import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
  getStudent,
  listAssessments,
  listAttitudeCategories,
  listClassrooms,
  listStudents,
  listTeachers,
  MOCK_DELAY_MS,
} from "../src/lib/data/index";
import { MOCK_STUDENTS } from "../src/lib/data/students";
import { MOCK_CLASSROOMS } from "../src/lib/data/classrooms";
import { MOCK_TEACHERS } from "../src/lib/data/teachers";
import { MOCK_ATTITUDE_CATEGORIES } from "../src/lib/data/categories";
import { MOCK_ASSESSMENTS } from "../src/lib/data/assessments";
import { assertValidStudents, isISODateTime, isStudent, isStudentStatus, isUUID } from "../src/lib/domain/validation";
import { calculateAverage, filterStudents, formatDate, getStudentSummary } from "../src/lib/domain/students";

const firstStudent = MOCK_STUDENTS[0]!;
const classroomIds = MOCK_CLASSROOMS.map((classroom) => classroom.id);
const unknownId = "99999999-0000-4000-8000-000000000001";

function useFakeLatency(t: TestContext): void {
  t.mock.timers.enable({ apis: ["setTimeout"] });
}

async function resolveQuery<T>(t: TestContext, query: () => Promise<T>): Promise<T> {
  const pending = query();
  t.mock.timers.tick(MOCK_DELAY_MS);
  return pending;
}

test("o conjunto de estudantes cobre os três status, três turmas e ao menos quinze pessoas", () => {
  assert.equal(MOCK_STUDENTS.length, 18);
  assert.deepEqual([...new Set(MOCK_STUDENTS.map((student) => student.status))].sort(), ["active", "inactive", "transferred"]);
  assert.equal(new Set(MOCK_STUDENTS.map((student) => student.classroomId)).size, 3);
  assert.doesNotThrow(() => assertValidStudents(MOCK_STUDENTS, classroomIds));
});

test("todos os mocks possuem identificadores únicos UUID e instantes UTC válidos", () => {
  const collections = [MOCK_STUDENTS, MOCK_CLASSROOMS, MOCK_TEACHERS, MOCK_ATTITUDE_CATEGORIES, MOCK_ASSESSMENTS];
  const allIds = collections.flatMap((collection) => collection.map((entry) => entry.id));
  assert.equal(new Set(allIds).size, allIds.length);
  for (const collection of collections) {
    for (const entry of collection) {
      for (const [key, value] of Object.entries(entry)) {
        if (key === "id" || key.endsWith("Id")) assert.ok(isUUID(value), `${key}: ${String(value)}`);
        if (key.endsWith("At")) assert.ok(isISODateTime(value), `${key}: ${String(value)}`);
      }
      assert.ok(entry.updatedAt >= entry.createdAt);
    }
  }
});

test("os estudantes possuem exatamente os campos do contrato de domínio", () => {
  const expected = ["id", "name", "registration", "classroomId", "status", "createdAt", "updatedAt"].sort();
  for (const student of MOCK_STUDENTS) {
    assert.deepEqual(Object.keys(student).sort(), expected);
    assert.ok(isStudent(student));
  }
});

test("as chaves naturais dos conjuntos fictícios são únicas", () => {
  assert.equal(new Set(MOCK_STUDENTS.map((student) => student.registration)).size, MOCK_STUDENTS.length);
  assert.equal(new Set(MOCK_TEACHERS.map((teacher) => teacher.email)).size, MOCK_TEACHERS.length);
  assert.equal(new Set(MOCK_ATTITUDE_CATEGORIES.map((category) => category.name)).size, MOCK_ATTITUDE_CATEGORIES.length);
  assert.equal(new Set(MOCK_CLASSROOMS.map((classroom) => `${classroom.name}/${classroom.schoolYear}`)).size, MOCK_CLASSROOMS.length);
  assert.ok(MOCK_TEACHERS.every((teacher) => teacher.email.endsWith("@example.com")));
});

test("todas as avaliações referenciam estudante, professor e categoria existentes", () => {
  const studentIds = new Set(MOCK_STUDENTS.map((student) => student.id));
  const teacherIds = new Set(MOCK_TEACHERS.map((teacher) => teacher.id));
  const categoryIds = new Set(MOCK_ATTITUDE_CATEGORIES.map((category) => category.id));
  for (const assessment of MOCK_ASSESSMENTS) {
    assert.ok(studentIds.has(assessment.studentId));
    assert.ok(teacherIds.has(assessment.teacherId));
    assert.ok(categoryIds.has(assessment.categoryId));
    assert.ok(Number.isInteger(assessment.score) && assessment.score >= 1 && assessment.score <= 5);
    assert.ok(assessment.observation === null || typeof assessment.observation === "string");
    assert.ok(assessment.assessedAt <= assessment.createdAt);
  }
  assert.equal(MOCK_ASSESSMENTS.length, 80);
  assert.ok(MOCK_ASSESSMENTS.some((assessment) => assessment.observation === null));
  assert.equal(new Set(MOCK_ASSESSMENTS.map((assessment) => assessment.studentId)).size, 16);
});

test("arrays e registros mock são congelados em runtime", () => {
  const collections = [MOCK_STUDENTS, MOCK_CLASSROOMS, MOCK_TEACHERS, MOCK_ATTITUDE_CATEGORIES, MOCK_ASSESSMENTS];
  for (const collection of collections) {
    assert.ok(Object.isFrozen(collection));
    assert.equal(Reflect.set(collection, "length", 0), false);
    for (const entry of collection) {
      assert.ok(Object.isFrozen(entry));
      assert.equal(Reflect.set(entry, "id", unknownId), false);
    }
  }
  assert.equal(MOCK_STUDENTS.length, 18);
});

test("cada consulta aguarda 650 ms e devolve uma Promise", async (t) => {
  useFakeLatency(t);
  assert.ok(MOCK_DELAY_MS >= 500 && MOCK_DELAY_MS <= 1000);
  const queries = [() => listStudents(), () => getStudent(firstStudent.id), () => listClassrooms(), () => listTeachers(), () => listAttitudeCategories(), () => listAssessments()];
  for (const query of queries) {
    let settled = false;
    const result = query();
    assert.ok(result instanceof Promise);
    const observed = result.then(() => { settled = true; });
    t.mock.timers.tick(MOCK_DELAY_MS - 1);
    await Promise.resolve();
    assert.equal(settled, false);
    t.mock.timers.tick(1);
    await observed;
    assert.equal(settled, true);
  }
});

test("listStudents devolve uma cópia isolada do array e dos registros", async (t) => {
  useFakeLatency(t);
  const result = await resolveQuery(t, () => listStudents());
  assert.notEqual(result, MOCK_STUDENTS);
  assert.notEqual(result[0], firstStudent);
  result[0]!.name = "Alteração apenas na cópia";
  result.pop();
  const next = await resolveQuery(t, () => listStudents());
  assert.equal(next.length, 18);
  assert.equal(next[0]!.name, firstStudent.name);
});

test("getStudent encontra por UUID e devolve uma cópia isolada", async (t) => {
  useFakeLatency(t);
  const result = await resolveQuery(t, () => getStudent(firstStudent.id));
  assert.deepEqual(result, firstStudent);
  assert.notEqual(result, firstStudent);
  assert.ok(result);
  result.name = "Outro nome";
  const next = await resolveQuery(t, () => getStudent(firstStudent.id));
  assert.equal(next?.name, firstStudent.name);
});

test("getStudent retorna null para UUID inexistente, vazio ou inválido", async (t) => {
  useFakeLatency(t);
  for (const id of [unknownId, "", "id-inválido"]) {
    assert.equal(await resolveQuery(t, () => getStudent(id)), null);
  }
});

test("as demais consultas também isolam registros e arrays", async (t) => {
  useFakeLatency(t);
  const queries: (() => Promise<{ id: string }[]>)[] = [() => listClassrooms(), () => listTeachers(), () => listAttitudeCategories(), () => listAssessments()];
  const sources = [MOCK_CLASSROOMS, MOCK_TEACHERS, MOCK_ATTITUDE_CATEGORIES, MOCK_ASSESSMENTS];
  for (const [index, query] of queries.entries()) {
    const result = await resolveQuery(t, query);
    assert.deepEqual(result, sources[index]);
    assert.notEqual(result, sources[index]);
    assert.notEqual(result[0], sources[index]![0]);
    result[0]!.id = unknownId;
    result.pop();
    const next = await resolveQuery(t, query);
    assert.deepEqual(next, sources[index]);
  }
});

test("listAssessments filtra pelo estudante sem misturar históricos", async (t) => {
  useFakeLatency(t);
  const result = await resolveQuery(t, () => listAssessments(firstStudent.id));
  assert.equal(result.length, 5);
  assert.ok(result.every((assessment) => assessment.studentId === firstStudent.id));
  assert.deepEqual(await resolveQuery(t, () => listAssessments(unknownId)), []);
});

test("o cenário vazio é determinístico e não modifica os mocks", async (t) => {
  useFakeLatency(t);
  assert.deepEqual(await resolveQuery(t, () => listStudents({ scenario: "empty" })), []);
  assert.equal(await resolveQuery(t, () => getStudent(firstStudent.id, { scenario: "empty" })), null);
  assert.deepEqual(await resolveQuery(t, () => listClassrooms({ scenario: "empty" })), []);
  assert.deepEqual(await resolveQuery(t, () => listTeachers({ scenario: "empty" })), []);
  assert.deepEqual(await resolveQuery(t, () => listAttitudeCategories({ scenario: "empty" })), []);
  assert.deepEqual(await resolveQuery(t, () => listAssessments(undefined, { scenario: "empty" })), []);
  assert.equal((await resolveQuery(t, () => listStudents())).length, 18);
});

test("o cenário de erro rejeita as consultas após a latência", async (t) => {
  useFakeLatency(t);
  const queries = [() => listStudents({ scenario: "error" }), () => getStudent(firstStudent.id, { scenario: "error" }), () => listClassrooms({ scenario: "error" }), () => listTeachers({ scenario: "error" }), () => listAttitudeCategories({ scenario: "error" }), () => listAssessments(undefined, { scenario: "error" })];
  for (const query of queries) {
    const rejection = assert.rejects(query(), /Não foi possível carregar os dados/);
    t.mock.timers.tick(MOCK_DELAY_MS);
    await rejection;
  }
});

test("a validação rejeita campos ausentes, extras, tipos errados e status inválidos", () => {
  const { registration: _registration, ...incomplete } = firstStudent;
  for (const invalid of [null, undefined, [], incomplete, { ...firstStudent, extra: true }, { ...firstStudent, name: " " }, { ...firstStudent, registration: 123 }, { ...firstStudent, status: "graduated" }, { ...firstStudent, id: "1" }, { ...firstStudent, updatedAt: "2020-01-01T00:00:00.000Z" }]) {
    assert.equal(isStudent(invalid), false);
    assert.throws(() => assertValidStudents([invalid], classroomIds), /incompletos ou inválidos/);
  }
  assert.equal(isStudentStatus("active"), true);
  assert.equal(isStudentStatus("Ativo"), false);
});

test("a validação rejeita duplicações e referências de turma inexistentes", () => {
  assert.throws(() => assertValidStudents([firstStudent, { ...firstStudent }], classroomIds), /duplicados/);
  assert.throws(() => assertValidStudents([firstStudent, { ...MOCK_STUDENTS[1]!, registration: firstStudent.registration }], classroomIds), /duplicados/);
  assert.throws(() => assertValidStudents([{ ...firstStudent, classroomId: unknownId }], classroomIds), /turma inexistente/);
});

test("UUID e data são validados sem aceitar instantes impossíveis ou sem Z", () => {
  assert.equal(isUUID(firstStudent.id), true);
  for (const invalid of [null, 12, "", "40000000-0000-4000-7000-000000000001", "40000000-0000-9000-8000-000000000001"]) assert.equal(isUUID(invalid), false);
  assert.equal(isISODateTime("2024-02-29T12:30:00.000Z"), true);
  for (const invalid of ["2026-02-29T12:30:00.000Z", "2026-13-01T12:30:00.000Z", "2026-02-01T12:30:00.000", "2026-02-01T12:30:00.000-03:00", new Date()]) assert.equal(isISODateTime(invalid), false);
});

test("a busca ignora maiúsculas, espaços e acentos e aceita matrícula", () => {
  assert.equal(filterStudents(MOCK_STUDENTS, { search: "  JOAO  " })[0]?.name, "João Pedro Nascimento");
  assert.equal(filterStudents(MOCK_STUDENTS, { search: "olivia" })[0]?.name, "Olívia Duarte");
  assert.equal(filterStudents(MOCK_STUDENTS, { search: "20260001" })[0]?.id, firstStudent.id);
  assert.deepEqual(filterStudents(MOCK_STUDENTS, { search: "sem correspondência" }), []);
});

test("filtros combinam status e turma; ordenação não altera o array original", () => {
  const before = MOCK_STUDENTS.map((student) => student.id);
  const filtered = filterStudents(MOCK_STUDENTS, { classroomId: classroomIds[0], status: "active" });
  assert.equal(filtered.length, 5);
  assert.ok(filtered.every((student) => student.classroomId === classroomIds[0] && student.status === "active"));
  const asc = filterStudents(MOCK_STUDENTS, { sort: "name-asc" });
  const desc = filterStudents(MOCK_STUDENTS, { sort: "name-desc" });
  assert.deepEqual(desc.map((student) => student.id), asc.map((student) => student.id).reverse());
  const registrations = filterStudents(MOCK_STUDENTS, { sort: "registration" }).map((student) => student.registration);
  assert.deepEqual(registrations, [...registrations].sort());
  assert.deepEqual(MOCK_STUDENTS.map((student) => student.id), before);
});

test("a média distingue ausência de avaliação e calcula sem arredondar o domínio", () => {
  assert.equal(calculateAverage([]), null);
  assert.equal(calculateAverage([1, 5]), 3);
  assert.equal(calculateAverage([5, 4, 5, 4, 5]), 4.6);
  assert.equal(calculateAverage([1, 2, 2]), 5 / 3);
});

test("o resumo considera apenas o estudante e encontra a última avaliação", () => {
  const summary = getStudentSummary(firstStudent.id, MOCK_ASSESSMENTS);
  assert.equal(summary.assessmentCount, 5);
  assert.equal(summary.averageScore, 4.6);
  assert.equal(summary.lastAssessmentAt, "2026-11-09T13:40:00.000Z");
  assert.deepEqual(getStudentSummary(MOCK_STUDENTS[16]!.id, MOCK_ASSESSMENTS), { assessmentCount: 0, averageScore: null, lastAssessmentAt: null });
  assert.deepEqual(getStudentSummary(unknownId, MOCK_ASSESSMENTS), { assessmentCount: 0, averageScore: null, lastAssessmentAt: null });
});

test("a data é exibida no fuso de São Paulo e trata ausência e entrada inválida", () => {
  assert.equal(formatDate(null), "Ainda não avaliado");
  assert.equal(formatDate("not-a-date"), "Data indisponível");
  assert.match(formatDate("2026-11-10T01:00:00.000Z"), /^09/);
  assert.match(formatDate("2026-11-10T01:00:00.000Z"), /2026/);
});
