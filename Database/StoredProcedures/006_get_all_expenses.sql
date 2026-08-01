-- ============================================================
-- 006_get_all_expenses.sql
-- Returns all expenses with optional status filter.
-- p_status: 'Paid', 'Due', 'Pending', or NULL for all.
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_expenses(p_status TEXT DEFAULT NULL)
RETURNS TABLE (
    id            INT,
    photo_url     TEXT,
    name          TEXT,
    expense_type  TEXT,
    amount        NUMERIC,
    status        TEXT,
    phone         TEXT,
    email         TEXT,
    date          DATE
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        COALESCE(e.photo_url, '') AS photo_url,
        e.name,
        e.expense_type,
        e.amount,
        e.status::TEXT,
        COALESCE(e.phone, '') AS phone,
        COALESCE(e.email, '') AS email,
        e.date
    FROM expenses e
    WHERE e.is_deleted = false
      AND (p_status IS NULL OR e.status::TEXT = p_status)
    ORDER BY e.date DESC;
END;
$$;
