const express = require("express");
const router = express.Router();
const pool = require("../db");
const protect = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// GET /api/customer/blood-availability
// Public route — no login required
// Search blood availability by blood group
// and component type
// ─────────────────────────────────────────────
router.get("/blood-availability", async (req, res) => {
  const { blood_group, component_type } = req.query;

  try {
    let query = `SELECT * FROM blood_availability_summary WHERE 1=1`;
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
      data: result.rows,
    });
  } catch (err) {
    console.error("Blood availability error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blood availability.",
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/customer/request
// Protected — Customer only
// Submit a blood request
// ─────────────────────────────────────────────
router.post("/request", protect(["CUSTOMER"]), async (req, res) => {
  const { patient_name, blood_group, component_type, quantity, urgency } =
    req.body;

  // customer_id comes from JWT token — no need to send from frontend
  const customer_id = req.user.customer_id;

  try {
    // ─── Step 1: Validate required fields ───
    if (!patient_name || !blood_group || !component_type || !quantity) {
      return res.status(400).json({
        success: false,
        message:
          "Patient name, blood group, component and quantity are required.",
      });
    }

    // ─── Step 2: Insert blood request ───
    // Trigger 3 fires automatically:
    // if insufficient stock → status = REJECTED
    // if sufficient stock  → status = PENDING
    const result = await pool.query(
      `INSERT INTO blood_request
            (customer_id, patient_name, blood_group, component_type, quantity, urgency)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
      [
        customer_id,
        patient_name,
        blood_group,
        component_type,
        quantity,
        urgency || "NORMAL",
      ],
    );

    const request = result.rows[0];

    // ─── Step 3: If emergency + rejected (no stock)
    // fetch emergency donor list ───
    let emergencyDonors = [];

    if (urgency === "EMERGENCY" && request.status === "REJECTED") {
      const donorResult = await pool.query(
        `SELECT * FROM emergency_donor_list
                WHERE donor_blood_group = $1`,
        [blood_group],
      );
      emergencyDonors = donorResult.rows;
    }

    // ─── Step 4: Return response ───
    res.status(201).json({
      success: true,
      message:
        request.status === "APPROVED"
          ? "Request submitted and approved!"
          : request.status === "REJECTED"
            ? "Request submitted but stock is insufficient."
            : "Request submitted successfully! Pending approval.",
      data: request,
      emergencyDonors, // empty array if not emergency or stock available
    });
  } catch (err) {
    console.error("Blood request error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to submit blood request.",
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/customer/requests
// Protected — Customer only
// View own blood requests history
// ─────────────────────────────────────────────
router.get("/requests", protect(["CUSTOMER"]), async (req, res) => {
  const customer_id = req.user.customer_id;

  try {
    const result = await pool.query(
      `SELECT
                request_id,
                patient_name,
                blood_group,
                component_type,
                quantity,
                urgency,
                status,
                rejected_reason,
                request_date
            FROM blood_request
            WHERE customer_id = $1
            ORDER BY request_date DESC`,
      [customer_id],
    );

    res.status(200).json({
      success: true,
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

// ─────────────────────────────────────────────
// GET /api/customer/donors
// Protected — Customer only
// Search and filter donors
// ─────────────────────────────────────────────
router.get("/donors", protect(["CUSTOMER"]), async (req, res) => {
  const { name, blood_group, eligibility_status, min_age, max_age } = req.query;

  try {
    let query = `
            SELECT
                donor_id,
                donor_name,
                donor_blood_group,
                donor_phone_no,
                donor_address,
                eligibility_status,
                DATE_PART('year', AGE(CURRENT_DATE, date_of_birth)) AS age,
                last_donation_date
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

    if (eligibility_status !== undefined) {
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

    query += ` ORDER BY eligibility_status DESC, donor_name ASC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Donor search error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donors.",
    });
  }
});

module.exports = router;
