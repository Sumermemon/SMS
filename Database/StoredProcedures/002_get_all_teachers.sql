-- ============================================================
-- 002_get_all_teachers.sql
-- Returns the full teacher list joined with Subject, Class, Section.
-- p_subject_id: optional filter; pass NULL to get all.
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_teachers(p_subject_id INT DEFAULT NULL)
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
    RETURN QUERY
    SELECT
        t.id,
        COALESCE(t.photo_url, '') AS photo_url,
        (t.first_name || ' ' || t.last_name) AS name,
        t.gender::TEXT,
        c.name AS class_name,
        sub.name AS subject_name,
        sec.name AS section_name,
        COALESCE(t.address, '') AS address,
        COALESCE(t.phone, '') AS phone,
        COALESCE(t.email, '') AS email
    FROM teachers t
    LEFT JOIN classes c   ON c.id = t.class_id   AND c.is_deleted = false
    LEFT JOIN subjects sub ON sub.id = t.subject_id AND sub.is_deleted = false
    LEFT JOIN sections sec ON sec.id = t.section_id AND sec.is_deleted = false
    WHERE t.is_deleted = false
      AND (p_subject_id IS NULL OR t.subject_id = p_subject_id)
    ORDER BY t.first_name, t.last_name;
END;
$$;
