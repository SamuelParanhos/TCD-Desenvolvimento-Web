"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listAssessments, listStudents, listAttitudeCategories, listTeachers } from "@/lib/data";
import type { AttitudeAssessment, AttitudeCategory, AttitudeScore, Student, Teacher } from "@/types/domain";
import { formatDate, scoreLabels } from "@/lib/domain/students";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/page-state";

type AssessmentState = { status: "loading" } | { status: "error" } | { status: "success"; assessments: AttitudeAssessment[]; students: Student[]; categories: AttitudeCategory[]; teachers: Teacher[] };

export default function AssessmentsPage() {
  const [state, setState] = useState<AssessmentState>({ status: "loading" });
  const [categoryId, setCategoryId] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    Promise.all([listAssessments(), listStudents(), listAttitudeCategories(), listTeachers()]).then(([assessments, students, categories, teachers]) => {
      if (!cancelled) setState({ status: "success", assessments, students, categories, teachers });
    }).catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [attempt]);
  const filtered = state.status === "success" ? state.assessments.filter((item) => !categoryId || item.categoryId === categoryId).sort((left, right) => right.assessedAt.localeCompare(left.assessedAt)) : [];
  return <>
    <section className="page-heading"><div><h1>Avaliações atitudinais</h1></div></section>
    <h2>Escala de avaliação</h2><div className="rubric-grid">{([1, 2, 3, 4, 5] as AttitudeScore[]).map((score) => <div className="rubric-item" key={score}><strong>{score}</strong>{scoreLabels[score]}</div>)}</div>
    {state.status === "loading" && <LoadingState label="Carregando avaliações…" />}
    {state.status === "error" && <ErrorState onRetry={() => setAttempt((value) => value + 1)} />}
    {state.status === "success" && <><h2>Dimensões acompanhadas</h2><div className="category-pills">{state.categories.map((category) => <span className="category-pill" key={category.id} title={category.description}>{category.name}</span>)}</div><div className="table-filter"><p className="muted-text" role="status">{filtered.length} avaliações encontradas</p><label><span className="sr-only">Filtrar por categoria</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Todas as categorias</option>{state.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>
    {filtered.length === 0 ? <EmptyState title="Nenhuma avaliação encontrada" description="Não há registros para a categoria selecionada." /> : <div className="table-scroll" tabIndex={0} role="region" aria-label="Histórico de avaliações, role horizontalmente em telas pequenas"><table className="assessment-table"><caption>Histórico de avaliações</caption><thead><tr><th scope="col">Estudante</th><th scope="col">Dimensão</th><th scope="col">Nota</th><th scope="col">Professor</th><th scope="col">Data</th></tr></thead><tbody>{filtered.map((assessment) => <tr key={assessment.id}><td><Link href={`/lab/student?id=${assessment.studentId}`}>{state.students.find((student) => student.id === assessment.studentId)?.name}</Link></td><td>{state.categories.find((category) => category.id === assessment.categoryId)?.name}</td><td><span className="score-chip" title={scoreLabels[assessment.score]}>{assessment.score} / 5</span></td><td>{state.teachers.find((teacher) => teacher.id === assessment.teacherId)?.name}</td><td><time dateTime={assessment.assessedAt}>{formatDate(assessment.assessedAt)}</time></td></tr>)}</tbody></table></div>}</>}
  </>;
}
