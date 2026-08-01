-- ============================================================
-- 003_get_class_routine.sql
-- Returns class routine rows joined with Class, Subject, Section, Teacher.
-- p_class_id: optional class filter.
-- p_day: optional day filter (e.g. 'Monday').
-- ============================================================

CREATE OR REPLACE FUNCTION get_class_routine(
    p_class_id INT DEFAULT NULL,
    p_day TEXT DEFAULT NULL
)
RETURNS TABLE (
    id            INT,
    day           TEXT,
    class_name    TEXT,
    subject_name  TEXT,
    section_name  TEXT,
    teacher_name  TEXT,
    time_slot     TEXT,
    effective_date DATE
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.day,
        c.name AS class_name,
        sub.name AS subject_name,
        sec.name AS section_name,
        COALESCE((t.first_name || ' ' || t.last_name), '') AS teacher_name,
        r.time_slot,
        r.effective_date
    FROM class_routines r
    JOIN classes c     ON c.id = r.class_id   AND c.is_deleted = false
    JOIN subjects sub  ON sub.id = r.subject_id AND sub.is_deleted = false
    JOIN sections sec  ON sec.id = r.section_id AND sec.is_deleted = false
    LEFT JOIN teachers t ON t.id = r.teacher_id AND t.is_deleted = false
    WHERE r.is_deleted = false
      AND (p_class_id IS NULL OR r.class_id = p_class_id)
      AND (p_day IS NULL OR LOWER(r.day) = LOWER(p_day))
    ORDER BY
        CASE LOWER(r.day)
            WHEN 'monday' THEN 1
            WHEN 'tuesday' THEN 2
            WHEN 'wednesday' THEN 3
            WHEN 'thursday' THEN 4
            WHEN 'friday' THEN 5
            WHEN 'saturday' THEN 6
            WHEN 'sunday' THEN 7
            ELSE 8
        END, r.time_slot;
END;
$$;
