namespace SchoolManagement.Infrastructure.Identity;

/// <summary>
/// Single source of truth for all permission names in the system.
/// These are seeded into the permissions table and used as JWT claims.
/// </summary>
public static class Permissions
{
    // ── Students ──────────────────────────────────────────────────────────────
    public static class Students
    {
        public const string View   = "students.view";
        public const string Create = "students.create";
        public const string Edit   = "students.edit";
        public const string Delete = "students.delete";
    }

    // ── Teachers ──────────────────────────────────────────────────────────────
    public static class Teachers
    {
        public const string View   = "teachers.view";
        public const string Create = "teachers.create";
        public const string Edit   = "teachers.edit";
        public const string Delete = "teachers.delete";
    }

    // ── Parents ───────────────────────────────────────────────────────────────
    public static class Parents
    {
        public const string View   = "parents.view";
        public const string Create = "parents.create";
        public const string Edit   = "parents.edit";
        public const string Delete = "parents.delete";
    }

    // ── Classes ───────────────────────────────────────────────────────────────
    public static class Classes
    {
        public const string View   = "classes.view";
        public const string Create = "classes.create";
        public const string Edit   = "classes.edit";
        public const string Delete = "classes.delete";
    }

    // ── Sections ──────────────────────────────────────────────────────────────
    public static class Sections
    {
        public const string View   = "sections.view";
        public const string Create = "sections.create";
        public const string Edit   = "sections.edit";
        public const string Delete = "sections.delete";
    }

    // ── Subjects ──────────────────────────────────────────────────────────────
    public static class Subjects
    {
        public const string View   = "subjects.view";
        public const string Create = "subjects.create";
        public const string Edit   = "subjects.edit";
        public const string Delete = "subjects.delete";
    }

    // ── Exams ─────────────────────────────────────────────────────────────────
    public static class Exams
    {
        public const string View   = "exams.view";
        public const string Create = "exams.create";
        public const string Edit   = "exams.edit";
        public const string Delete = "exams.delete";
    }

    // ── Attendance ────────────────────────────────────────────────────────────
    public static class Attendance
    {
        public const string View   = "attendance.view";
        public const string Create = "attendance.create";
        public const string Edit   = "attendance.edit";
        public const string Delete = "attendance.delete";
    }

    // ── Fees ──────────────────────────────────────────────────────────────────
    public static class Fees
    {
        public const string View   = "fees.view";
        public const string Create = "fees.create";
        public const string Edit   = "fees.edit";
        public const string Delete = "fees.delete";
    }

    // ── Expenses ──────────────────────────────────────────────────────────────
    public static class Expenses
    {
        public const string View   = "expenses.view";
        public const string Create = "expenses.create";
        public const string Edit   = "expenses.edit";
        public const string Delete = "expenses.delete";
    }

    // ── Transport ─────────────────────────────────────────────────────────────
    public static class Transport
    {
        public const string View   = "transport.view";
        public const string Create = "transport.create";
        public const string Edit   = "transport.edit";
        public const string Delete = "transport.delete";
    }

    // ── Notices ───────────────────────────────────────────────────────────────
    public static class Notices
    {
        public const string View   = "notices.view";
        public const string Create = "notices.create";
        public const string Edit   = "notices.edit";
        public const string Delete = "notices.delete";
    }

    // ── User Management ───────────────────────────────────────────────────────
    public static class Users
    {
        public const string View   = "users.view";
        public const string Create = "users.create";
        public const string Edit   = "users.edit";
        public const string Delete = "users.delete";
    }

    // ── Role Management ───────────────────────────────────────────────────────
    public static class Roles
    {
        public const string View   = "roles.view";
        public const string Create = "roles.create";
        public const string Edit   = "roles.edit";
        public const string Delete = "roles.delete";
    }

    // ── Reports ───────────────────────────────────────────────────────────────
    public static class Reports
    {
        public const string View = "reports.view";
    }

    // ── SuperAdmin-only ───────────────────────────────────────────────────────
    public static class Tenants
    {
        public const string Manage = "tenants.manage";
        public const string View   = "tenants.view";
    }

    public static class Cms
    {
        public const string View   = "cms.view";
        public const string Manage = "cms.manage";
    }

    /// <summary>
    /// Returns all permissions that should be seeded into the DB.
    /// </summary>
    public static IEnumerable<(string Name, string DisplayName, string Module)> GetAll()
    {
        yield return (Students.View,   "View Students",         "Students");
        yield return (Students.Create, "Create Students",       "Students");
        yield return (Students.Edit,   "Edit Students",         "Students");
        yield return (Students.Delete, "Delete Students",       "Students");

        yield return (Teachers.View,   "View Teachers",         "Teachers");
        yield return (Teachers.Create, "Create Teachers",       "Teachers");
        yield return (Teachers.Edit,   "Edit Teachers",         "Teachers");
        yield return (Teachers.Delete, "Delete Teachers",       "Teachers");

        yield return (Parents.View,    "View Parents",          "Parents");
        yield return (Parents.Create,  "Create Parents",        "Parents");
        yield return (Parents.Edit,    "Edit Parents",          "Parents");
        yield return (Parents.Delete,  "Delete Parents",        "Parents");

        yield return (Classes.View,    "View Classes",          "Classes");
        yield return (Classes.Create,  "Create Classes",        "Classes");
        yield return (Classes.Edit,    "Edit Classes",          "Classes");
        yield return (Classes.Delete,  "Delete Classes",        "Classes");

        yield return (Sections.View,   "View Sections",         "Classes");
        yield return (Sections.Create, "Create Sections",       "Classes");
        yield return (Sections.Edit,   "Edit Sections",         "Classes");
        yield return (Sections.Delete, "Delete Sections",       "Classes");

        yield return (Subjects.View,   "View Subjects",         "Academics");
        yield return (Subjects.Create, "Create Subjects",       "Academics");
        yield return (Subjects.Edit,   "Edit Subjects",         "Academics");
        yield return (Subjects.Delete, "Delete Subjects",       "Academics");

        yield return (Exams.View,      "View Exams",            "Academics");
        yield return (Exams.Create,    "Create Exams",          "Academics");
        yield return (Exams.Edit,      "Edit Exams",            "Academics");
        yield return (Exams.Delete,    "Delete Exams",          "Academics");

        yield return (Attendance.View,   "View Attendance",     "Academics");
        yield return (Attendance.Create, "Mark Attendance",     "Academics");
        yield return (Attendance.Edit,   "Edit Attendance",     "Academics");
        yield return (Attendance.Delete, "Delete Attendance",   "Academics");

        yield return (Fees.View,       "View Fees",             "Finance");
        yield return (Fees.Create,     "Create Fees",           "Finance");
        yield return (Fees.Edit,       "Edit Fees",             "Finance");
        yield return (Fees.Delete,     "Delete Fees",           "Finance");

        yield return (Expenses.View,   "View Expenses",         "Finance");
        yield return (Expenses.Create, "Create Expenses",       "Finance");
        yield return (Expenses.Edit,   "Edit Expenses",         "Finance");
        yield return (Expenses.Delete, "Delete Expenses",       "Finance");

        yield return (Transport.View,  "View Transport",        "Operations");
        yield return (Transport.Create,"Create Transport",      "Operations");
        yield return (Transport.Edit,  "Edit Transport",        "Operations");
        yield return (Transport.Delete,"Delete Transport",      "Operations");

        yield return (Notices.View,    "View Notices",          "Operations");
        yield return (Notices.Create,  "Create Notices",        "Operations");
        yield return (Notices.Edit,    "Edit Notices",          "Operations");
        yield return (Notices.Delete,  "Delete Notices",        "Operations");

        yield return (Users.View,      "View Users",            "Administration");
        yield return (Users.Create,    "Create Users",          "Administration");
        yield return (Users.Edit,      "Edit Users",            "Administration");
        yield return (Users.Delete,    "Delete Users",          "Administration");

        yield return (Roles.View,      "View Roles",            "Administration");
        yield return (Roles.Create,    "Create Roles",          "Administration");
        yield return (Roles.Edit,      "Edit Roles",            "Administration");
        yield return (Roles.Delete,    "Delete Roles",          "Administration");

        yield return (Reports.View,    "View Reports",          "Reports");

        yield return (Tenants.View,    "View Tenants",          "SuperAdmin");
        yield return (Tenants.Manage,  "Manage Tenants",        "SuperAdmin");

        yield return (Cms.View,        "View CMS Settings",     "SuperAdmin");
        yield return (Cms.Manage,      "Manage CMS Settings",   "SuperAdmin");
    }
}
