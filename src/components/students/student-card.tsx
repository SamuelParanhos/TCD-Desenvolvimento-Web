"use client";

import Link from "next/link";
import type { Student } from "@/types/domain";
import { Icon } from "@/components/ui/icon";
import { formatDate, statusLabels } from "@/lib/domain/students";

export type StudentCardProps = {
  student: Student;
  classroomName?: string;
  averageScore?: number | null;
  assessmentCount?: number;
  lastAssessmentAt?: string | null;
};

export function StudentCard({ student, classroomName, averageScore = null, assessmentCount = 0, lastAssessmentAt = null }: StudentCardProps) {
  const initials = student.name.split(" ").filter(Boolean).map((part) => part[0]).filter((_, index, array) => index === 0 || index === array.length - 1).join("");
  const tone = Number.parseInt(student.id.slice(-2), 16) % 4;
  return <article className="student-card" aria-label={`Estudante ${student.name}`}>
    <header className="student-card-header"><span className={`avatar tone-${tone}`} aria-label={`Iniciais de ${student.name}`}>{initials}</span><span className={`status-badge ${student.status}`}>{statusLabels[student.status]}</span></header>
    <h3>{student.name}</h3><p className="classroom-name">{classroomName ?? "Turma não informada"}</p>
    <dl className="student-fields"><div><dt>Matrícula</dt><dd>{student.registration}</dd></div><div><dt>Média de atitudes</dt><dd className="average">{averageScore === null ? <span className="no-score">Sem avaliação</span> : <><span>{averageScore.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span><small> / 5</small><span className="mini-bars" role="img" aria-label={`Média ${averageScore.toFixed(1)} de 5`}>{[1, 2, 3, 4, 5].map((level) => <i key={level} className={level <= Math.round(averageScore) ? "filled" : ""} />)}</span></>}</dd></div></dl>
    <footer className="student-card-footer"><span><Icon name="clock" size={14} />{assessmentCount > 0 ? formatDate(lastAssessmentAt) : "Aguardando avaliação"}</span><Link href={`/lab/student?id=${student.id}`} aria-label={`Ver perfil de ${student.name}`}>Ver perfil</Link></footer>
  </article>;
}
