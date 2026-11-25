"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStudent, listClassrooms, listAssessments, listAttitudeCategories, listTeachers } from "@/lib/data";
import { calculateAverage, formatDate, getStudentSummary, scoreLabels, statusLabels } from "@/lib/domain/students";
import type { Student, Classroom, AttitudeAssessment, AttitudeCategory, Teacher } from "@/types/domain";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/page-state";

type ProfileState = { status: "loading" } | { status: "error" } | { status: "success"; student: Student | null; classrooms: Classroom[]; assessments: AttitudeAssessment[]; categories: AttitudeCategory[]; teachers: Teacher[] };

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id") ?? "";
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    Promise.all([getStudent(studentId), listClassrooms(), listAssessments(studentId), listAttitudeCategories(), listTeachers()])
      .then(([student, classrooms, assessments, categories, teachers]) => {
        if (!cancelled) setState({ status: "success", student, classrooms, assessments, categories, teachers });
      }).catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [attempt, studentId]);
  if (state.status === "loading") return <LoadingState label="Carregando estudante…" />;
  if (state.status === "error") return <ErrorState onRetry={() => setAttempt((value) => value + 1)} />;
  const { student, classrooms, assessments, categories, teachers } = state;
  if (!student) return <><Link className="back-link" href="/lab/students">Voltar para estudantes</Link><EmptyState title="Estudante não encontrado" description="Não existe um estudante com esse identificador. Volte à lista para consultar outro estudante." /></>;
  const summary = getStudentSummary(student.id, assessments);
  const classroom = classrooms.find((item) => item.id === student.classroomId);
  const history = [...assessments].sort((left, right) => right.assessedAt.localeCompare(left.assessedAt));
  const initials = student.name.split(" ").filter(Boolean).map((part) => part[0]).filter((_, index, parts) => index === 0 || index === parts.length - 1).join("");
  return <>
    <Link className="back-link" href="/lab/students">Voltar para estudantes</Link>
    <header className="profile-header"><span className="avatar profile-avatar tone-0" aria-hidden="true">{initials}</span><div><p className="eyebrow">PERFIL DO ESTUDANTE</p><h1>{student.name}</h1><p>{classroom?.name} · Matrícula {student.registration}</p></div><span className={`status-badge ${student.status}`}>{statusLabels[student.status]}</span></header>
    <div className="profile-metadata"><span>Cadastro: {formatDate(student.createdAt)}</span><span>Atualização: {formatDate(student.updatedAt)}</span><span>{summary.assessmentCount} avaliações registradas</span></div>
    <div className="profile-columns"><section className="panel"><h2>Média por categoria</h2><p className="panel-intro">Média dos registros de cada dimensão, na escala de 1 a 5.</p>{categories.map((category) => {
      const average = calculateAverage(assessments.filter((item) => item.categoryId === category.id).map((item) => item.score));
      return <div className="category-score" key={category.id}><header><span>{category.name}</span><strong>{average === null ? "Sem avaliação" : `${average.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} / 5`}</strong></header>{average !== null && <div className="score-track" role="meter" aria-label={`Média em ${category.name}`} aria-valuemin={1} aria-valuemax={5} aria-valuenow={average}><span style={{ width: `${average * 20}%` }} /></div>}</div>;
    })}<p className="muted-text">Ausência de avaliação não equivale a nota zero. As médias são calculadas somente com registros existentes.</p></section>
    <section className="panel"><h2>Histórico de avaliações</h2><p className="panel-intro">Registros mais recentes primeiro.</p>{history.length === 0 ? <p role="status" className="muted-text">Este estudante ainda não possui avaliações registradas.</p> : <ol className="timeline">{history.map((assessment) => <li key={assessment.id} className="timeline-item"><header><span>{categories.find((category) => category.id === assessment.categoryId)?.name}</span><span className="score-chip">{assessment.score} / 5</span></header><p>{scoreLabels[assessment.score]}</p>{assessment.observation !== null && <p>{assessment.observation}</p>}<div className="timeline-meta"><span>{teachers.find((teacher) => teacher.id === assessment.teacherId)?.name}</span><time dateTime={assessment.assessedAt}>{formatDate(assessment.assessedAt)}</time></div></li>)}</ol>}</section></div>
  </>;
}

export default function StudentProfilePage() {
  return <Suspense fallback={<LoadingState label="Carregando estudante…" />}><StudentProfileContent /></Suspense>;
}
