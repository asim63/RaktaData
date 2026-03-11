const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const protect = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// GET /api/admin/donors
// Protected — Admin only
// View, search and filter all donors
// ─────────────────────────────────────────────
router.get("/donors", protect(["ADMIN"]), async (req, res) => {
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

// ─────────────────────────────────────────────
// PUT /api/admin/donors/:id
// Protected — Admin only
// Update donor details
// ─────────────────────────────────────────────
router.put("/donors/:id", protect(["ADMIN"]), async (req, res) => {
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
// DELETE /api/admin/donors/:id
// Protected — Admin only
// Deletes donor and all their donations (CASCADE)
// ─────────────────────────────────────────────
router.delete("/donors/:id", protect(["ADMIN"]), async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query(
      "SELECT donor_id, donor_name FROM donor WHERE donor_id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Donor not found." });
    }

    const donor_name = existing.rows[0].donor_name;

    await pool.query("BEGIN");

    // ─── Delete donations first (FK constraint) ───
    await pool.query("DELETE FROM donation WHERE donor_id = $1", [id]);

    // ─── Now safe to delete donor ───
    await pool.query("DELETE FROM donor WHERE donor_id = $1", [id]);

    await pool.query("COMMIT");

    res.status(200).json({ success: true, message: `${donor_name} deleted successfully!` });

  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Delete donor error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete donor." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/blood-stock
// Protected — Admin only
// Blood availability overview
// Uses blood_availability_summary view
// ─────────────────────────────────────────────
router.get("/blood-stock", protect(["ADMIN"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blood_availability_summary
       ORDER BY blood_group, component_type`,
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Blood stock error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blood stock.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/blood-stock/batches
// Protected — Admin only
// View individual batches
// Uses active_stock_inventory view
// Optional filters: blood_group, component_type
// ─────────────────────────────────────────────
router.get("/blood-stock/batches", protect(["ADMIN"]), async (req, res) => {
  const { blood_group, component_type } = req.query;

  try {
    let query = `SELECT * FROM active_stock_inventory WHERE 1=1`;
    const params = [];

    if (blood_group) {
      params.push(blood_group);
      query += ` AND blood_group = $${params.length}`;
    }

    if (component_type) {
      params.push(component_type);
      query += ` AND component_type = $${params.length}`;
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Batch details error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batch details.",
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/blood-stock
// Protected — Admin only
// Add new blood stock batch
// Calls add_blood_stock stored procedure
// Trigger 2 fires automatically → sets expiry_date
// ─────────────────────────────────────────────
router.post("/blood-stock", protect(["ADMIN"]), async (req, res) => {
  const { blood_group, component_type, units } = req.body;

  // admin_id comes from JWT token
  const admin_id = req.user.admin_id;

  try {
    if (!blood_group || !component_type || !units) {
      return res.status(400).json({
        success: false,
        message: "Blood group, component type and units are required.",
      });
    }

    if (parseFloat(units) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Units must be greater than 0.",
      });
    }

    // ─── Call stored procedure ───
    await pool.query(`CALL add_blood_stock($1, $2, $3, $4)`, [
      blood_group,
      component_type,
      units,
      admin_id,
    ]);

    res.status(201).json({
      success: true,
      message: "Blood stock added successfully!",
    });
  } catch (err) {
    console.error("Add stock error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to add blood stock.",
    });
  }
});

// PATCH /api/admin/blood-stock/:id
// Protected — Admin only
// Manual stock adjustment
// Calls manual_stock_adjustment stored procedure

router.patch("/blood-stock/:id", protect(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const { new_units } = req.body;
  const admin_id = req.user.admin_id;

  try {
    if (new_units === undefined || new_units === null) {
      return res.status(400).json({
        success: false,
        message: "New units value is required.",
      });
    }

    if (parseFloat(new_units) < 0) {
      return res.status(400).json({
        success: false,
        message: "Units cannot be negative.",
      });
    }

    // ─── Call stored procedure ───
    await pool.query(`CALL manual_stock_adjustment($1, $2, $3)`, [
      id,
      new_units,
      admin_id,
    ]);

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully!",
    });
  } catch (err) {
    console.error("Stock adjustment error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to adjust stock.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/requests
// Protected — Admin only
// View all pending blood requests
// Uses urgent_fulfillment_list view
// ─────────────────────────────────────────────
router.get("/requests", protect(["ADMIN"]), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM urgent_fulfillment_list`);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Fetch requests error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests.",
    });
  }
});

// PATCH /api/admin/requests/:id/approve
// Protected — Admin only
// Approve a blood request
// Calls approve_blood_request stored procedure

router.patch("/requests/:id/approve", protect(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const admin_id = req.user.admin_id;

  try {
    // ─── Call stored procedure ───
    await pool.query(`CALL approve_blood_request($1, $2)`, [id, admin_id]);

    res.status(200).json({
      success: true,
      message: "Request processed successfully!",
    });
  } catch (err) {
    console.error("Approve request error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to process request.",
    });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/admin/requests/:id/reject
// Protected — Admin only
// Reject a blood request with reason
// Calls reject_blood_request stored procedure
// ─────────────────────────────────────────────
router.patch("/requests/:id/reject", protect(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const admin_id = req.user.admin_id;

  try {
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    // ─── Call stored procedure ───
    await pool.query(`CALL reject_blood_request($1, $2, $3)`, [
      id,
      admin_id,
      reason,
    ]);

    res.status(200).json({
      success: true,
      message: "Request rejected successfully!",
    });
  } catch (err) {
    console.error("Reject request error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to reject request.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/transactions
// Protected — Admin only
// View transaction history
// Uses stock_audit_summary view
// Query params (all optional):
//   startDate, endDate, action, blood_group
// Default: last 5 days
// ─────────────────────────────────────────────
router.get("/transactions", protect(["ADMIN"]), async (req, res) => {
  const { startDate, endDate, action, blood_group } = req.query;

  try {
    // ─── Default to last 5 days if no dates provided ───
    const today = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(today.getDate() - 5);

    const start = startDate || fiveDaysAgo.toISOString().split("T")[0];
    const end = endDate || today.toISOString().split("T")[0];

    let query = `
      SELECT * FROM stock_audit_summary
      WHERE transaction_date::DATE BETWEEN $1 AND $2`;
    const params = [start, end];

    if (action) {
      params.push(action);
      query += ` AND action = $${params.length}`;
    }

    if (blood_group) {
      params.push(blood_group);
      query += ` AND blood_group = $${params.length}`;
    }

    query += ` ORDER BY transaction_date DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Transactions error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/staff
// Protected — Admin only
// View all staff accounts
// ─────────────────────────────────────────────
router.get("/staff", protect(["ADMIN"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        s.staff_id,
        s.staff_name,
        u.username,
        u.date_of_creation
       FROM staff s
       INNER JOIN users u ON s.user_id = u.user_id
       ORDER BY s.staff_id ASC`,
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Fetch staff error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff.",
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/staff
// Protected — Admin only
// Create new staff account
// Both users + staff tables updated in transaction
// ─────────────────────────────────────────────
router.post("/staff", protect(["ADMIN"]), async (req, res) => {
  const { staff_name, username, password } = req.body;

  try {
    // ─── Step 1: Validate required fields ───
    if (!staff_name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Staff name, username and password are required.",
      });
    }

    // ─── Step 2: Check username not taken ───
    const existing = await pool.query(
      "SELECT user_id FROM users WHERE username = $1",
      [username],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already taken.",
      });
    }

    // ─── Step 3: Hash password ───
    const hashedPassword = await bcrypt.hash(password, 10);

    // ─── Step 4: Transaction — insert users + staff ───
    await pool.query("BEGIN");

    const userResult = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, 'STAFF')
       RETURNING user_id`,
      [username, hashedPassword],
    );

    const user_id = userResult.rows[0].user_id;

    const staffResult = await pool.query(
      `INSERT INTO staff (user_id, staff_name)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, staff_name],
    );

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Staff account created successfully!",
      data: {
        staff_id: staffResult.rows[0].staff_id,
        staff_name: staffResult.rows[0].staff_name,
        username,
      },
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Create staff error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create staff account.",
    });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/staff/:id
// Protected — Admin only
// Delete staff account
// Deletes from users table (CASCADE handles staff)
// ─────────────────────────────────────────────
router.delete("/staff/:id", protect(["ADMIN"]), async (req, res) => {
  const { id } = req.params;

  try {
    // ─── Check staff exists ───
    const existing = await pool.query(
      `SELECT s.staff_id, u.user_id, s.staff_name
       FROM staff s
       INNER JOIN users u ON s.user_id = u.user_id
       WHERE s.staff_id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found.",
      });
    }

    const user_id = existing.rows[0].user_id;
    const staff_name = existing.rows[0].staff_name;

    // ─── Delete from users (CASCADE deletes staff row too) ───
    await pool.query("DELETE FROM users WHERE user_id = $1", [user_id]);

    res.status(200).json({
      success: true,
      message: `Staff account for ${staff_name} deleted successfully!`,
    });
  } catch (err) {
    console.error("Delete staff error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete staff account.",
    });
  }
});

// GET /api/admin/dashboard
// Protected — Admin only
// Returns all data needed for dashboard in
// one single request

router.get("/dashboard", protect(["ADMIN"]), async (req, res) => {
  try {
    // ─── Run all queries simultaneously ───
    // Promise.all fires all queries at the same time
    // instead of one after another — much faster!
    const [
      totalDonors,
      bloodComponents,
      totalRequests,
      pendingApproval,
      recentRequests,
      stockOverview,
    ] = await Promise.all([
      // 1. Total donors
      pool.query(`SELECT COUNT(*) FROM donor`),

      // 2. Distinct blood components in stock
      pool.query(`
        SELECT COUNT(DISTINCT component_type) 
        FROM blood_stock
        WHERE available_units > 0
        AND expiry_date >= CURRENT_DATE`),

      // 3. Total requests
      pool.query(`SELECT COUNT(*) FROM blood_request`),

      // 4. Pending approval count
      pool.query(`
        SELECT COUNT(*) FROM blood_request
        WHERE status = 'PENDING'`),

      // 5. Recent requests (last 5)
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

      // 6. Stock overview ordered Critical → Low → Stable
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
          Limit 8`),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total_donors: parseInt(totalDonors.rows[0].count),
          blood_components: parseInt(bloodComponents.rows[0].count),
          total_requests: parseInt(totalRequests.rows[0].count),
          pending_approval: parseInt(pendingApproval.rows[0].count),
        },
        recent_requests: recentRequests.rows,
        stock_overview: stockOverview.rows,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data.",
    });
  }
});

module.exports = router;
