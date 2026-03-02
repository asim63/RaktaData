-- View to list urgent blood requests along with their fulfillment status based on current blood stock
create or replace view urgent_fulfillment_list as
select
	br.request_id,
	br.request_date,
	br.urgency,
	br.status,
	br.quantity as requested_quantity,
	br.blood_group,
	br.component_type,

	c.customer_id,
	c.name as customer_name,
	c.phone_no as customer_phone,
	c.email as customer_email,

	coalesce(
		(select sum(bs.available_units)
		 from blood_stock bs
		 where bs.blood_group = br.blood_group
		 and bs.component_type = br.component_type),
		 0
	) as total_available_units,

	case	
		when coalesce(
			(select sum(bs.available_units)
			 from blood_stock bs
			 where bs.blood_group = br.blood_group
			 and bs.component_type = br.component_type),
			 0
			) >= br.quantity
			THEN 'Fulfillable'
			else 'Insufficient Stock'
	end as fulfillment_status

	from blood_request br
	inner join customer c
		on br.customer_id = c.customer_id
	where br.status = 'PENDING'
	order by 
		case br.urgency when 'EMERGENCY' then 0 else 1 end,
		br.request_date asc;


-- View emergency_donor_list to quickly identify eligible donors for urgent requests
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

-- view to summarize blood stock transactions for audit purposes
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
GROUP BY bs.blood_group, bs.component_type
ORDER BY bs.blood_group, bs.component_type;


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


CREATE OR REPLACE VIEW blood_stock_batch_details AS
SELECT
    bs.stock_id,
    bs.blood_group,
    bs.component_type,
    bs.available_units,
    bs.added_date,
    bs.expiry_date,
    bs.last_updated,

    -- Days remaining before expiry
        bs.expiry_date - CURRENT_DATE   AS days_until_expiry,
    CASE
        WHEN    
			(bs.expiry_date - CURRENT_DATE) <= 2
        THEN 'Expiring Soon'
        WHEN 
            (bs.expiry_date - CURRENT_DATE) <= 7
        THEN 'Expiring This Week'
        ELSE 'Good'
    END                              AS expiry_status

FROM blood_stock bs
ORDER BY bs.blood_group, bs.component_type, bs.expiry_date ASC;

