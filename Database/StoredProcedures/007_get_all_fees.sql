-- ============================================================
-- 007_get_all_fees.sql
-- Returns all fees joined with students and classes.
-- p_student_id: optional filter; pass NULL for all students.
-- p_status: optional status filter ('Paid','Due','Partial','Waived'), NULL for all.
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_fees(
    p_student_id INT DEFAULT NULL,
    p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
    id            INT,
    student_id    INT,
    student_name  TEXT,
    class_name    TEXT,
    fee_type      TEXT,
    amount        NUMERIC,
    due_date      DATE,
    paid_date     DATE,
    status        TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.student_id,
        (s.first_name || ' ' || s.last_name) AS student_name,
        c.name AS class_name,
        f.fee_type,
        f.amount,
        f.due_date,
        f.paid_date,
        f.status::TEXT
    FROM fees f
    JOIN students s ON s.id = f.student_id AND s.is_deleted = false
    JOIN classes c  ON c.id = s.class_id   AND c.is_deleted = false
    WHERE f.is_deleted = false
      AND (p_student_id IS NULL OR f.student_id = p_student_id)
      AND (p_status IS NULL OR f.status::TEXT = p_status)
    ORDER BY f.due_date DESC;
END;
$$;
