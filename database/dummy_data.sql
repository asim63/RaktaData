-- Run this file AFTER:
-- schema.sql, triggers.sql, views.sql, procedures.sql
--
-- This file contains realistic Nepali test data
-- designed to test every trigger, view, and
-- stored procedure in the system.

-- SECTION 1: USERS
-- Creates login accounts for:
-- 2 Admins, 2 Staff, 3 Customers
-- Note: passwords are bcrypt hashes of 'password123'
-- In real system, hash via backend before inserting
-- For testing, we use plain text (change later)
-- ============================================

INSERT INTO users (username, password, role) VALUES
-- Admins
('admin_asim',   'password123', 'ADMIN'),    -- user_id = 1
('admin_dibya',  'password123', 'ADMIN'),    -- user_id = 2

-- Staff
('staff_galij',  'password123', 'STAFF'),    -- user_id = 3
('staff_nalisha','password123', 'STAFF'),    -- user_id = 4

-- Customers
('bir_hospital',       'password123', 'CUSTOMER'), -- user_id = 5
('teaching_hospital',  'password123', 'CUSTOMER'), -- user_id = 6
('patan_hospital',     'password123', 'CUSTOMER'); -- user_id = 7


-- SECTION 2: ADMINS

INSERT INTO admin (user_id, admin_name) VALUES
(1, 'Asim Poudel'),    -- admin_id = 1
(2, 'Dibya Shakya');   -- admin_id = 2


-- SECTION 3: STAFF

INSERT INTO staff (user_id, staff_name) VALUES
(3, 'Galij Sunuwar'),   -- staff_id = 1
(4, 'Nalisha Shakya');  -- staff_id = 2

-- SECTION 4: CUSTOMERS

INSERT INTO customer (user_id, name, date_of_birth, phone_no, email, address) VALUES
(5, 'Bir Hospital',      '1889-01-01', '9801234567', 'bir@hospital.gov.np',      'Mahabauddha, Kathmandu'),
(6, 'Teaching Hospital', '1956-01-01', '9801234568', 'teaching@hospital.gov.np', 'Maharajgunj, Kathmandu'),
(7, 'Patan Hospital',    '1956-01-01', '9801234569', 'patan@hospital.gov.np',    'Lagankhel, Lalitpur');

-- SECTION 5: DONORS
-- Realistic Nepali donors with various blood groups
-- Some eligible, some not (for testing)
-- Note: donor_blood_group is nullable
--       last_donation_date is nullable
--       eligibility_status defaults to TRUE

INSERT INTO donor (
    donor_name, date_of_birth, donor_gender,
    donor_weight, donor_blood_group,
    donor_blood_pressure, donor_phone_no,
    donor_address, eligibility_status
) VALUES
-- Eligible donors (eligibility_status = TRUE)
('Ram Bahadur Thapa',   '1995-03-15', 'MALE',   70.50, 'A+',  '120/80', '9841001001', 'Baneshwor, Kathmandu',   TRUE),  -- donor_id = 1
('Sita Kumari Rai',     '1998-07-22', 'FEMALE', 55.00, 'B+',  '110/70', '9841001002', 'Bhaktapur, Bagmati',     TRUE),  -- donor_id = 2
('Hari Prasad Sharma',  '1990-11-30', 'MALE',   80.00, 'O+',  '130/85', '9841001003', 'Lalitpur, Bagmati',      TRUE),  -- donor_id = 3
('Kamala Devi Gurung',  '2000-05-10', 'FEMALE', 52.00, 'AB+', '115/75', '9841001004', 'Pokhara, Gandaki',       TRUE),  -- donor_id = 4
('Bikash Tamang',       '1993-09-18', 'MALE',   75.00, 'A-',  '125/82', '9841001005', 'Butwal, Lumbini',        TRUE),  -- donor_id = 5
('Sunita Magar',        '1997-12-05', 'FEMALE', 58.00, 'O-',  '118/76', '9841001006', 'Dharan, Koshi',          TRUE),  -- donor_id = 6
('Dipak Shrestha',      '1988-04-25', 'MALE',   90.00, 'B-',  '128/84', '9841001007', 'Thamel, Kathmandu',      TRUE),  -- donor_id = 7
('Anita Karki',         '2001-08-14', 'FEMALE', 51.00, 'AB-', '112/72', '9841001008', 'Chitwan, Bagmati',       TRUE),  -- donor_id = 8

-- Donors whose blood group is unknown yet (nullable)
('Prakash Adhikari',    '1992-06-20', 'MALE',   68.00, NULL,  '122/80', '9841001009', 'Biratnagar, Koshi',      TRUE),  -- donor_id = 9

-- Ineligible donors (donated recently — within 90 days)
-- We manually set eligibility = FALSE and last_donation_date
-- Trigger will handle this automatically in real usage
('Rojina Limbu',        '1996-02-28', 'FEMALE', 60.00, 'A+',  '116/74', '9841001010', 'Bhaktapur, Bagmati',     FALSE), -- donor_id = 10
('Nabin Lama',          '1994-10-12', 'MALE',   72.00, 'B+',  '124/81', '9841001011', 'Patan, Lalitpur',        FALSE); -- donor_id = 11


-- Update last_donation_date for ineligible donors
-- (They donated recently so they are in recovery)
UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '30 days'
WHERE donor_id = 10;

UPDATE donor SET last_donation_date = CURRENT_DATE - INTERVAL '45 days'
WHERE donor_id = 11;


-- SECTION 6: BLOOD STOCK
-- Insert various batches with different blood
-- groups, components, and units.
-- NOTE: expiry_date is auto-set by Trigger 2
--       We do NOT manually set it here.
--       This tests Trigger 2 automatically!

-- A+ batches
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('A+', 'Whole Blood', 5.00);   -- stock_id = 1, expires today + 35 days

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('A+', 'Platelets', 3.00);     -- stock_id = 2, expires today + 5 days

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('A+', 'PRBC', 4.00);         -- stock_id = 3, expires today + 35 days

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('A+', 'FFP', 6.00);          -- stock_id = 4, expires today + 365 days

-- B+ batches
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('B+', 'Whole Blood', 8.00);   -- stock_id = 5

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('B+', 'Platelets', 2.00);     -- stock_id = 6

-- O+ batches (most common blood group)
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('O+', 'Whole Blood', 12.00);  -- stock_id = 7

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('O+', 'PRBC', 7.00);         -- stock_id = 8

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('O+', 'Platelets', 9.00);    -- stock_id = 9

-- AB+ batches
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('AB+', 'FFP', 15.00);        -- stock_id = 10

INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('AB+', 'Whole Blood', 3.00); -- stock_id = 11

-- O- batch (rare blood group)
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('O-', 'Whole Blood', 2.00);  -- stock_id = 12

-- A- batch
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('A-', 'PRBC', 1.00);         -- stock_id = 13 (low stock — for testing auto reject)

-- Nearly expired batch (for testing expiry cleanup)
-- We manually override the expiry_date after insert
INSERT INTO blood_stock (blood_group, component_type, available_units)
VALUES ('B-', 'Platelets', 2.00);    -- stock_id = 14

-- Override expiry to yesterday to simulate expiry
UPDATE blood_stock
SET expiry_date = CURRENT_DATE - INTERVAL '1 day'
WHERE stock_id = 14;
-- Use this to test fn_cleanup_expired_stock():
-- SELECT fn_cleanup_expired_stock();





-- SECTION 7: DONATIONS
-- Logging past donations by donors.
-- NOTE: Trigger 1 fires on each INSERT here
--       updating donor eligibility and
--       last_donation_date automatically 
-- We insert donations for donors 1-8 (eligible)
-- and also for donors 10-11 (already ineligible)

-- Donations by eligible donors (older than 90 days)
-- These donors should remain eligible after trigger fires
-- So we need to update their last_donation_date back after

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (1, CURRENT_DATE - INTERVAL '120 days', 1.00, 'A+', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (2, CURRENT_DATE - INTERVAL '100 days', 1.00, 'B+', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (3, CURRENT_DATE - INTERVAL '150 days', 1.00, 'O+', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (4, CURRENT_DATE - INTERVAL '200 days', 1.00, 'AB+', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (5, CURRENT_DATE - INTERVAL '95 days', 1.00, 'A-', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (6, CURRENT_DATE - INTERVAL '180 days', 1.00, 'O-', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (7, CURRENT_DATE - INTERVAL '110 days', 1.00, 'B-', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (8, CURRENT_DATE - INTERVAL '130 days', 1.00, 'AB-', 'Whole Blood');

-- After trigger fires (sets eligibility = FALSE),
-- reset eligibility back to TRUE for donors 1-8
-- because their donation was more than 90 days ago
UPDATE donor
SET eligibility_status = TRUE
WHERE donor_id IN (1, 2, 3, 4, 5, 6, 7, 8)
AND last_donation_date <= CURRENT_DATE - INTERVAL '90 days';

-- Donations by ineligible donors (recent donations)
INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (10, CURRENT_DATE - INTERVAL '30 days', 1.00, 'A+', 'Whole Blood');

INSERT INTO donation (donor_id, donation_date, quantity, donor_blood_group, component_type)
VALUES (11, CURRENT_DATE - INTERVAL '45 days', 1.00, 'B+', 'Whole Blood');
-- Trigger sets eligibility = FALSE for donors 10 and 11 
-- They should NOT appear in emergency_donor_list


-- SECTION 8: BLOOD REQUESTS
-- Various requests from customers.
-- Tests:
-- Trigger 3 (auto reject if insufficient stock)
-- Views (urgent_fulfillment_list)
-- Procedures (approve and reject)


-- Request 1: Fulfillable request (enough stock)
-- Bir Hospital needs 2 units of O+ Whole Blood
-- Stock: 12 units available → should be PENDING 
-- Request 1: Fulfillable request (enough stock)
INSERT INTO blood_request
    (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (1, 'Krishna Bahadur Thapa', 'O+', 'Whole Blood', 2.00, 'NORMAL');

-- Request 2: Emergency fulfillable request
INSERT INTO blood_request
    (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (2, 'Sunita Karmacharya', 'A+', 'Whole Blood', 3.00, 'EMERGENCY');

-- Request 3: Auto-reject test (insufficient stock)
INSERT INTO blood_request
    (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (3, 'Ramesh Pradhan', 'A-', 'PRBC', 5.00, 'NORMAL');

-- Request 4: Another fulfillable request
INSERT INTO blood_request
    (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (1, 'Mina Shrestha', 'AB+', 'FFP', 1.00, 'NORMAL');

-- Request 5: Emergency low stock request
INSERT INTO blood_request
    (customer_id, patient_name, blood_group, component_type, quantity, urgency)
VALUES (2, 'Bikram Rai', 'O-', 'Whole Blood', 2.00, 'EMERGENCY');

--not-checkout

