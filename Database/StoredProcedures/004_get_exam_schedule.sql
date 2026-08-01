-- ============================================================
-- 004_get_exam_schedule.sql
-- Returns exam schedule joined with Subject, Class, Section.
-- p_class_id: optional filter; pass NULL to get all.
-- ============================================================

CREATE OR REPLACE FUNCTION get_exam_schedule(p_class_id INT DEFAULT NULL)
RETURNS TABLE (
    id            INT,
    exam_name     TEXT,
    subject_name  TEXT,
    class_name    TEXT,
    section_name  TEXT,
    exam_time     TEXT,
    exam_date     DATE,
    is_published  BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.name AS exam_name,
        sub.name AS subject_name,
        c.name AS class_name,
        sec.name AS section_name,
        TO_CHAR(e.exam_time, 'HH24:MI') AS exam_time,
        e.exam_date,
        e.is_published
    FROM exams e
    JOIN subjects sub  ON sub.id = e.subject_id AND sub.is_deleted = false
    JOIN classes c     ON c.id = e.class_id     AND c.is_deleted = false
    JOIN sections sec  ON sec.id = e.section_id AND sec.is_deleted = false
    WHERE e.is_deleted = false
      AND (p_class_id IS NULL OR e.class_id = p_class_id)
    ORDER BY e.exam_date, e.exam_time;
END;
$$;
