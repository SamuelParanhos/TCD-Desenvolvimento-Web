/** Identificadores persistentes; validados como UUID na fronteira de dados. */
export type UUID = string;

/** Instante de transporte em UTC, sempre com sufixo Z (ISO 8601). */
export type ISODateTime = `${number}-${number}-${number}T${string}Z`;

export type StudentStatus = "active" | "inactive" | "transferred";
export type AttitudeScore = 1 | 2 | 3 | 4 | 5;

export type Student = {
  id: UUID;
  name: string;
  registration: string;
  classroomId: UUID;
  status: StudentStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type Classroom = {
  id: UUID;
  name: string;
  schoolYear: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type Teacher = {
  id: UUID;
  name: string;
  email: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type AttitudeCategory = {
  id: UUID;
  name: string;
  description: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type AttitudeAssessment = {
  id: UUID;
  studentId: UUID;
  teacherId: UUID;
  categoryId: UUID;
  score: AttitudeScore;
  assessedAt: ISODateTime;
  /** Ausência de observação é explícita; não confundir com string vazia. */
  observation: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

/** Contrato preparado para as futuras Server Actions. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
