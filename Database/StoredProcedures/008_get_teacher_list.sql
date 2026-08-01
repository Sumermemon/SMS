-- ============================================================
-- 008_get_teacher_list.sql  (alternative using stored procedure pattern)
-- Alias for get_all_teachers used by the dashboard teacher widget.
-- ============================================================

CREATE OR REPLACE FUNCTION get_teacher_list(p_subject_id INT DEFAULT NULL)
RETURNS TABLE (
    id            INT,
    photo_url     TEXT,
    name          TEXT,
    gender        TEXT,
    class_name    TEXT,
    subject_name  TEXT,
    section_name  TEXT,
    address       TEXT,
    phone         TEXT,
    email         TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM get_all_teachers(p_subject_id);
END;
$$;
