import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentCard } from "../src/components/students/student-card";
import { EmptyState, ErrorState, LoadingState } from "../src/components/ui/page-state";
import { MOCK_STUDENTS } from "../src/lib/data/students";
import { statusLabels } from "../src/lib/domain/students";

test("o cartão apresenta os três status com texto legível e identificação acessível", () => {
  for (const status of ["active", "inactive", "transferred"] as const) {
    const student = MOCK_STUDENTS.find((item) => item.status === status)!;
    const html = renderToStaticMarkup(createElement(StudentCard, { student }));
    assert.ok(html.includes(`<article class="student-card" aria-label="Estudante ${student.name}">`));
    assert.ok(html.includes(student.name));
    assert.ok(html.includes(student.registration));
    assert.ok(html.includes(statusLabels[status]));
    assert.ok(html.includes(`<dl class="student-fields">`));
    assert.ok(html.includes(`/lab/student?id=${student.id}`));
  }
});

test("o cartão distingue uma trajetória sem avaliações de uma nota numérica", () => {
  const html = renderToStaticMarkup(createElement(StudentCard, { student: MOCK_STUDENTS[16]!, averageScore: null }));
  assert.ok(html.includes("Sem avaliação"));
  assert.ok(html.includes("Aguardando avaliação"));
  assert.ok(!html.includes("Média 0"));
  assert.ok(!html.includes("mini-bars"));
});

test("o resumo opcional chega por props e oferece alternativa textual à escala visual", () => {
  const html = renderToStaticMarkup(createElement(StudentCard, {
    student: MOCK_STUDENTS[0]!, classroomName: "1º ano A", averageScore: 4.6,
    assessmentCount: 5, lastAssessmentAt: "2026-11-09T13:40:00.000Z",
  }));
  assert.ok(html.includes("1º ano A"));
  assert.ok(html.includes("4,6"));
  assert.ok(html.includes('role="img" aria-label="Média 4.6 de 5"'));
  assert.ok(!html.includes("undefined"));
});

test("carregamento informa atividade e esconde placeholders dos leitores de tela", () => {
  const html = renderToStaticMarkup(createElement(LoadingState));
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('role="status"'));
  assert.ok(html.includes("Carregando estudantes"));
  assert.ok(html.includes('aria-hidden="true"'));
});

test("o estado vazio comunica ausência de dados e permite restauração", () => {
  const html = renderToStaticMarkup(createElement(EmptyState, {
    title: "Nenhum estudante cadastrado", description: "Dados indisponíveis.",
    onReset: () => {}, resetLabel: "Restaurar demonstração",
  }));
  assert.ok(html.includes('role="status"'));
  assert.ok(html.includes("Nenhum estudante cadastrado"));
  assert.ok(html.includes("Restaurar demonstração"));
});

test("o erro é anunciado como alerta e oferece ação de nova tentativa", () => {
  const html = renderToStaticMarkup(createElement(ErrorState, { onRetry: () => {} }));
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes("Não foi possível carregar os dados"));
  assert.ok(html.includes("Tentar novamente"));
});
