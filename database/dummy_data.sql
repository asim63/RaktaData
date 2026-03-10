-- ============================================
-- RAKTADATA MASSIVE DUMMY DATA
-- Realistic Nepali data for demo/testing
-- ============================================
-- Run this AFTER truncating all tables:
--
-- TRUNCATE TABLE stock_transaction RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE blood_request RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE blood_stock RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE donation RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE donor RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE customer RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE staff RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE admin RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;
-- ============================================


-- ============================================
-- SECTION 1: PGCRYPTO + ADMIN
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (username, password, role)
VALUES ('admin', crypt('admin123', gen_salt('bf', 10)), 'ADMIN');

INSERT INTO admin (user_id, admin_name)
VALUES (
    (SELECT user_id FROM users WHERE username = 'admin'),
    'System Admin'
);


-- ============================================
-- SECTION 2: STAFF ACCOUNTS (5 staff)
-- All passwords = 'staff123'
-- ============================================

INSERT INTO users (username, password, role) VALUES
('ram',    crypt('staff123', gen_salt('bf', 10)), 'STAFF'),
('sita',   crypt('staff123', gen_salt('bf', 10)), 'STAFF'),
('hari',   crypt('staff123', gen_salt('bf', 10)), 'STAFF'),
('kamala', crypt('staff123', gen_salt('bf', 10)), 'STAFF'),
('bikash', crypt('staff123', gen_salt('bf', 10)), 'STAFF');

INSERT INTO staff (user_id, staff_name) VALUES
((SELECT user_id FROM users WHERE username = 'ram'),    'Ram Prasad Adhikari'),
((SELECT user_id FROM users WHERE username = 'sita'),   'Sita Devi Shrestha'),
((SELECT user_id FROM users WHERE username = 'hari'),   'Hari Bahadur Karki'),
((SELECT user_id FROM users WHERE username = 'kamala'), 'Kamala Kumari Tamang'),
((SELECT user_id FROM users WHERE username = 'bikash'), 'Bikash Kumar Rai');


-- ============================================
-- SECTION 3: CUSTOMER ACCOUNTS (10 hospitals)
-- All passwords = 'hospital123'
-- ============================================

INSERT INTO users (username, password, role) VALUES
('bir_hospital',         crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('teaching_hospital',    crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('patan_hospital',       crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('norvic_hospital',      crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('om_hospital',          crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('medicare_hospital',    crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('grande_hospital',      crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('kist_hospital',        crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('manmohan_hospital',    crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER'),
('college_of_medical',   crypt('hospital123', gen_salt('bf', 10)), 'CUSTOMER');

INSERT INTO customer (user_id, name, date_of_birth, phone_no, email, address) VALUES
((SELECT user_id FROM users WHERE username='bir_hospital'),       'Bir Hospital',                    '1889-01-01', '9801234001', 'info@birhospital.gov.np',      'Mahabauddha, Kathmandu'),
((SELECT user_id FROM users WHERE username='teaching_hospital'),  'Tribhuvan University Teaching Hospital', '1956-03-15', '9801234002', 'info@tuth.edu.np',     'Maharajgunj, Kathmandu'),
((SELECT user_id FROM users WHERE username='patan_hospital'),     'Patan Hospital',                  '1982-06-01', '9801234003', 'info@patanhospital.org.np',    'Lagankhel, Lalitpur'),
((SELECT user_id FROM users WHERE username='norvic_hospital'),    'Norvic International Hospital',   '2004-01-01', '9801234004', 'info@norvic.com.np',           'Thapathali, Kathmandu'),
((SELECT user_id FROM users WHERE username='om_hospital'),        'OM Hospital and Research Center', '2001-05-12', '9801234005', 'info@omhospital.com.np',       'Chabahil, Kathmandu'),
((SELECT user_id FROM users WHERE username='medicare_hospital'),  'Medicare National Hospital',      '1998-08-20', '9801234006', 'info@medicare.com.np',         'Minbhawan, Kathmandu'),
((SELECT user_id FROM users WHERE username='grande_hospital'),    'Grande International Hospital',   '2008-11-01', '9801234007', 'info@grande.com.np',           'Tokha, Kathmandu'),
((SELECT user_id FROM users WHERE username='kist_hospital'),      'KIST Medical College',            '2003-07-15', '9801234008', 'info@kistmcth.edu.np',         'Imadol, Lalitpur'),
((SELECT user_id FROM users WHERE username='manmohan_hospital'),  'Manmohan Memorial Hospital',      '1994-02-28', '9801234009', 'info@manmohan.com.np',         'Swoyambhu, Kathmandu'),
((SELECT user_id FROM users WHERE username='college_of_medical'), 'College of Medical Sciences',     '1997-09-10', '9801234010', 'info@cms.edu.np',              'Bharatpur, Chitwan');


-- ============================================
-- SECTION 4: DONORS (50 donors)
-- Mix of eligible, ineligible, unknown blood group
-- Realistic Nepali names across all blood groups
-- ============================================

INSERT INTO donor (
    donor_name, date_of_birth, donor_gender, donor_weight,
    donor_blood_group, donor_blood_pressure, donor_phone_no,
    donor_address, eligibility_status,
    hemoglobin, has_diabetes, has_chronic_illness,
    alcohol_consumption, recent_medication
) VALUES
-- A+ donors (8)
('Ram Bahadur Thapa',      '1995-03-15', 'MALE',   70.50, 'A+',  '120/80', '9841001001', 'Baneshwor, Kathmandu',    TRUE,  13.5, FALSE, FALSE, FALSE, FALSE),
('Rojina Limbu',           '1996-02-28', 'FEMALE', 60.00, 'A+',  '116/74', '9841001010', 'Bhaktapur, Bagmati',      FALSE, 12.8, FALSE, FALSE, FALSE, FALSE),
('Suresh Kumar Joshi',     '1992-07-14', 'MALE',   75.00, 'A+',  '118/78', '9841002001', 'Lalitpur, Bagmati',       TRUE,  14.2, FALSE, FALSE, TRUE,  FALSE),
('Priya Maharjan',         '1999-11-05', 'FEMALE', 54.00, 'A+',  '112/70', '9841002002', 'Patan, Lalitpur',         TRUE,  12.5, FALSE, FALSE, FALSE, FALSE),
('Deepak Basnet',          '1988-04-22', 'MALE',   82.00, 'A+',  '125/82', '9841002003', 'Koteshwor, Kathmandu',    TRUE,  15.0, FALSE, FALSE, FALSE, FALSE),
('Sunita Gurung',          '2001-09-30', 'FEMALE', 52.00, 'A+',  '110/68', '9841002004', 'Pokhara, Gandaki',        TRUE,  12.2, FALSE, FALSE, FALSE, FALSE),
('Binod Shrestha',         '1985-12-18', 'MALE',   78.00, 'A+',  '130/85', '9841002005', 'Thamel, Kathmandu',       FALSE, 13.8, TRUE,  FALSE, FALSE, FALSE),
('Anuja Thapa Magar',      '1997-06-08', 'FEMALE', 58.00, 'A+',  '115/72', '9841002006', 'Butwal, Lumbini',         TRUE,  13.1, FALSE, FALSE, FALSE, FALSE),

-- B+ donors (7)
('Sita Kumari Rai',        '1998-07-22', 'FEMALE', 55.00, 'B+',  '110/70', '9841001002', 'Bhaktapur, Bagmati',      TRUE,  12.9, FALSE, FALSE, FALSE, FALSE),
('Nabin Lama',             '1994-10-12', 'MALE',   72.00, 'B+',  '124/81', '9841001011', 'Patan, Lalitpur',         FALSE, 14.5, FALSE, FALSE, TRUE,  FALSE),
('Prakash Neupane',        '1991-03-25', 'MALE',   68.00, 'B+',  '122/80', '9841003001', 'Biratnagar, Koshi',       TRUE,  14.0, FALSE, FALSE, FALSE, FALSE),
('Manisha Pandey',         '2000-08-14', 'FEMALE', 56.00, 'B+',  '108/65', '9841003002', 'Dharan, Koshi',           TRUE,  12.6, FALSE, FALSE, FALSE, FALSE),
('Santosh Karmacharya',    '1987-01-30', 'MALE',   80.00, 'B+',  '128/84', '9841003003', 'Birgunj, Madhesh',        TRUE,  15.2, FALSE, FALSE, FALSE, FALSE),
('Kabita Tamang',          '2002-05-17', 'FEMALE', 51.00, 'B+',  '112/72', '9841003004', 'Hetauda, Bagmati',        TRUE,  12.4, FALSE, FALSE, FALSE, FALSE),
('Roshan Adhikari',        '1993-11-28', 'MALE',   74.00, 'B+',  '120/78', '9841003005', 'Pokhara, Gandaki',        FALSE, 13.7, FALSE, FALSE, FALSE, FALSE),

-- O+ donors (8)
('Hari Prasad Sharma',     '1990-11-30', 'MALE',   80.00, 'O+',  '130/85', '9841001003', 'Lalitpur, Bagmati',       TRUE,  14.8, FALSE, FALSE, FALSE, FALSE),
('Mina Shrestha',          '1996-04-10', 'FEMALE', 57.00, 'O+',  '114/71', '9841004001', 'Bhaktapur, Bagmati',      TRUE,  13.0, FALSE, FALSE, FALSE, FALSE),
('Arjun Khatri',           '1989-08-05', 'MALE',   76.00, 'O+',  '126/83', '9841004002', 'Butwal, Lumbini',         TRUE,  14.3, FALSE, FALSE, FALSE, FALSE),
('Sabina Maharjan',        '2001-02-20', 'FEMALE', 53.00, 'O+',  '109/67', '9841004003', 'Patan, Lalitpur',         TRUE,  12.7, FALSE, FALSE, FALSE, FALSE),
('Dinesh Tamang',          '1986-06-15', 'MALE',   85.00, 'O+',  '132/86', '9841004004', 'Dolakha, Bagmati',        FALSE, 15.5, FALSE, TRUE,  FALSE, FALSE),
('Nirmala Rai',            '1999-09-22', 'FEMALE', 59.00, 'O+',  '116/73', '9841004005', 'Ilam, Koshi',             TRUE,  13.2, FALSE, FALSE, FALSE, FALSE),
('Bijay Gurung',           '1994-12-08', 'MALE',   71.00, 'O+',  '121/79', '9841004006', 'Gorkha, Gandaki',         TRUE,  14.1, FALSE, FALSE, TRUE,  FALSE),
('Puja Thapa',             '2003-03-14', 'FEMALE', 50.50, 'O+',  '107/65', '9841004007', 'Chitwan, Bagmati',        TRUE,  12.3, FALSE, FALSE, FALSE, FALSE),

-- AB+ donors (5)
('Kamala Devi Gurung',     '2000-05-10', 'FEMALE', 52.00, 'AB+', '115/75', '9841001004', 'Pokhara, Gandaki',        TRUE,  12.8, FALSE, FALSE, FALSE, FALSE),
('Anil Maharjan',          '1991-07-25', 'MALE',   77.00, 'AB+', '123/81', '9841005001', 'Kirtipur, Kathmandu',     TRUE,  14.6, FALSE, FALSE, FALSE, FALSE),
('Sarita Basnet',          '1998-01-12', 'FEMALE', 56.00, 'AB+', '113/71', '9841005002', 'Bhaktapur, Bagmati',      FALSE, 13.4, FALSE, FALSE, FALSE, FALSE),
('Niraj Shrestha',         '1987-09-05', 'MALE',   79.00, 'AB+', '127/83', '9841005003', 'Lalitpur, Bagmati',       TRUE,  15.1, FALSE, FALSE, FALSE, FALSE),
('Laxmi Tamang',           '2002-11-18', 'FEMALE', 51.50, 'AB+', '110/69', '9841005004', 'Sindhupalchok, Bagmati',  TRUE,  12.1, FALSE, FALSE, FALSE, FALSE),

-- A- donors (4)
('Bikash Tamang',          '1993-09-18', 'MALE',   75.00, 'A-',  '125/82', '9841001005', 'Butwal, Lumbini',         TRUE,  14.4, FALSE, FALSE, FALSE, FALSE),
('Kripa Shrestha',         '1997-04-03', 'FEMALE', 55.00, 'A-',  '111/70', '9841006001', 'Pokhara, Gandaki',        TRUE,  13.3, FALSE, FALSE, FALSE, FALSE),
('Suman Khadka',           '1990-12-20', 'MALE',   73.00, 'A-',  '122/80', '9841006002', 'Kathmandu, Bagmati',      FALSE, 14.7, FALSE, FALSE, FALSE, FALSE),
('Bimala Rai',             '2001-06-09', 'FEMALE', 53.00, 'A-',  '108/66', '9841006003', 'Dhankuta, Koshi',         TRUE,  12.6, FALSE, FALSE, FALSE, FALSE),

-- B- donors (4)
('Dipak Shrestha',         '1988-04-25', 'MALE',   90.00, 'B-',  '128/84', '9841001007', 'Thamel, Kathmandu',       TRUE,  15.3, FALSE, FALSE, FALSE, FALSE),
('Rekha Gurung',           '1995-08-14', 'FEMALE', 57.00, 'B-',  '113/72', '9841007001', 'Kaski, Gandaki',          TRUE,  13.5, FALSE, FALSE, FALSE, FALSE),
('Manoj Adhikari',         '1989-02-28', 'MALE',   76.00, 'B-',  '124/82', '9841007002', 'Sunsari, Koshi',          FALSE, 14.9, FALSE, FALSE, TRUE,  FALSE),
('Gita Karmacharya',       '2000-10-15', 'FEMALE', 54.00, 'B-',  '109/67', '9841007003', 'Lalitpur, Bagmati',       TRUE,  12.8, FALSE, FALSE, FALSE, FALSE),

-- O- donors (4)
('Sunita Magar',           '1997-12-05', 'FEMALE', 58.00, 'O-',  '118/76', '9841001006', 'Dharan, Koshi',           TRUE,  13.6, FALSE, FALSE, FALSE, FALSE),
('Rajan Thapa',            '1992-05-20', 'MALE',   72.00, 'O-',  '120/79', '9841008001', 'Kathmandu, Bagmati',      TRUE,  14.2, FALSE, FALSE, FALSE, FALSE),
('Shriya Shrestha',        '1999-03-08', 'FEMALE', 55.00, 'O-',  '112/71', '9841008002', 'Bhaktapur, Bagmati',      FALSE, 13.0, FALSE, FALSE, FALSE, FALSE),
('Naresh Rai',             '1986-11-25', 'MALE',   80.00, 'O-',  '126/83', '9841008003', 'Taplejung, Koshi',        TRUE,  15.0, FALSE, FALSE, FALSE, FALSE),

-- AB- donors (4)
('Anita Karki',            '2001-08-14', 'FEMALE', 51.00, 'AB-', '112/72', '9841001008', 'Chitwan, Bagmati',        TRUE,  12.5, FALSE, FALSE, FALSE, FALSE),
('Puskar Lama',            '1994-04-30', 'MALE',   69.00, 'AB-', '119/77', '9841009001', 'Kathmandu, Bagmati',      TRUE,  13.9, FALSE, FALSE, FALSE, FALSE),
('Roshani Tamang',         '1998-09-12', 'FEMALE', 56.00, 'AB-', '114/73', '9841009002', 'Kavre, Bagmati',          FALSE, 13.2, FALSE, FALSE, FALSE, FALSE),
('Kiran Shrestha',         '1991-01-18', 'MALE',   74.00, 'AB-', '122/80', '9841009003', 'Bhaktapur, Bagmati',      TRUE,  14.5, FALSE, FALSE, FALSE, FALSE),

-- Unknown blood group donors (6)
('Prakash Adhikari',       '1992-06-20', 'MALE',   68.00, NULL,  '122/80', '9841001009', 'Biratnagar, Koshi',       TRUE,  NULL, NULL,  NULL,  NULL,  NULL),
('Saraswati Devi Yadav',   '1996-03-14', 'FEMALE', 55.00, NULL,  '115/73', '9841010001', 'Janakpur, Madhesh',       TRUE,  NULL, NULL,  NULL,  NULL,  NULL),
('Ganesh Prasad Poudel',   '1990-08-22', 'MALE',   70.00, NULL,  '120/78', '9841010002', 'Pokhara, Gandaki',        TRUE,  NULL, NULL,  NULL,  NULL,  NULL),
('Kopila Shrestha',        '2000-12-01', 'FEMALE', 52.00, NULL,  '110/68', '9841010003', 'Lalitpur, Bagmati',       TRUE,  NULL, NULL,  NULL,  NULL,  NULL),
('Bikram Rai',             '1988-07-16', 'MALE',   77.00, NULL,  '124/82', '9841010004', 'Dharan, Koshi',           TRUE,  NULL, NULL,  NULL,  NULL,  NULL),
('Radha Kumari Thapa',     '1995-05-28', 'FEMALE', 57.00, NULL,  '116/74', '9841010005', 'Chitwan, Bagmati',        TRUE,  NULL, NULL,  NULL,  NULL,  NULL);


-- Update last_donation_date for ineligible donors
UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '20 days'
WHERE donor_name = 'Rojina Limbu';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '45 days'
WHERE donor_name = 'Nabin Lama';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '15 days'
WHERE donor_name = 'Binod Shrestha';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '60 days'
WHERE donor_name = 'Roshan Adhikari';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '30 days'
WHERE donor_name = 'Dinesh Tamang';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '75 days'
WHERE donor_name = 'Sarita Basnet';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '50 days'
WHERE donor_name = 'Suman Khadka';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '40 days'
WHERE donor_name = 'Manoj Adhikari';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '25 days'
WHERE donor_name = 'Shriya Shrestha';

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '55 days'
WHERE donor_name = 'Roshani Tamang';


-- ============================================
-- SECTION 5: BLOOD STOCK (40+ batches)
-- Various blood groups, components, and units
-- Trigger 2 auto-sets expiry dates
-- ============================================

-- A+ stock (varied units)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'Whole Blood', 3.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'Whole Blood', 4.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'PRBC', 6.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'PRBC', 5.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'Platelets', 2.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'Platelets', 3.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'FFP', 8.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'FFP', 7.00);

-- B+ stock
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B+', 'Whole Blood', 5.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B+', 'Whole Blood', 7.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B+', 'PRBC', 4.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B+', 'Platelets', 2.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B+', 'FFP', 10.00);

-- O+ stock (most common — more units)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'Whole Blood', 8.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'Whole Blood', 6.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'Whole Blood', 5.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'PRBC', 9.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'PRBC', 4.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'Platelets', 7.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'FFP', 12.00);

-- AB+ stock
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('AB+', 'Whole Blood', 3.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('AB+', 'PRBC', 5.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('AB+', 'FFP', 15.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('AB+', 'FFP', 10.00);

-- A- stock (rare)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A-', 'Whole Blood', 2.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A-', 'PRBC', 1.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A-', 'FFP', 4.00);

-- B- stock (rare)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B-', 'Whole Blood', 3.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B-', 'PRBC', 2.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B-', 'Platelets', 1.00);

-- O- stock (universal donor — critical)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O-', 'Whole Blood', 2.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O-', 'PRBC', 1.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O-', 'FFP', 3.00);

-- AB- stock (rarest)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('AB-', 'Whole Blood', 1.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('AB-', 'FFP', 2.00);

-- Nearly expired batches (for testing cron job)
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('A+', 'Platelets', 1.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('B+', 'Platelets', 1.00);
INSERT INTO blood_stock (blood_group, component_type, available_units) VALUES ('O+', 'Platelets', 2.00);

-- Override expiry to test cleanup
UPDATE blood_stock SET expiry_date = CURRENT_DATE - INTERVAL '1 day'
WHERE stock_id = (SELECT MAX(stock_id) - 2 FROM blood_stock);

UPDATE blood_stock SET expiry_date = CURRENT_DATE - INTERVAL '2 days'
WHERE stock_id = (SELECT MAX(stock_id) - 1 FROM blood_stock);

UPDATE blood_stock SET expiry_date = CURRENT_DATE - INTERVAL '3 days'
WHERE stock_id = (SELECT MAX(stock_id) FROM blood_stock);


-- ============================================
-- SECTION 6: DONATIONS (40+ donations)
-- Mix of old (90+ days) and recent donations
-- Trigger 1 fires on each insert
-- ============================================

-- Old donations (90+ days ago — donors stay eligible)
INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '120 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Ram Bahadur Thapa';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '100 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Sita Kumari Rai';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '150 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Hari Prasad Sharma';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '200 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Kamala Devi Gurung';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '95 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Bikash Tamang';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '180 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Sunita Magar';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '110 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Dipak Shrestha';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '130 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Anita Karki';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '92 days', 1.00, donor_blood_group, 'PRBC'
FROM donor WHERE donor_name = 'Suresh Kumar Joshi';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '160 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Priya Maharjan';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '210 days', 1.00, donor_blood_group, 'FFP'
FROM donor WHERE donor_name = 'Deepak Basnet';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '140 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Sunita Gurung';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '98 days', 1.00, donor_blood_group, 'Platelets'
FROM donor WHERE donor_name = 'Anuja Thapa Magar';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '175 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Prakash Neupane';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '105 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Manisha Pandey';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '190 days', 1.00, donor_blood_group, 'PRBC'
FROM donor WHERE donor_name = 'Santosh Karmacharya';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '115 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Kabita Tamang';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '145 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Mina Shrestha';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '220 days', 1.00, donor_blood_group, 'FFP'
FROM donor WHERE donor_name = 'Arjun Khatri';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '96 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Sabina Maharjan';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '185 days', 1.00, donor_blood_group, 'Platelets'
FROM donor WHERE donor_name = 'Nirmala Rai';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '125 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Bijay Gurung';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '155 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Puja Thapa';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '93 days', 1.00, donor_blood_group, 'PRBC'
FROM donor WHERE donor_name = 'Anil Maharjan';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '170 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Niraj Shrestha';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '108 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Laxmi Tamang';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '135 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Kripa Shrestha';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '195 days', 1.00, donor_blood_group, 'FFP'
FROM donor WHERE donor_name = 'Bimala Rai';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '112 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Rekha Gurung';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '165 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Gita Karmacharya';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '148 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Rajan Thapa';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '200 days', 1.00, donor_blood_group, 'PRBC'
FROM donor WHERE donor_name = 'Naresh Rai';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '118 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Puskar Lama';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '142 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Kiran Shrestha';

-- Recent donations (ineligible donors — within 90 days)
INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '20 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Rojina Limbu';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '45 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Nabin Lama';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '15 days', 1.00, donor_blood_group, 'PRBC'
FROM donor WHERE donor_name = 'Binod Shrestha';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '60 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Roshan Adhikari';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '30 days', 1.00, donor_blood_group, 'Platelets'
FROM donor WHERE donor_name = 'Dinesh Tamang';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '75 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Sarita Basnet';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '50 days', 1.00, donor_blood_group, 'PRBC'
FROM donor WHERE donor_name = 'Suman Khadka';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '40 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Manoj Adhikari';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '25 days', 1.00, donor_blood_group, 'Whole Blood'
FROM donor WHERE donor_name = 'Shriya Shrestha';

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
SELECT donor_id, CURRENT_DATE - INTERVAL '55 days', 1.00, donor_blood_group, 'FFP'
FROM donor WHERE donor_name = 'Roshani Tamang';


-- Reset eligibility for donors who donated 90+ days ago
UPDATE donor
SET eligibility_status = TRUE
WHERE eligibility_status = FALSE
AND last_donation_date <= CURRENT_DATE - INTERVAL '90 days';


-- ============================================
-- SECTION 7: BLOOD REQUESTS (20 requests)
-- Mix of NORMAL and EMERGENCY
-- Mix of PENDING, APPROVED, REJECTED
-- Trigger 3 auto-rejects insufficient stock
-- ============================================

-- PENDING requests (will be approved/rejected manually)
INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (1, 'Krishna Bahadur Thapa',   'O+',  'Whole Blood', 2.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (2, 'Sunita Karmacharya',      'A+',  'Whole Blood', 3.00, 'EMERGENCY');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (3, 'Mina Shrestha',           'AB+', 'FFP',        1.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (4, 'Bikram Rai',              'O-',  'Whole Blood', 1.00, 'EMERGENCY');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (5, 'Aarav Sharma',            'B+',  'PRBC',        2.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (6, 'Pratima Adhikari',        'O+',  'Platelets',   3.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (7, 'Saroj Thapa',             'A+',  'PRBC',        2.00, 'EMERGENCY');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (8, 'Anisha Rai',              'B+',  'Whole Blood', 1.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (9, 'Roshan Karki',            'AB+', 'PRBC',        1.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (10, 'Priya Gurung',           'O+',  'FFP',         2.00, 'NORMAL');

-- Auto-rejected requests (insufficient stock)
INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (1, 'Ramesh Pradhan',          'A-',  'PRBC',        10.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (2, 'Sushila Tamang',          'AB-', 'Whole Blood', 5.00,  'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (3, 'Dipendra Lama',           'O-',  'PRBC',        8.00,  'EMERGENCY');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (4, 'Kamala Shrestha',         'B-',  'Platelets',   6.00,  'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (5, 'Niraj Basnet',            'A-',  'Whole Blood', 5.00,  'EMERGENCY');

-- More pending requests
INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (6, 'Sabina Poudel',           'A+',  'FFP',         2.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (7, 'Manish Rai',              'B+',  'FFP',         3.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (8, 'Sushmita Karmacharya',    'O+',  'PRBC',        2.00, 'EMERGENCY');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (9, 'Aakash Thapa',            'AB+', 'Whole Blood', 1.00, 'NORMAL');

INSERT INTO blood_request (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (10, 'Prabha Gurung',          'O-',  'FFP',         1.00, 'EMERGENCY');


-- ============================================
-- SUMMARY
-- ============================================
-- Users:    1 admin + 5 staff + 10 customers = 16
-- Donors:   50 donors (all blood groups)
-- Blood Stock: 40+ batches (3 expired for cron test)
-- Donations: 44 donations
-- Requests:  20 requests (mix pending/auto-rejected)
-- ============================================