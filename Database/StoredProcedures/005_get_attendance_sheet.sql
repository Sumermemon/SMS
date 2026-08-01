-- ============================================================
-- 005_get_attendance_sheet.sql
-- Returns one row per student per day for the given class/section/month.
-- Consumers pivot this into the monthly grid on the frontend.
-- ============================================================

CREATE OR REPLACE FUNCTION get_attendance_sheet(
    p_class_id   INT,
    p_section_id INT,
    p_month      INT,
    p_year       INT
)
RETURNS TABLE (
    student_id    INT,
    student_name  TEXT,
    roll          TEXT,
    day_of_month  INT,
    is_present    BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS student_id,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.roll::TEXT,
        EXTRACT(DAY FROM a.date)::INT AS day_of_month,
        a.is_present
    FROM students s
    JOIN attendances a ON a.student_id = s.id AND a.is_deleted = false
    WHERE s.class_id = p_class_id
      AND s.section_id = p_section_id
      AND s.is_deleted = false
      AND EXTRACT(MONTH FROM a.date) = p_month
      AND EXTRACT(YEAR FROM a.date) = p_year
    ORDER BY s.roll, a.date;
END;
$$;
