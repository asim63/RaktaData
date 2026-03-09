create database raktadata;

create type user_role as ENUM (
'CUSTOMER',
'ADMIN',
'STAFF'
);

CREATE TYPE gender_type AS ENUM (
'MALE',
'FEMALE',
'OTHER'
);

CREATE TYPE blood_group_type AS enum (
'A+', 'A-','B+','B-','AB+','AB-','O+','O-'
);

create type component_type as enum (
'Whole Blood',
'PRBC',
'Platelets',
'FFP'
);

create type request_status as enum(
'PENDING','APPROVED','REJECTED'
);

create type urgency_type as enum(
'NORMAL',
'EMERGENCY'
);

create type transaction_action as enum (
'DONATION_ADD',
'REQUEST_FULFILLED',
'EXPIRED',
'MANUAL_ADJUSTMENT'
);


create table users (
 user_id serial primary key,
 username varchar(50) not null unique,
 password varchar(255) not null,
 role user_role not null,
 date_of_creation timestamp not null default current_timestamp
);

create table customer (
 customer_id serial primary key,
 user_id int not null unique,
 name varchar(100) not null,
 date_of_birth date,
 phone_no varchar(15) not null,
 email varchar(100),
 address text,

 constraint fk_customer_user
 	foreign key (user_id)
	references users (user_id)
	on delete cascade
);

create table admin (
admin_id serial primary key,
user_id int not null unique,
admin_name varchar(100) not null,

constraint fk_admin_user
	foreign key (user_id)
	references users (user_id)
	on delete cascade
);

create table staff (
staff_id serial primary key,
user_id int not null unique,
staff_name varchar(100) not null,

constraint fk_staff_user 
	foreign key (user_id)
	references users (user_id)
	on delete cascade
);


CREATE TABLE donor (
    donor_id             SERIAL           PRIMARY KEY,
    donor_name           VARCHAR(100)     NOT NULL,
    date_of_birth        DATE             NOT NULL,
    donor_gender         gender_type      NOT NULL,
    donor_weight         DECIMAL(5,2)     NOT NULL,
    donor_blood_group    blood_group_type,                -- nullable
    donor_blood_pressure VARCHAR(10),                     -- nullable
    donor_phone_no       VARCHAR(15) not null,                     -- nullable
    donor_address        TEXT,                            -- nullable
    hemoglobin           DECIMAL(4,1),                    -- nullable
    has_diabetes         BOOLEAN,                         -- nullable
    has_chronic_illness  BOOLEAN,                         -- nullable
    alcohol_consumption  BOOLEAN,                         -- nullable
    recent_medication    BOOLEAN,                         -- nullable
    last_donation_date   DATE,                            -- nullable
    eligibility_status   BOOLEAN          NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_donor_weight
        CHECK (donor_weight >= 50)
);

create table donation (
 donation_id serial primary key,
 donor_id int not null,
 donation_date date not null default current_date,
 quantity decimal(5,2) not null,
 donor_blood_group blood_group_type,
 component_type component_type not null,

 constraint fk_donation_donor
 	foreign key (donor_id)
	references donor(donor_id)
	on delete restrict
);

create table blood_stock (
stock_id serial primary key,
blood_group blood_group_type not null,
component_type component_type not null,
available_units decimal(5,2) not null default 0,
added_date date not null default current_date,
last_updated timestamp not null default current_timestamp,
expiry_date date not null,

constraint chk_available_units
	check(available_units>=0)

);

create table blood_request (
request_id serial primary key,
customer_id int not null,
patient_name VARCHAR(100) not null,
blood_group blood_group_type not null,
component_type component_type not null,
quantity decimal(5,2) not null, 
urgency urgency_type not null default 'NORMAL',
request_date timestamp not null default current_timestamp,
status request_status not null default 'PENDING',
rejected_reason varchar(255),

constraint fk_request_customer
	foreign key (customer_id)
	references customer (customer_id)
	on delete restrict,

constraint chk_request_quantity
	check (quantity > 0)
);


create table stock_transaction (
transaction_id serial primary key,
stock_id int, 
admin_id int not null,
request_id int,
quantity decimal(5,2) not null,
action transaction_action not null,
transaction_date timestamp not null default current_timestamp,

constraint fk_transaction_stock
	foreign key (stock_id)
	references blood_stock (stock_id)
	on delete set null,
constraint fk_transaction_admin
	foreign key (admin_id)
	references admin (admin_id)
	on delete restrict,
constraint fk_transaction_request
	foreign key (request_id)
	references blood_request (request_id)
	on delete restrict
);


--Indexes for performance optimization

-- Fast blood availability search (SUM query across batches)
CREATE INDEX idx_blood_stock_group_component
    ON blood_stock (blood_group, component_type);

-- Fast expiry cleanup (scheduled event scans this)
CREATE INDEX idx_blood_stock_expiry
    ON blood_stock (expiry_date);

-- Fast emergency donor search
CREATE INDEX idx_donor_eligibility_bloodgroup
    ON donor (eligibility_status, donor_blood_group);

-- Fast admin request queue filtering
CREATE INDEX idx_blood_request_status_date
    ON blood_request (status, request_date);

-- Fast audit log time-range queries
CREATE INDEX idx_stock_transaction_date
    ON stock_transaction (transaction_date);
