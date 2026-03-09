--1) View to list urgent blood requests along with their fulfillment status based on current blood stock
DROP VIEW IF EXISTS urgent_fulfillment_list;

CREATE VIEW urgent_fulfillment_list AS
SELECT
    br.request_id,
    br.patient_name,
    c.name        AS customer_name,
    c.phone_no    AS customer_phone,
    c.email       AS customer_email,
    br.blood_group,
    br.component_type,
    br.quantity   AS requested_quantity,
    br.urgency,
    br.status,
    br.rejected_reason,
    br.request_date,

    COALESCE((
        SELECT SUM(bs.available_units)
        FROM blood_stock bs
        WHERE bs.blood_group    = br.blood_group
          AND bs.component_type = br.component_type
          AND bs.expiry_date   >= CURRENT_DATE
    ), 0) AS total_available_units,

    CASE
        WHEN COALESCE((
            SELECT SUM(bs.available_units)
            FROM blood_stock bs
            WHERE bs.blood_group    = br.blood_group
              AND bs.component_type = br.component_type
              AND bs.expiry_date   >= CURRENT_DATE
        ), 0) >= br.quantity
        THEN 'Can Fulfill'
        ELSE 'Insufficient Stock'
    END AS fulfillment_status

FROM blood_request br
JOIN customer c ON c.customer_id = br.customer_id
WHERE br.status = 'PENDING'
ORDER BY
    (br.urgency = 'EMERGENCY') DESC,
    br.request_date ASC;


--2) View emergency_donor_list to quickly identify eligible donors for urgent requests
CREATE OR REPLACE VIEW emergency_donor_list AS
SELECT
    d.donor_id,
    d.donor_name,
    d.donor_blood_group,
    d.donor_phone_no,
    d.donor_address,
    d.last_donation_date,
    -- Show when they last donated for context
    CURRENT_DATE - d.last_donation_date  AS days_since_last_donation
FROM donor d
WHERE d.eligibility_status = TRUE
ORDER BY d.donor_blood_group, d.donor_name;

--3) view to summarize blood stock transactions for audit purposes
CREATE OR REPLACE VIEW stock_audit_summary AS
SELECT
    st.transaction_id,
    st.transaction_date,

    -- Human readable action label
    CASE st.action
        WHEN 'DONATION_ADD'      THEN 'Stock Added'
        WHEN 'REQUEST_FULFILLED' THEN 'Request Fulfilled'
        WHEN 'EXPIRED'           THEN 'Expired and Removed'
        WHEN 'MANUAL_ADJUSTMENT' THEN 'Manual Adjustment'
    END                                 AS action_label,

    -- Raw action for frontend color coding
    st.action,

    -- Blood details
    -- LEFT JOIN because stock row may be deleted (expiry)
    COALESCE(bs.blood_group::TEXT, 'N/A')    AS blood_group,
    COALESCE(bs.component_type::TEXT, 'N/A') AS component_type,

    -- Quantity
    st.quantity,

    -- Who performed the action
    a.admin_name                        AS handled_by,

    -- Linked request if applicable
    COALESCE(st.request_id::TEXT, '-')  AS request_reference,

    -- Customer name if request related
    COALESCE(c.name, '-')               AS customer_name

FROM stock_transaction st
LEFT JOIN blood_stock bs
    ON st.stock_id = bs.stock_id       -- LEFT: stock row may be deleted
INNER JOIN admin a
    ON st.admin_id = a.admin_id
LEFT JOIN blood_request br
    ON st.request_id = br.request_id   -- LEFT: not all transactions have request
LEFT JOIN customer c
    ON br.customer_id = c.customer_id
ORDER BY st.transaction_date DESC;    


--4) view to provide a summary of blood stock levels by blood group and component type for dashboard display
CREATE OR REPLACE VIEW blood_availability_summary AS
SELECT
    bs.blood_group,
    bs.component_type,
    SUM(bs.available_units)          AS total_available_units,
    COUNT(bs.stock_id)               AS active_batches,
    MIN(bs.expiry_date)              AS nearest_expiry_date,

    -- Status for UI badge (Critical/Low/Stable/Out of Stock)
    CASE
        WHEN SUM(bs.available_units) = 0  THEN 'Out of Stock'
        WHEN SUM(bs.available_units) < 5  THEN 'Critical'
        WHEN SUM(bs.available_units) < 10 THEN 'Low'
        ELSE 'Stable'
    END                              AS availability_status

FROM blood_stock bs
where bs.expiry_date >= CURRENT_DATE  -- only consider non-expired stock
GROUP BY bs.blood_group, bs.component_type
ORDER BY bs.blood_group, bs.component_type;

--5) view to see donors history of donations 
CREATE OR REPLACE VIEW donor_donation_history AS
SELECT
    d.donor_id,
    d.donor_name,
    d.date_of_birth,

    -- Age derived from date_of_birth
    DATE_PART('year',
        AGE(CURRENT_DATE, d.date_of_birth)
    )                                   AS age,

    d.donor_gender,
    d.donor_blood_group,
    d.donor_phone_no,
    d.donor_address,
    d.last_donation_date,
    d.eligibility_status,

    -- When can they donate again?
    CASE
        WHEN d.eligibility_status = FALSE
        THEN d.last_donation_date + INTERVAL '90 days'
        ELSE NULL
    END                                 AS eligible_again_date,

    -- Donation details
    dn.donation_id,
    dn.donation_date,
    dn.quantity,
    dn.component_type,
    dn.donor_blood_group                AS donated_blood_group,

    -- Total donations count for this donor
    COUNT(dn.donation_id)
        OVER (PARTITION BY d.donor_id)  AS total_donations

FROM donor d
INNER JOIN donation dn                 -- INNER: only donors with donations
    ON d.donor_id = dn.donor_id
ORDER BY d.donor_id, dn.donation_date DESC;


--6) view for active blood stock inventory
CREATE OR REPLACE VIEW active_stock_inventory AS
SELECT 
    bs.stock_id,
    bs.blood_group,
    bs.component_type,
    bs.available_units,
    bs.added_date,
    bs.expiry_date,
    bs.last_updated,
    bs.expiry_date - CURRENT_DATE AS days_until_expiry,
    CASE
        WHEN (bs.expiry_date - CURRENT_DATE)::INT <= 2 THEN 'Expiring Soon'
        WHEN (bs.expiry_date - CURRENT_DATE)::INT <= 7 THEN 'Expiring This Week'
        ELSE 'Good'
    END AS expiry_status,

    -- ← add this!
    CASE
        WHEN bs.available_units = 0  THEN 'Out of Stock'
        WHEN bs.available_units < 5  THEN 'Critical'
        WHEN bs.available_units < 10 THEN 'Low'
        ELSE 'Stable'
    END AS availability_status

FROM blood_stock bs
WHERE bs.available_units > 0
AND bs.expiry_date >= CURRENT_DATE
ORDER BY bs.blood_group, bs.component_type, bs.expiry_date ASC;