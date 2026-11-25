"use client";

import { useEffect, useState } from "react";
import { StudentCard } from "@/components/students/student-card";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/page-state";
import { listStudents, listClassrooms, listAssessments, type MockScenario } from "@/lib/data";
import { calculateAverage, filterStudents, getStudentSummary, statusLabels } from "@/lib/domain/students";
import type { AttitudeAssessment, Classroom, Student, StudentStatus } from "@/types/domain";

type StudentsState = { status: "loading" } | { status: "error" } | { status: "success"; students: Student[]; classrooms: Classroom[]; assessments: AttitudeAssessment[] };
type SortOrder = "name-asc" | "name-desc" | "registration";

export default function StudentsPage() {
  const [state, setState] = useState<StudentsState>({ status: "loading" });
  const [request, setRequest] = useState<{ scenario: MockScenario; attempt: number }>({ scenario: "success", attempt: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "all">("all");
  const [classroomId, setClassroomId] = useState("");
  const [sort, setSort] = useState<SortOrder>("name-asc");
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    Promise.all([listStudents({ scenario: request.scenario }), listClassrooms(), listAssessments()])
      .then(([students, classrooms, assessments]) => {
        if (!cancelled) setState({ status: "success", students, classrooms, assessments });
      }).catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [request]);

  const students = state.status === "success" ? state.students : [];
  const classrooms = state.status === "success" ? state.classrooms : [];
  const assessments = state.status === "success" ? state.assessments.filter((item) => students.some((student) => student.id === item.studentId)) : [];
  const filtered = filterStudents(students, { search, status, classroomId: classroomId || undefined, sort });
  const average = calculateAverage(assessments.map((item) => item.score));
  const activeCount = students.filter((student) => student.status === "active").length;
  const evaluatedCount = students.filter((student) => assessments.some((item) => item.studentId === student.id)).length;
  const hasFilters = search !== "" || status !== "all" || classroomId !== "";
  const ready = state.status === "success";

  function loadScenario(scenario: MockScenario) {
    setExportMessage("");
    setRequest((current) => ({ scenario, attempt: current.attempt + 1 }));
  }
  function resetFilters() { setSearch(""); setStatus("all"); setClassroomId(""); }
  function exportStudents() {
    const rows = [["Nome", "Matrícula", "Turma", "Status", "Média de atitudes"], ...filtered.map((student) => {
      const summary = getStudentSummary(student.id, assessments);
      return [student.name, student.registration, classrooms.find((classroom) => classroom.id === student.classroomId)?.name ?? "", statusLabels[student.status], summary.averageScore?.toLocaleString("pt-BR") ?? "Sem avaliação"];
    })];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "anima-estudantes.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportMessage(`${filtered.length} estudantes exportados em CSV.`);
  }

  return <>
    <section className="page-heading"><div><h1>Estudantes</h1></div><button className="button secondary export-button" onClick={exportStudents} disabled={!ready || filtered.length === 0}><Icon name="download" size={18} />Exportar lista</button></section>
    <section className="stats-grid" aria-label="Resumo do acompanhamento">
      <article className="stat-card"><span className="stat-icon violet"><Icon name="students" /></span><span className="stat-label">Total de estudantes</span><strong>{ready ? students.length.toString().padStart(2, "0") : "—"}</strong><small>{ready ? classrooms.length : "—"} turmas cadastradas</small></article>
      <article className="stat-card"><span className="stat-icon teal"><Icon name="check" /></span><span className="stat-label">Estudantes ativos</span><strong>{ready ? activeCount.toString().padStart(2, "0") : "—"}</strong><small>Em acompanhamento</small></article>
      <article className="stat-card"><span className="stat-icon blue"><Icon name="chart" /></span><span className="stat-label">Com avaliações</span><strong>{ready ? evaluatedCount.toString().padStart(2, "0") : "—"}</strong><small>{assessments.length} registros atitudinais</small></article>
      <article className="stat-card"><span className="stat-icon amber"><Icon name="spark" /></span><span className="stat-label">Média geral</span><strong>{ready && average !== null ? average.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}<em> / 5</em></strong><small>Todas as avaliações da lista</small></article>
    </section>
    <section className="students-section" aria-labelledby="students-title">
      <div className="section-heading"><div className="section-title"><h2 id="students-title">Lista de estudantes</h2><span className="count-badge">{ready ? students.length : "—"}</span></div><button className="text-button" onClick={() => loadScenario(request.scenario)} disabled={state.status === "loading"}><Icon name="refresh" size={16} />Atualizar</button></div>
      <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}><label className="search-field"><Icon name="search" size={19} /><span className="sr-only">Buscar por nome ou matrícula</span><input type="search" placeholder="Buscar por nome ou matrícula…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="select-field"><span className="sr-only">Filtrar por turma</span><select value={classroomId} onChange={(event) => setClassroomId(event.target.value)}><option value="">Todas as turmas</option>{classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}</select></label><label className="select-field"><span className="sr-only">Filtrar por status</span><select value={status} onChange={(event) => setStatus(event.target.value as StudentStatus | "all")}><option value="all">Todos os status</option><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="transferred">Transferido</option></select></label></form>
      <div className="results-toolbar"><p role="status" aria-live="polite">{ready ? <><strong>{filtered.length}</strong> {filtered.length === 1 ? "estudante encontrado" : "estudantes encontrados"}{hasFilters && <button className="clear-button" onClick={resetFilters}>Limpar filtros</button>}</> : "Preparando a listagem"}</p><label className="sort-control">Ordenar por<select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="name-asc">Nome (A–Z)</option><option value="name-desc">Nome (Z–A)</option><option value="registration">Matrícula</option></select></label></div>
      {state.status === "loading" && <LoadingState />}
      {state.status === "error" && <ErrorState onRetry={() => loadScenario("success")} />}
      {ready && students.length === 0 && <EmptyState title="Nenhum estudante cadastrado" description="Os estudantes aparecerão aqui quando houver dados disponíveis para acompanhamento." onReset={() => loadScenario("success")} resetLabel="Carregar estudantes" />}
      {ready && students.length > 0 && filtered.length === 0 && <EmptyState title="Nenhum estudante encontrado" description="Experimente outro nome, matrícula ou combinação de filtros." onReset={resetFilters} />}
      {ready && filtered.length > 0 && <ul className="student-grid">{filtered.map((student) => <li key={student.id}><StudentCard student={student} classroomName={classrooms.find((classroom) => classroom.id === student.classroomId)?.name} {...getStudentSummary(student.id, assessments)} /></li>)}</ul>}
      <p role="status" className="export-message">{exportMessage}</p>
    </section>
    <details className="demo-controls"><summary>Laboratório da interface <span>Testar estados de exibição</span></summary><div><p>Selecione o estado que deseja verificar.</p><div className="demo-actions"><button className="button secondary" onClick={() => loadScenario("success")} aria-pressed={request.scenario === "success"}>Carregar dados</button><button className="button secondary" onClick={() => loadScenario("empty")} aria-pressed={request.scenario === "empty"}>Simular lista vazia</button><button className="button secondary" onClick={() => loadScenario("error")} aria-pressed={request.scenario === "error"}>Simular erro</button></div></div></details>
  </>;
}
