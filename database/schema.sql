-- Ânima: tradução do modelo de domínio para PostgreSQL.
-- Artefato de referência para o próximo marco. A interface atual usa mocks;
-- este arquivo NÃO é executado pelo aplicativo nem exige um banco para iniciar.
-- Aplicar uma única vez, em um banco vazio de desenvolvimento, com PostgreSQL 13+:
-- psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/schema.sql
-- gen_random_uuid() faz parte do PostgreSQL 13+; não requer extensão adicional.

BEGIN;

CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_year INTEGER NOT NULL CHECK (school_year BETWEEN 2000 AND 2100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT classrooms_name_school_year_key UNIQUE (name, school_year)
);

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE attitude_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration TEXT NOT NULL UNIQUE,
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'transferred')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE attitude_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- A avaliação é parte do histórico do estudante: composição no UML.
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES attitude_categories(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at TIMESTAMPTZ NOT NULL,
    observation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consultas frequentes: estudantes por turma/status e histórico por estudante.
-- PK e UNIQUE já criam seus próprios índices; não é necessário duplicá-los.
CREATE INDEX students_classroom_status_idx ON students (classroom_id, status);
CREATE INDEX assessments_student_date_idx
    ON attitude_assessments (student_id, assessed_at DESC);
CREATE INDEX assessments_teacher_idx ON attitude_assessments (teacher_id);
CREATE INDEX assessments_category_idx ON attitude_assessments (category_id);

-- Todas as entidades são mutáveis; updated_at acompanha qualquer UPDATE.
CREATE FUNCTION set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER classrooms_set_updated_at BEFORE UPDATE ON classrooms
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER teachers_set_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON attitude_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER students_set_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER assessments_set_updated_at BEFORE UPDATE ON attitude_assessments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
