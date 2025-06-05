const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database configuration
const pool = new Pool({
  host: '18.236.48.141',
  port: 7654,
  database: 'datastore',
  user: 'postgres',
  password: 'password',
  ssl: false,
  schema: 'telangana_pregnancy_data'
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Get overall statistics
app.get('/api/stats', async (req, res) => {
  try {
    // Total high-risk cases (Total Mothers)
    const totalResult = await pool.query(`
      SELECT count(DISTINCT "MOTHER_ID") AS total
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Aradhana Arya', 'Lipika Khare', 'Lopa Parikh', 'Tripti Sarin')
    `);
    const totalCases = parseInt(totalResult.rows[0].total);

    // Active pregnancies (70% of total cases)
    const activeResult = await pool.query(`
      SELECT ROUND(COUNT(DISTINCT "MOTHER_ID") * 0.7, 0) AS active
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
    `);
    const activeCases = parseInt(activeResult.rows[0].active);

    // Total deliveries (30% of total cases)
    const deliveriesResult = await pool.query(`
      SELECT ROUND(count(DISTINCT "MOTHER_ID") * 0.3, 0) AS deliveries
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
    `);
    const totalDeliveries = parseInt(deliveriesResult.rows[0].deliveries);

    res.json({
      total_cases: totalCases,
      recent_cases: totalCases,
      active_pregnancies: activeCases,
      total_deliveries: totalDeliveries
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cases by district
app.get('/api/cases/by-district', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "DISTRICT_NAME" as district, count(DISTINCT "MOTHER_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Aradhana Arya', 'Lipika Khare', 'Lopa Parikh', 'Tripti Sarin')
      GROUP BY "DISTRICT_NAME"
      ORDER BY count DESC
      LIMIT 15
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cases by district:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cases by village
app.get('/api/cases/by-village', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "VILLAGE_NAME" as village, count(DISTINCT "MOTHER_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Aradhana Arya', 'Lopa Parikh', 'Lipika Khare', 'Tripti Sarin')
        AND "RISK_FACTOR" IS NOT NULL
      GROUP BY "VILLAGE_NAME"
      ORDER BY count DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cases by village:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get underutilized volunteers by village (proxy for age group endpoint)
app.get('/api/cases/by-age-group', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "VILLAGE_NAME" as age_group, count(DISTINCT "ASHA_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
        AND "WORKLOAD_CATEGORY" IN ('Underutilized')
      GROUP BY "VILLAGE_NAME"
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching underutilized volunteers by village:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly trends for HRP cases
app.get('/api/trends/weekly', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('week', "ANC_DATE") as week,
             count(DISTINCT "MOTHER_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "RISK_FACTOR_ID" IS NOT NULL
        AND "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
        AND "ANC_DATE" IS NOT NULL
      GROUP BY DATE_TRUNC('week', "ANC_DATE")
      ORDER BY week DESC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weekly trends:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly trends
app.get('/api/trends/monthly', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month 
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly trends:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get risk category distribution
app.get('/api/cases/by-risk-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "RISK_CATEGORY" as risk_category, 
             "RISK_FACTOR" as risk_factor,
             count(DISTINCT "MOTHER_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Aradhana Arya', 'Lipika Khare', 'Lopa Parikh', 'Tripti Sarin')
        AND "RISK_FACTOR_ID" IS NOT NULL
      GROUP BY "RISK_CATEGORY", "RISK_FACTOR"
      ORDER BY count DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cases by risk category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active pregnancies by district
app.get('/api/active-pregnancies/by-district', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "DISTRICT_NAME" as district, 
             "VILLAGE_NAME" as village,
             count(DISTINCT "MOTHER_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE CASE
              WHEN CURRENT_DATE >= ("ANC_DATE" + INTERVAL '9 months' + (FLOOR(random() * 30) || ' days')::INTERVAL) THEN 'Delivered'
              ELSE 'Not Delivered'
            END IN ('Not Delivered')
        AND "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
      GROUP BY "DISTRICT_NAME", "VILLAGE_NAME"
      ORDER BY count DESC
      LIMIT 15
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active pregnancies by district:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workload category distribution
app.get('/api/workload-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "WORKLOAD_CATEGORY" as category,
             count(DISTINCT "ASHA_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "WORKLOAD_CATEGORY" IN ('Overutilized', 'Underutilized', 'Optimal')
        AND "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
      GROUP BY "WORKLOAD_CATEGORY"
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching workload categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active pregnancies by volunteer
app.get('/api/active-pregnancies/by-volunteer', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "VOLUNTEER_NAME" as volunteer,
             count(DISTINCT "MOTHER_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE CASE
              WHEN CURRENT_DATE >= ("ANC_DATE" + INTERVAL '9 months' + (FLOOR(random() * 30) || ' days')::INTERVAL) THEN 'Delivered'
              ELSE 'Not Delivered'
            END IN ('Not Delivered')
        AND "VOLUNTEER_NAME" IN ('Lopa Parikh', 'Aradhana Arya', 'Lipika Khare', 'Tripti Sarin')
      GROUP BY "VOLUNTEER_NAME"
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active pregnancies by volunteer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get distribution by village and risk category
app.get('/api/distribution/village-risk', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "VILLAGE_NAME" as village,
             "RISK_CATEGORY" as risk_category,
             count(DISTINCT "RISK_FACTOR_ID") as count
      FROM telangana_pregnancy_data.high_risk_pregnancy_cases
      WHERE "VOLUNTEER_NAME" IN ('Aradhana Arya', 'Lopa Parikh', 'Lipika Khare', 'Tripti Sarin')
      GROUP BY "VILLAGE_NAME", "RISK_CATEGORY"
      ORDER BY count DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching distribution by village and risk:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all cases with pagination
app.get('/api/cases', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT * FROM telangana_pregnancy_data.high_risk_pregnancy_cases 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM telangana_pregnancy_data.high_risk_pregnancy_cases');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      cases: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 