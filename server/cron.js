const cron = require("node-cron");
const pool = require("./db");

// ─────────────────────────────────────────────
// SCHEDULED JOB 1: Reset donor eligibility
// Runs every day at midnight (00:00)
// Finds donors whose last_donation_date was
// 90+ days ago and resets eligibility to TRUE
// ─────────────────────────────────────────────
cron.schedule("0 0 * * *", async () => {
  console.log("Running eligibility reset job...");

  try {
    const result = await pool.query(`
      UPDATE donor
      SET eligibility_status = TRUE
      WHERE eligibility_status = FALSE
      AND last_donation_date <= CURRENT_DATE - INTERVAL '90 days'
    `);

    console.log(
      `Eligibility reset complete. ${result.rowCount} donors updated.`
    );
  } catch (err) {
    console.error("Eligibility reset failed:", err.message);
  }
});


// ─────────────────────────────────────────────
// SCHEDULED JOB 2: Clean up expired blood stock
// Runs every day at midnight (00:00)
// Finds expired batches, logs them as EXPIRED
// in stock_transaction, then deletes them
// ─────────────────────────────────────────────
cron.schedule("0 0 * * *", async () => {
  console.log("Running expired stock cleanup job...");

  try {
    // ─── Step 1: Find all expired batches ───
    const expiredBatches = await pool.query(`
      SELECT stock_id, available_units
      FROM blood_stock
      WHERE expiry_date < CURRENT_DATE
      AND available_units > 0
    `);

    if (expiredBatches.rows.length === 0) {
      console.log("No expired batches found.");
      return;
    }

    // ─── Step 2: Log each expired batch ───
    // and delete it in a transaction
    await pool.query("BEGIN");

    for (const batch of expiredBatches.rows) {
      // Log to stock_transaction as EXPIRED
      await pool.query(`
        INSERT INTO stock_transaction
          (stock_id, admin_id, request_id, quantity, action)
        VALUES ($1, NULL, NULL, $2, 'EXPIRED')
      `, [batch.stock_id, batch.available_units]);

      // Delete from blood_stock
      await pool.query(`
        DELETE FROM blood_stock
        WHERE stock_id = $1
      `, [batch.stock_id]);
    }

    await pool.query("COMMIT");

    console.log(
      `Expired stock cleanup complete. ${expiredBatches.rows.length} batches removed.`
    );
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Expired stock cleanup failed:", err.message);
  }
});


console.log("Cron jobs initialized ");
