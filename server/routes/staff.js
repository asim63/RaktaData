const express = require("express");
const router = express.Router();
const pool = require("../db");
const protect = require("../middleware/authMiddleware");

// GET /api/staff/donors
// Protected — Staff only
// View, search and filter all donors
// Query params (all optional):
//   name, blood_group, eligibility_status,

router.get("/donors", protect(["STAFF"]), async (req, res) => {
  const { name, blood_group, eligibility_status, min_age, max_age } = req.query;

  try {
    let query = `
      SELECT
        donor_id,
        donor_name,
        date_of_birth,
        DATE_PART('year', AGE(CURRENT_DATE, date_of_birth)) AS age,
        donor_gender,
        donor_blood_group,
        donor_phone_no,
        donor_address,
        donor_blood_pressure,
        hemoglobin,
        has_diabetes,
        has_chronic_illness,
        alcohol_consumption,
        recent_medication,
        last_donation_date,
        eligibility_status,
        CASE
          WHEN eligibility_status = FALSE
          THEN last_donation_date + INTERVAL '90 days'
          ELSE NULL
        END AS eligible_again_date
      FROM donor
      WHERE 1=1`;
    const params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND donor_name ILIKE $${params.length}`;
    }

    if (blood_group) {
      params.push(blood_group);
      query += ` AND donor_blood_group = $${params.length}`;
    }

    if (eligibility_status !== undefined && eligibility_status !== "") {
      params.push(eligibility_status === "true");
      query += ` AND eligibility_status = $${params.length}`;
    }

    if (min_age) {
      params.push(parseInt(min_age));
      query += ` AND DATE_PART('year', AGE(CURRENT_DATE, date_of_birth)) >= $${params.length}`;
    }

    if (max_age) {
      params.push(parseInt(max_age));
      query += ` AND DATE_PART('year', AGE(CURRENT_DATE, date_of_birth)) <= $${params.length}`;
    }

    query += ` ORDER BY donor_name ASC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Fetch donors error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donors.",
    });
  }
});

// Protected — Staff only
// Search returning donor by name and/or DOB
// Used to pre-fill donation form for returning donor
// Query params (at least one required):
//   name, date_of_birth
// ─────────────────────────────────────────────
router.get("/donors/search", protect(["STAFF"]), async (req, res) => {
  const { name, date_of_birth } = req.query;

  try {
    if (!name && !date_of_birth) {
      return res.status(400).json({
        success: false,
        message: "Please provide name or date of birth to search.",
      });
    }

    let query = `
      SELECT
        donor_id,
        donor_name,
        date_of_birth,
        donor_gender,
        donor_blood_group,
        donor_phone_no,
        donor_address,
        last_donation_date,
        eligibility_status,
        CASE
          WHEN eligibility_status = FALSE
          THEN last_donation_date + INTERVAL '90 days'
          ELSE NULL
        END AS eligible_again_date
      FROM donor
      WHERE 1=1`;
    const params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND donor_name ILIKE $${params.length}`;
    }

    if (date_of_birth) {
      params.push(date_of_birth);
      query += ` AND date_of_birth = $${params.length}`;
    }

    query += ` ORDER BY donor_name ASC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Search donor error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to search donors.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/staff/donors/:id
// Protected — Staff only
// View specific donor details + full donation history
// Uses donor_donation_history view
// NOTE: Must be defined AFTER /donors/search to avoid
// Express matching "search" as a :id parameter
// ─────────────────────────────────────────────
router.get("/donors/:id", protect(["STAFF"]), async (req, res) => {
  const { id } = req.params;

  try {
    // ─── Get donor basic details first ───
    const donorResult = await pool.query(
      `SELECT
        donor_id,
        donor_name,
        date_of_birth,
        DATE_PART('year', AGE(CURRENT_DATE, date_of_birth)) AS age,
        donor_gender,
        donor_blood_group,
        donor_phone_no,
        donor_address,
        donor_blood_pressure,
        hemoglobin,
        has_diabetes,
        has_chronic_illness,
        alcohol_consumption,
        recent_medication,
        last_donation_date,
        eligibility_status,
        CASE
          WHEN eligibility_status = FALSE
          THEN last_donation_date + INTERVAL '90 days'
          ELSE NULL
        END AS eligible_again_date
      FROM donor
      WHERE donor_id = $1`,
      [id],
    );

    if (donorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    // ─── Get donation history from view ───
    const historyResult = await pool.query(
      `SELECT
        donation_id,
        donation_date,
        quantity,
        component_type,
        donated_blood_group,
        total_donations
      FROM donor_donation_history
      WHERE donor_id = $1`,
      [id],
    );

    res.status(200).json({
      success: true,
      data: {
        donor: donorResult.rows[0],
        donations: historyResult.rows,
        total_donations: historyResult.rows.length,
      },
    });
  } catch (err) {
    console.error("Fetch donor error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donor details.",
    });
  }
});

// POST /api/staff/donors
// Protected — Staff only
// Register NEW donor + log their first donation
// Both happen in one transaction
// Triggers that fire automatically:
//   Trigger 1 → updates eligibility + last_donation_date
//   Trigger 6 → validates blood group match

router.post("/donors", protect(["STAFF"]), async (req, res) => {
  const {
    // Donor details
    donor_name,
    date_of_birth,
    donor_gender,
    donor_weight,
    donor_blood_group,
    donor_blood_pressure,
    donor_phone_no,
    donor_address,
    hemoglobin,
    has_diabetes,
    has_chronic_illness,
    alcohol_consumption,
    recent_medication,
    // Donation details
    quantity,
    component_type,
  } = req.body;

  try {
    // ─── Step 1: Validate donor required fields ───
    if (!donor_name || !date_of_birth || !donor_gender || !donor_weight || !donor_phone_no || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Name, date of birth, gender, weight, phone number and quantity are required.",
      });
    }

    // ─── Step 2: Validate minimum weight ───
    if (parseFloat(donor_weight) < 50) {
      return res.status(400).json({
        success: false,
        message: "Donor must weigh at least 50kg.",
      });
    }

    // ─── Step 3: Validate donation required fields ───
    if (!quantity || !component_type) {
      return res.status(400).json({
        success: false,
        message: "Quantity and component type are required.",
      });
    }

    // ─── Step 4: Start transaction ───
    // Both inserts must succeed or neither happens
    await pool.query("BEGIN");

    // ─── Step 5: Insert into donor table ───
    const donorResult = await pool.query(
      `INSERT INTO donor (
        donor_name, date_of_birth, donor_gender,
        donor_weight, donor_blood_group,
        donor_blood_pressure, donor_phone_no,
        donor_address, hemoglobin,
        has_diabetes, has_chronic_illness,
        alcohol_consumption, recent_medication
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        donor_name,
        date_of_birth,
        donor_gender,
        donor_weight,
        donor_blood_group || null,
        donor_blood_pressure || null,
        donor_phone_no || null,
        donor_address || null,
        hemoglobin || null,
        has_diabetes ?? null,
        has_chronic_illness ?? null,
        alcohol_consumption ?? null,
        recent_medication ?? null,
      ],
    );

    const donor_id = donorResult.rows[0].donor_id;

    // ─── Step 6: Insert into donation table ───
    // Trigger 1 fires automatically:
    //   → last_donation_date = today
    //   → eligibility_status = FALSE
    // Trigger 6 fires automatically:
    //   → validates blood group matches donor
    const donationResult = await pool.query(
  `INSERT INTO donation
    (donor_id, quantity, donor_blood_group, component_type)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
  [donor_id, quantity, donorResult.rows[0].donor_blood_group || null, component_type],
);

    // ─── Step 7: Commit transaction ───
    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Donor registered and donation logged successfully!",
      data: {
        donor: donorResult.rows[0],
        donation: donationResult.rows[0],
      },
    });
  } catch (err) {
    // ─── Rollback if anything fails ───
    await pool.query("ROLLBACK");
    console.error("Register donor error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to register donor.",
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/staff/donations
// Protected — Staff only

// ─────────────────────────────────────────────
// POST /api/staff/donations
// Log a donation for a returning donor
// ─────────────────────────────────────────────
router.post("/donations", protect(["STAFF"]), async (req, res) => {
  const { donor_id, quantity, component_type, donation_date } = req.body;
  const staff_id = req.user.staff_id;
  try {
    if (!donor_id || !quantity || !component_type)
      return res.status(400).json({ success: false, message: "Donor ID, quantity and component type are required." });

    const donor = await pool.query("SELECT donor_id, donor_name FROM donor WHERE donor_id = $1", [donor_id]);
    if (donor.rows.length === 0)
      return res.status(404).json({ success: false, message: "Donor not found." });

    await pool.query(
  `INSERT INTO donation (donor_id, quantity, donor_blood_group, component_type)
   VALUES ($1, $2, $3, $4)`,
  [donor_id, quantity, donor.rows[0].donor_blood_group, component_type]
);

    res.status(201).json({ success: true, message: `Donation logged for ${donor.rows[0].donor_name}!` });
  } catch (err) {
    console.error("Log donation error:", err.message);
    res.status(500).json({ success: false, message: "Failed to log donation." });
  }
});

// ─────────────────────────────────────────────
// GET /api/staff/donations/:donor_id
// Get donation history for a specific donor
// ─────────────────────────────────────────────
router.get("/donations/:donor_id", protect(["STAFF"]), async (req, res) => {
  const { donor_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT donation_id, donation_date, component_type, quantity, donor_blood_group
       FROM donation
       WHERE donor_id = $1
       ORDER BY donation_date DESC`,
      [donor_id]
    );
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("Donation history error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch donation history." });
  }
});
// ─────────────────────────────────────────────
// PUT /api/staff/donors/:id
// Protected — Staff only
// Update donor details
// Only provided fields are updated
// COALESCE keeps existing values if not provided
// ─────────────────────────────────────────────
router.put("/donors/:id", protect(["STAFF"]), async (req, res) => {
  const { id } = req.params;
  const {
    donor_name,
    date_of_birth,
    donor_gender,
    donor_weight,
    donor_blood_group,
    donor_blood_pressure,
    donor_phone_no,
    donor_address,
    hemoglobin,
    has_diabetes,
    has_chronic_illness,
    alcohol_consumption,
    recent_medication,
  } = req.body;

  try {
    // ─── Check donor exists ───
    const existing = await pool.query(
      "SELECT donor_id FROM donor WHERE donor_id = $1",
      [id],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    // ─── Update donor ───
    // COALESCE keeps existing DB value if new value is NULL
    const result = await pool.query(
      `UPDATE donor SET
        donor_name           = COALESCE($1,  donor_name),
        date_of_birth        = COALESCE($2,  date_of_birth),
        donor_gender         = COALESCE($3,  donor_gender),
        donor_weight         = COALESCE($4,  donor_weight),
        donor_blood_group    = COALESCE($5,  donor_blood_group),
        donor_blood_pressure = COALESCE($6,  donor_blood_pressure),
        donor_phone_no       = COALESCE($7,  donor_phone_no),
        donor_address        = COALESCE($8,  donor_address),
        hemoglobin           = COALESCE($9,  hemoglobin),
        has_diabetes         = COALESCE($10, has_diabetes),
        has_chronic_illness  = COALESCE($11, has_chronic_illness),
        alcohol_consumption  = COALESCE($12, alcohol_consumption),
        recent_medication    = COALESCE($13, recent_medication)
      WHERE donor_id = $14
      RETURNING *`,
      [
        donor_name || null,
        date_of_birth || null,
        donor_gender || null,
        donor_weight || null,
        donor_blood_group || null,
        donor_blood_pressure || null,
        donor_phone_no || null,
        donor_address || null,
        hemoglobin || null,
        has_diabetes ?? null,
        has_chronic_illness ?? null,
        alcohol_consumption ?? null,
        recent_medication ?? null,
        id,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Donor updated successfully!",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Update donor error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to update donor.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/staff/dashboard
// Protected — Staff only
// Returns overview stats visible to staff
// ─────────────────────────────────────────────
router.get("/dashboard", protect(["STAFF"]), async (req, res) => {
  try {
    const [
      totalDonors,
      bloodComponents,
      totalRequests,
      pendingApproval,
      recentRequests,
      stockOverview,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM donor`),
      pool.query(`
        SELECT COUNT(DISTINCT component_type)
        FROM blood_stock
        WHERE available_units > 0
        AND (expiry_date >= CURRENT_DATE OR expiry_date IS NULL)`),
      pool.query(`SELECT COUNT(*) FROM blood_request`),
      pool.query(`SELECT COUNT(*) FROM blood_request WHERE status = 'PENDING'`),
      pool.query(`
        SELECT
          br.request_id,
          br.patient_name,
          br.blood_group,
          br.component_type,
          br.urgency,
          br.status,
          br.request_date,
          c.name AS requester_name
        FROM blood_request br
        INNER JOIN customer c ON br.customer_id = c.customer_id
        ORDER BY br.request_date DESC
        LIMIT 5`),
      pool.query(`
        SELECT
          blood_group,
          component_type,
          total_available_units,
          availability_status
        FROM blood_availability_summary
        ORDER BY
          CASE availability_status
            WHEN 'Critical'     THEN 1
            WHEN 'Low'          THEN 2
            WHEN 'Stable'       THEN 3
            WHEN 'Out of Stock' THEN 4
          END,
          total_available_units ASC
        LIMIT 8`),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total_donors:    parseInt(totalDonors.rows[0].count),
          blood_components: parseInt(bloodComponents.rows[0].count),
          total_requests:  parseInt(totalRequests.rows[0].count),
          pending_approval: parseInt(pendingApproval.rows[0].count),
        },
        recent_requests: recentRequests.rows,
        stock_overview:  stockOverview.rows,
      },
    });
  } catch (err) {
    console.error("Staff dashboard error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data." });
  }
});

module.exports = router;
