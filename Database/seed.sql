-- ============================================================
-- seed.sql  — Demo data for School Management System
-- Run this AFTER migrations and stored procedures.
-- WARNING: Truncates all data before inserting.
-- ============================================================

-- Disable triggers during seed
SET session_replication_role = replica;

-- Truncate all tables (cascading)
TRUNCATE TABLE
    exam_grades, attendances, fees, expenses, student_transports,
    class_routines, exams, students, teachers, parents, notices,
    teacher_payments, sections, subjects, classes
RESTART IDENTITY CASCADE;

-- Reset Identity tables (AspNetUsers etc.) – optional: comment out to keep users
-- TRUNCATE TABLE "AspNetUserRoles", "AspNetUsers", "AspNetRoles" RESTART IDENTITY CASCADE;

SET session_replication_role = DEFAULT;

-- ─── Classes ────────────────────────────────────────────────────────────────
INSERT INTO classes (name, created_at, updated_at, is_deleted) VALUES
('Class One',   NOW(), NOW(), false),
('Class Two',   NOW(), NOW(), false),
('Class Three', NOW(), NOW(), false),
('Class Four',  NOW(), NOW(), false),
('Class Five',  NOW(), NOW(), false);

-- ─── Sections ───────────────────────────────────────────────────────────────
INSERT INTO sections (name, class_id, created_at, updated_at, is_deleted) VALUES
('Section A', 1, NOW(), NOW(), false),
('Section B', 1, NOW(), NOW(), false),
('Section A', 2, NOW(), NOW(), false),
('Section B', 2, NOW(), NOW(), false),
('Section A', 3, NOW(), NOW(), false),
('Section A', 4, NOW(), NOW(), false),
('Section A', 5, NOW(), NOW(), false);

-- ─── Subjects ───────────────────────────────────────────────────────────────
INSERT INTO subjects (name, subject_type, subject_code, class_id, created_at, updated_at, is_deleted) VALUES
('Mathematics',    'Theory',    'MATH101', 1, NOW(), NOW(), false),
('English',        'Theory',    'ENG101',  1, NOW(), NOW(), false),
('Science',        'Theory',    'SCI101',  1, NOW(), NOW(), false),
('Mathematics',    'Theory',    'MATH201', 2, NOW(), NOW(), false),
('English',        'Theory',    'ENG201',  2, NOW(), NOW(), false),
('Social Studies', 'Theory',    'SS201',   2, NOW(), NOW(), false),
('Mathematics',    'Theory',    'MATH301', 3, NOW(), NOW(), false),
('Physics',        'Theory',    'PHY301',  3, NOW(), NOW(), false),
('Chemistry',      'Practical', 'CHEM301', 3, NOW(), NOW(), false),
('Mathematics',    'Theory',    'MATH401', 4, NOW(), NOW(), false),
('Biology',        'Practical', 'BIO401',  4, NOW(), NOW(), false),
('History',        'Theory',    'HIST501', 5, NOW(), NOW(), false);

-- ─── Parents ────────────────────────────────────────────────────────────────
INSERT INTO parents (name, email, phone, address, occupation, created_at, updated_at, is_deleted) VALUES
('Ahmed Khan',       'ahmed.khan@email.com',     '0301-1234567', '123 Main St, Karachi',   'Engineer',    NOW(), NOW(), false),
('Sara Malik',       'sara.malik@email.com',      '0302-2345678', '456 Garden Rd, Lahore',  'Teacher',     NOW(), NOW(), false),
('Bilal Hassan',     'bilal.hassan@email.com',    '0303-3456789', '789 Park Ave, Islamabad','Businessman', NOW(), NOW(), false),
('Fatima Sheikh',    'fatima.sheikh@email.com',   '0304-4567890', '101 Rose St, Peshawar',  'Doctor',      NOW(), NOW(), false),
('Imran Ali',        'imran.ali@email.com',        '0305-5678901', '202 Blue St, Quetta',    'Lawyer',      NOW(), NOW(), false),
('Nadia Hussain',    'nadia.hussain@email.com',   '0306-6789012', '303 Green Ave, Multan',  'Accountant',  NOW(), NOW(), false),
('Rashid Qureshi',   'rashid.qureshi@email.com',  '0307-7890123', '404 White Rd, Rawalpindi','Pharmacist', NOW(), NOW(), false),
('Amina Baig',       'amina.baig@email.com',       '0308-8901234', '505 Yellow St, Sialkot', 'Nurse',       NOW(), NOW(), false),
('Tariq Mahmood',    'tariq.mahmood@email.com',   '0309-9012345', '606 Silver Rd, Hyderabad','Manager',    NOW(), NOW(), false),
('Zara Farooq',      'zara.farooq@email.com',      '0310-0123456', '707 Gold Ave, Faisalabad','Professor',  NOW(), NOW(), false),
('Hassan Raza',      'hassan.raza@email.com',      '0311-1234560', '808 Brown St, Gujranwala','Shopkeeper', NOW(), NOW(), false),
('Mehnaz Iqbal',     'mehnaz.iqbal@email.com',    '0312-2345601', '909 Copper Rd, Sargodha', 'Housewife',  NOW(), NOW(), false),
('Shahid Nawaz',     'shahid.nawaz@email.com',     '0313-3456012', '1010 Iron Ave, Bahawalpur','Contractor', NOW(), NOW(), false),
('Rukhsana Butt',    'rukhsana.butt@email.com',   '0314-4560123', '1111 Steel St, Sukkur',  'Principal',   NOW(), NOW(), false),
('Faisal Chaudhry',  'faisal.chaudhry@email.com', '0315-5601234', '1212 Stone Rd, Mardan',  'Police',      NOW(), NOW(), false);

-- ─── Teachers ───────────────────────────────────────────────────────────────
INSERT INTO teachers (first_name, last_name, gender, date_of_birth, email, phone, address, subject_id, class_id, section_id, joining_date, created_at, updated_at, is_deleted) VALUES
('Kamran',  'Ahmed',    'Male',   '1985-03-15', 'kamran.ahmed@school.com',   '0321-1111111', '10 Teacher Ave, Karachi',   1,  1, 1, '2018-01-10', NOW(), NOW(), false),
('Sadia',   'Rehman',   'Female', '1988-07-22', 'sadia.rehman@school.com',   '0322-2222222', '20 Staff Rd, Lahore',       2,  1, 2, '2019-03-15', NOW(), NOW(), false),
('Nadeem',  'Akhtar',   'Male',   '1982-11-05', 'nadeem.akhtar@school.com',  '0323-3333333', '30 Faculty Blvd, Islamabad',3,  1, 1, '2017-06-01', NOW(), NOW(), false),
('Farah',   'Siddiqui', 'Female', '1990-04-18', 'farah.siddiqui@school.com', '0324-4444444', '40 School Lane, Peshawar',  4,  2, 3, '2020-08-20', NOW(), NOW(), false),
('Usman',   'Mirza',    'Male',   '1979-09-30', 'usman.mirza@school.com',    '0325-5555555', '50 College St, Quetta',     5,  2, 4, '2015-01-05', NOW(), NOW(), false),
('Hina',    'Javed',    'Female', '1993-02-14', 'hina.javed@school.com',     '0326-6666666', '60 Academy Rd, Multan',     7,  3, 5, '2021-04-10', NOW(), NOW(), false),
('Aamir',   'Shafiq',   'Male',   '1986-08-28', 'aamir.shafiq@school.com',   '0327-7777777', '70 Institute Ave, Sialkot', 8,  3, 5, '2016-09-01', NOW(), NOW(), false),
('Sana',    'Tariq',    'Female', '1991-12-03', 'sana.tariq@school.com',     '0328-8888888', '80 School Blvd, Hyderabad', 9,  3, 5, '2019-11-15', NOW(), NOW(), false),
('Zahid',   'Islam',    'Male',   '1984-06-20', 'zahid.islam@school.com',    '0329-9999999', '90 Campus Rd, Faisalabad',  10, 4, 6, '2018-07-01', NOW(), NOW(), false),
('Razia',   'Bibi',     'Female', '1987-10-11', 'razia.bibi@school.com',     '0330-0000000', '100 Education St, Gujranwala',6, 2, 3, '2017-03-20', NOW(), NOW(), false);

-- ─── Students ───────────────────────────────────────────────────────────────
INSERT INTO students (first_name, last_name, gender, date_of_birth, roll, blood_group, religion, email, phone, address, admission_id, admission_date, class_id, section_id, parent_id, created_at, updated_at, is_deleted) VALUES
('Ali',       'Khan',     'Male',   '2014-03-10', 1,  'APositive', 'Islam',   'ali.khan@student.com',      '0301-1234001', '123 Main St, Karachi',    'ADM001', '2020-01-15', 1, 1, 1,  NOW(), NOW(), false),
('Ayesha',    'Malik',    'Female', '2014-06-22', 2,  'BPositive', 'Islam',   'ayesha.malik@student.com',  '0302-2345002', '456 Garden Rd, Lahore',   'ADM002', '2020-01-15', 1, 1, 2,  NOW(), NOW(), false),
('Omar',      'Hassan',   'Male',   '2014-09-15', 3,  'OPositive', 'Islam',   'omar.hassan@student.com',   '0303-3456003', '789 Park Ave, Islamabad', 'ADM003', '2020-01-15', 1, 1, 3,  NOW(), NOW(), false),
('Hira',      'Sheikh',   'Female', '2014-12-01', 4,  'ABPositive','Islam',   'hira.sheikh@student.com',   '0304-4567004', '101 Rose St, Peshawar',   'ADM004', '2020-01-15', 1, 1, 4,  NOW(), NOW(), false),
('Zain',      'Ali',      'Male',   '2014-05-20', 5,  'ANegative', 'Islam',   'zain.ali@student.com',      '0305-5678005', '202 Blue St, Quetta',     'ADM005', '2020-01-15', 1, 2, 5,  NOW(), NOW(), false),
('Maryam',    'Hussain',  'Female', '2014-08-12', 6,  'BNegative', 'Islam',   'maryam.hussain@student.com','0306-6789006', '303 Green Ave, Multan',   'ADM006', '2020-01-15', 1, 2, 6,  NOW(), NOW(), false),
('Hamza',     'Qureshi',  'Male',   '2014-11-03', 7,  'ONegative', 'Islam',   'hamza.qureshi@student.com', '0307-7890007', '404 White Rd, Rawalpindi','ADM007', '2020-01-15', 1, 2, 7,  NOW(), NOW(), false),
('Fatima',    'Baig',     'Female', '2014-02-28', 8,  'APositive', 'Islam',   'fatima.baig@student.com',   '0308-8901008', '505 Yellow St, Sialkot',  'ADM008', '2020-01-15', 1, 2, 8,  NOW(), NOW(), false),
('Usama',     'Mahmood',  'Male',   '2013-04-17', 9,  'BPositive', 'Islam',   'usama.mahmood@student.com', '0309-9012009', '606 Silver Rd, Hyderabad','ADM009', '2020-01-15', 2, 3, 9,  NOW(), NOW(), false),
('Sobia',     'Farooq',   'Female', '2013-07-25', 10, 'OPositive', 'Islam',   'sobia.farooq@student.com',  '0310-0123010', '707 Gold Ave, Faisalabad','ADM010', '2020-01-15', 2, 3, 10, NOW(), NOW(), false),
('Bilal',     'Raza',     'Male',   '2013-10-08', 11, 'ABNegative','Islam',   'bilal.raza@student.com',    '0311-1234011', '808 Brown St, Gujranwala','ADM011', '2020-01-15', 2, 3, 11, NOW(), NOW(), false),
('Noor',      'Iqbal',    'Female', '2013-01-19', 12, 'APositive', 'Islam',   'noor.iqbal@student.com',    '0312-2345012', '909 Copper Rd, Sargodha', 'ADM012', '2020-01-15', 2, 3, 12, NOW(), NOW(), false),
('Saad',      'Nawaz',    'Male',   '2013-06-30', 13, 'BPositive', 'Islam',   'saad.nawaz@student.com',    '0313-3456013', '1010 Iron Ave, Bahawalpur','ADM013','2020-01-15', 2, 4, 13, NOW(), NOW(), false),
('Zuhra',     'Butt',     'Female', '2013-09-14', 14, 'OPositive', 'Islam',   'zuhra.butt@student.com',    '0314-4567014', '1111 Steel St, Sukkur',   'ADM014', '2020-01-15', 2, 4, 14, NOW(), NOW(), false),
('Asim',      'Chaudhry', 'Male',   '2013-12-27', 15, 'ABPositive','Islam',   'asim.chaudhry@student.com', '0315-5678015', '1212 Stone Rd, Mardan',   'ADM015', '2020-01-15', 2, 4, 15, NOW(), NOW(), false),
('Rabia',     'Ahmed',    'Female', '2012-03-05', 16, 'ANegative', 'Islam',   'rabia.ahmed@student.com',   '0316-6789016', '10 Oak St, Karachi',      'ADM016', '2020-01-15', 3, 5, 1,  NOW(), NOW(), false),
('Faris',     'Rehman',   'Male',   '2012-07-18', 17, 'BNegative', 'Islam',   'faris.rehman@student.com',  '0317-7890017', '20 Pine Rd, Lahore',      'ADM017', '2020-01-15', 3, 5, 2,  NOW(), NOW(), false),
('Madiha',    'Akhtar',   'Female', '2012-11-02', 18, 'ONegative', 'Islam',   'madiha.akhtar@student.com', '0318-8901018', '30 Maple Blvd, Islamabad','ADM018', '2020-01-15', 3, 5, 3,  NOW(), NOW(), false),
('Jawad',     'Siddiqui', 'Male',   '2012-02-16', 19, 'APositive', 'Islam',   'jawad.siddiqui@student.com','0319-9012019', '40 Elm Lane, Peshawar',   'ADM019', '2020-01-15', 3, 5, 4,  NOW(), NOW(), false),
('Amna',      'Mirza',    'Female', '2012-05-29', 20, 'BPositive', 'Islam',   'amna.mirza@student.com',    '0320-0123020', '50 Cedar St, Quetta',     'ADM020', '2020-01-15', 3, 5, 5,  NOW(), NOW(), false),
('Yahya',     'Javed',    'Male',   '2011-04-12', 21, 'OPositive', 'Islam',   'yahya.javed@student.com',   '0321-1234021', '60 Walnut Rd, Multan',    'ADM021', '2020-01-15', 4, 6, 6,  NOW(), NOW(), false),
('Samira',    'Shafiq',   'Female', '2011-08-25', 22, 'ABPositive','Islam',   'samira.shafiq@student.com', '0322-2345022', '70 Birch Ave, Sialkot',   'ADM022', '2020-01-15', 4, 6, 7,  NOW(), NOW(), false),
('Farrukh',   'Tariq',    'Male',   '2011-12-08', 23, 'APositive', 'Islam',   'farrukh.tariq@student.com', '0323-3456023', '80 Sycamore Blvd, Hyderabad','ADM023','2020-01-15',4, 6, 8, NOW(), NOW(), false),
('Huda',      'Islam',    'Female', '2011-03-21', 24, 'BPositive', 'Islam',   'huda.islam@student.com',    '0324-4567024', '90 Acacia Rd, Faisalabad','ADM024', '2020-01-15', 4, 6, 9,  NOW(), NOW(), false),
('Kashif',    'Bibi',     'Male',   '2011-07-04', 25, 'ONegative', 'Islam',   'kashif.bibi@student.com',   '0325-5678025', '100 Jasmine St, Gujranwala','ADM025','2020-01-15', 4, 6, 10, NOW(), NOW(), false),
('Sidra',     'Khan',     'Female', '2010-05-17', 26, 'ABNegative','Islam',   'sidra.khan@student.com',    '0326-6789026', '110 Rosewood Rd, Sargodha','ADM026','2020-01-15', 5, 7, 11, NOW(), NOW(), false),
('Talha',     'Malik',    'Male',   '2010-09-30', 27, 'APositive', 'Islam',   'talha.malik@student.com',   '0327-7890027', '120 Ivory Ave, Bahawalpur','ADM027','2020-01-15', 5, 7, 12, NOW(), NOW(), false),
('Misbah',    'Hassan',   'Female', '2010-01-13', 28, 'BPositive', 'Islam',   'misbah.hassan@student.com', '0328-8901028', '130 Ebony St, Sukkur',    'ADM028', '2020-01-15', 5, 7, 13, NOW(), NOW(), false),
('Abubakar',  'Sheikh',   'Male',   '2010-04-26', 29, 'OPositive', 'Islam',   'abubakar.sheikh@student.com','0329-9012029','140 Mahogany Rd, Mardan', 'ADM029', '2020-01-15', 5, 7, 14, NOW(), NOW(), false),
('Ayaan',     'Ali',      'Male',   '2010-08-09', 30, 'ABPositive','Islam',   'ayaan.ali@student.com',     '0330-0123030', '150 Teak Ave, Karachi',   'ADM030', '2020-01-15', 5, 7, 15, NOW(), NOW(), false),
('Rida',      'Hussain',  'Female', '2010-11-22', 31, 'ANegative', 'Islam',   'rida.hussain@student.com',  '0331-1234031', '160 Bamboo St, Lahore',   'ADM031', '2020-01-15', 5, 7, 1,  NOW(), NOW(), false),
('Ibrahim',   'Qureshi',  'Male',   '2010-02-05', 32, 'BNegative', 'Islam',   'ibrahim.qureshi@student.com','0332-2345032','170 Palm Rd, Islamabad',  'ADM032', '2020-01-15', 5, 7, 2,  NOW(), NOW(), false);

-- ─── Class Routines ──────────────────────────────────────────────────────────
INSERT INTO class_routines (subject_id, class_id, section_id, teacher_id, day, time_slot, effective_date, created_at, updated_at, is_deleted) VALUES
(1, 1, 1, 1, 'Monday',    '08:00-09:00', '2024-01-15', NOW(), NOW(), false),
(2, 1, 1, 2, 'Monday',    '09:00-10:00', '2024-01-15', NOW(), NOW(), false),
(3, 1, 1, 3, 'Tuesday',   '08:00-09:00', '2024-01-15', NOW(), NOW(), false),
(1, 1, 1, 1, 'Wednesday', '08:00-09:00', '2024-01-15', NOW(), NOW(), false),
(4, 2, 3, 4, 'Monday',    '08:00-09:00', '2024-01-15', NOW(), NOW(), false),
(5, 2, 3, 5, 'Monday',    '09:00-10:00', '2024-01-15', NOW(), NOW(), false),
(7, 3, 5, 6, 'Tuesday',   '08:00-09:00', '2024-01-15', NOW(), NOW(), false),
(8, 3, 5, 7, 'Wednesday', '08:00-09:00', '2024-01-15', NOW(), NOW(), false);

-- ─── Exams ──────────────────────────────────────────────────────────────────
INSERT INTO exams (name, subject_id, class_id, section_id, exam_time, exam_date, total_marks, is_published, created_at, updated_at, is_deleted) VALUES
('Mid-Term Test',  1, 1, 1, '09:00', '2024-03-15', 100, true,  NOW(), NOW(), false),
('Final Exam',     2, 1, 1, '10:00', '2024-05-20', 100, true,  NOW(), NOW(), false),
('Class Test',     3, 1, 1, '11:00', '2024-02-10', 50,  true,  NOW(), NOW(), false),
('Mid-Term Test',  4, 2, 3, '09:00', '2024-03-16', 100, true,  NOW(), NOW(), false),
('Annual Exam',    5, 2, 3, '10:00', '2024-06-01', 100, false, NOW(), NOW(), false),
('Mid-Term Test',  7, 3, 5, '09:00', '2024-03-18', 100, true,  NOW(), NOW(), false);

-- ─── Exam Grades ─────────────────────────────────────────────────────────────
INSERT INTO exam_grades (exam_id, student_id, marks_obtained, grade, created_at, updated_at, is_deleted) VALUES
(1, 1, 85, 'A',  NOW(), NOW(), false),
(1, 2, 92, 'A+', NOW(), NOW(), false),
(1, 3, 78, 'B',  NOW(), NOW(), false),
(1, 4, 65, 'C',  NOW(), NOW(), false),
(1, 5, 88, 'A',  NOW(), NOW(), false),
(2, 1, 79, 'B',  NOW(), NOW(), false),
(2, 2, 95, 'A+', NOW(), NOW(), false),
(2, 3, 82, 'A',  NOW(), NOW(), false),
(3, 1, 42, 'A+', NOW(), NOW(), false),
(3, 2, 45, 'A+', NOW(), NOW(), false),
(4, 9, 77, 'B',  NOW(), NOW(), false),
(4, 10, 88, 'A', NOW(), NOW(), false),
(4, 11, 95, 'A+',NOW(), NOW(), false),
(6, 16, 80, 'A', NOW(), NOW(), false),
(6, 17, 72, 'B', NOW(), NOW(), false);

-- ─── Attendances (sample - 2 weeks) ─────────────────────────────────────────
DO $$
DECLARE
    d DATE;
    s_id INT;
BEGIN
    FOR d IN SELECT generate_series('2024-03-01'::date, '2024-03-14'::date, '1 day') LOOP
        IF EXTRACT(DOW FROM d) NOT IN (0, 6) THEN -- skip Sunday=0, Saturday=6
            FOR s_id IN 1..8 LOOP -- Class 1 students
                INSERT INTO attendances (student_id, class_id, section_id, date, is_present, created_at, updated_at, is_deleted)
                VALUES (s_id, 1, CASE WHEN s_id <= 4 THEN 1 ELSE 2 END, d,
                        CASE WHEN RANDOM() > 0.15 THEN true ELSE false END,
                        NOW(), NOW(), false);
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- ─── Fees ────────────────────────────────────────────────────────────────────
INSERT INTO fees (student_id, fee_type, amount, due_date, paid_date, status, created_at, updated_at, is_deleted) VALUES
(1,  'Tuition', 5000, '2024-01-31', '2024-01-28', 'Paid', NOW(), NOW(), false),
(2,  'Tuition', 5000, '2024-01-31', '2024-01-30', 'Paid', NOW(), NOW(), false),
(3,  'Tuition', 5000, '2024-01-31', NULL,          'Due',  NOW(), NOW(), false),
(4,  'Tuition', 5000, '2024-01-31', '2024-02-01', 'Paid', NOW(), NOW(), false),
(5,  'Tuition', 5000, '2024-01-31', NULL,          'Due',  NOW(), NOW(), false),
(6,  'Transport',1500,'2024-01-31', '2024-01-29', 'Paid', NOW(), NOW(), false),
(7,  'Transport',1500,'2024-01-31', NULL,          'Due',  NOW(), NOW(), false),
(8,  'Exam',    2000, '2024-02-28', '2024-02-25', 'Paid', NOW(), NOW(), false),
(9,  'Tuition', 5000, '2024-01-31', '2024-01-27', 'Paid', NOW(), NOW(), false),
(10, 'Tuition', 5000, '2024-01-31', NULL,          'Due',  NOW(), NOW(), false),
(1,  'Tuition', 5000, '2024-02-29', '2024-02-27', 'Paid', NOW(), NOW(), false),
(2,  'Tuition', 5000, '2024-02-29', '2024-02-28', 'Paid', NOW(), NOW(), false);

-- ─── Expenses ────────────────────────────────────────────────────────────────
INSERT INTO expenses (name, expense_type, amount, status, phone, email, date, created_at, updated_at, is_deleted) VALUES
('Kamran Ahmed',   'Salary',     45000, 'Paid',    '0321-1111111', 'kamran.ahmed@school.com',  '2024-01-31', NOW(), NOW(), false),
('Sadia Rehman',   'Salary',     40000, 'Paid',    '0322-2222222', 'sadia.rehman@school.com',  '2024-01-31', NOW(), NOW(), false),
('Electricity',    'Utilities',   8500, 'Paid',    NULL,           NULL,                        '2024-01-25', NOW(), NOW(), false),
('Water Bill',     'Utilities',   2000, 'Due',     NULL,           NULL,                        '2024-02-15', NOW(), NOW(), false),
('Bus Maintenance','Transport',  15000, 'Paid',    '0323-3333333', 'transport@school.com',      '2024-01-20', NOW(), NOW(), false),
('Stationery',     'Supplies',    3500, 'Paid',    NULL,           NULL,                        '2024-01-10', NOW(), NOW(), false),
('Nadeem Akhtar',  'Salary',     42000, 'Pending', '0323-3333333', 'nadeem.akhtar@school.com', '2024-02-28', NOW(), NOW(), false),
('Cleaning',       'Maintenance', 5000, 'Paid',    NULL,           NULL,                        '2024-01-15', NOW(), NOW(), false);

-- ─── Transport ───────────────────────────────────────────────────────────────
INSERT INTO transports (route_title, vehicle_no, driver_name, driver_phone, helper_name, helper_phone, driver_license, created_at, updated_at, is_deleted) VALUES
('Route A - North City',  'KHI-1234', 'Raza Khan',   '0341-1111111', 'Amir Ali',  '0341-2222222', 'DL-12345', NOW(), NOW(), false),
('Route B - South City',  'KHI-5678', 'Hamid Mir',   '0342-3333333', 'Zafar Beg', '0342-4444444', 'DL-23456', NOW(), NOW(), false),
('Route C - East Side',   'KHI-9012', 'Imran Butt',  '0343-5555555', NULL,        NULL,            'DL-34567', NOW(), NOW(), false);

-- ─── Notices ─────────────────────────────────────────────────────────────────
INSERT INTO notices (title, details, posted_by, date, view_count, created_at, updated_at, is_deleted) VALUES
('Annual Sports Day 2024',            'Annual Sports Day will be held on March 25, 2024. All students must participate.',  'Principal', '2024-03-01', 125, NOW(), NOW(), false),
('Parent-Teacher Meeting',            'PTM scheduled for March 10, 2024. Parents are requested to attend.',                'Admin',     '2024-02-28', 87,  NOW(), NOW(), false),
('Mid-Term Exam Schedule Released',   'Mid-term examinations will begin from March 15, 2024. Admit cards are available.', 'Admin',     '2024-02-25', 210, NOW(), NOW(), false),
('School Closed on National Holiday', 'School will remain closed on March 23, 2024 for Pakistan Day.',                    'Principal', '2024-03-18', 95,  NOW(), NOW(), false),
('Fee Submission Reminder',           'Last date for fee submission is January 31, 2024. Please pay on time.',            'Accounts',  '2024-01-20', 180, NOW(), NOW(), false),
('New Academic Session Registration', 'Registration for new academic session 2024-25 is now open.',                       'Admin',     '2024-01-15', 320, NOW(), NOW(), false);
