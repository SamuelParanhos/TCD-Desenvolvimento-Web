-- Executar somente em banco descartável após database/schema.sql.
-- As inserções de teste são revertidas ao final.
BEGIN;
DO $$
DECLARE
  classroom_key uuid;
  teacher_key uuid;
  category_key uuid;
  student_key uuid;
  assessment_key uuid;
  initial_time timestamptz;
  changed_time timestamptz;
BEGIN
  INSERT INTO classrooms (name, school_year) VALUES ('Turma de teste descartável', 2026) RETURNING id INTO classroom_key;
  INSERT INTO teachers (name, email) VALUES ('Professor de teste', 'sql-smoke@example.com') RETURNING id INTO teacher_key;
  INSERT INTO attitude_categories (name, description) VALUES ('Categoria de teste', 'Somente para verificação descartável') RETURNING id INTO category_key;
  INSERT INTO students (name, registration, classroom_id, status, created_at, updated_at)
    VALUES ('Estudante de teste', 'TESTE-0001', classroom_key, 'active', '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z') RETURNING id INTO student_key;
  INSERT INTO attitude_assessments (student_id, teacher_id, category_id, score, assessed_at)
    VALUES (student_key, teacher_key, category_key, 4, now()) RETURNING id INTO assessment_key;
  IF classroom_key IS NULL OR teacher_key IS NULL OR category_key IS NULL OR student_key IS NULL OR assessment_key IS NULL THEN RAISE EXCEPTION 'DEFAULT UUID falhou'; END IF;
  IF (SELECT created_at FROM classrooms WHERE id = classroom_key) IS NULL THEN RAISE EXCEPTION 'DEFAULT timestamp falhou'; END IF;
  BEGIN
    INSERT INTO students (name, registration, classroom_id, status) VALUES ('Duplicado', 'TESTE-0001', classroom_key, 'active');
    RAISE EXCEPTION 'UNIQUE registration falhou';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    UPDATE students SET status = 'invalid' WHERE id = student_key;
    RAISE EXCEPTION 'CHECK status falhou';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO classrooms (name, school_year) VALUES ('Ano inválido', 1800);
    RAISE EXCEPTION 'CHECK school_year falhou';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE attitude_assessments SET score = 6 WHERE id = assessment_key;
    RAISE EXCEPTION 'CHECK score falhou';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE attitude_assessments SET student_id = '99999999-0000-4000-8000-000000000001' WHERE id = assessment_key;
    RAISE EXCEPTION 'FK student falhou';
  EXCEPTION WHEN foreign_key_violation OR restrict_violation THEN NULL; END;
  BEGIN
    DELETE FROM teachers WHERE id = teacher_key;
    RAISE EXCEPTION 'RESTRICT teacher falhou';
  EXCEPTION WHEN foreign_key_violation OR restrict_violation THEN NULL; END;
  BEGIN
    DELETE FROM attitude_categories WHERE id = category_key;
    RAISE EXCEPTION 'RESTRICT category falhou';
  EXCEPTION WHEN foreign_key_violation OR restrict_violation THEN NULL; END;
  BEGIN
    DELETE FROM classrooms WHERE id = classroom_key;
    RAISE EXCEPTION 'RESTRICT classroom falhou';
  EXCEPTION WHEN foreign_key_violation OR restrict_violation THEN NULL; END;
  SELECT updated_at INTO initial_time FROM students WHERE id = student_key;
  UPDATE students SET name = 'Nome atualizado' WHERE id = student_key;
  SELECT updated_at INTO changed_time FROM students WHERE id = student_key;
  IF changed_time <= initial_time THEN RAISE EXCEPTION 'Trigger updated_at falhou'; END IF;
  DELETE FROM students WHERE id = student_key;
  IF EXISTS (SELECT 1 FROM attitude_assessments WHERE id = assessment_key) THEN RAISE EXCEPTION 'CASCADE assessment falhou'; END IF;
  IF NOT EXISTS (SELECT 1 FROM teachers WHERE id = teacher_key) OR NOT EXISTS (SELECT 1 FROM attitude_categories WHERE id = category_key) OR NOT EXISTS (SELECT 1 FROM classrooms WHERE id = classroom_key) THEN RAISE EXCEPTION 'Exclusão indevida das referências'; END IF;
  RAISE NOTICE '13 verificações SQL passaram; dados descartáveis serão revertidos.';
END;
$$;
ROLLBACK;
