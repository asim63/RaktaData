const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
if (!connectionString) {
  console.error(
    "Missing database connection string. Set DATABASE_URL (Railway default) or DB_URL.",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Database connected successfully!");
    release();
  }
});

module.exports = pool;