-- ============================================================
-- 001_get_all_students.sql
-- Returns the full student list joined with Class, Section, Parent.
-- p_class_id: optional filter; pass NULL to get all classes.
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_students(p_class_id INT DEFAULT NULL)
RETURNS TABLE (
    id            INT,
    roll          INT,
    photo_url     TEXT,
    name          TEXT,
    gender        TEXT,
    class_name    TEXT,
    section_name  TEXT,
    parent_name   TEXT,
    address       TEXT,
    date_of_birth DATE,
    phone         TEXT,
    email         TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.roll,
        COALESCE(s.photo_url, '') AS photo_url,
        (s.first_name || ' ' || s.last_name) AS name,
        s.gender::TEXT,
        c.name AS class_name,
        sec.name AS section_name,
        COALESCE(p.name, '') AS parent_name,
        COALESCE(s.address, '') AS address,
        s.date_of_birth,
        COALESCE(s.phone, '') AS phone,
        COALESCE(s.email, '') AS email
    FROM students s
    JOIN classes c       ON c.id = s.class_id  AND c.is_deleted = false
    JOIN sections sec    ON sec.id = s.section_id AND sec.is_deleted = false
    LEFT JOIN parents p  ON p.id = s.parent_id AND p.is_deleted = false
    WHERE s.is_deleted = false
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
    ORDER BY c.name, s.roll;
END;
$$;
