const pool = require('../db');

async function getAllCustomers() {
  const result = await pool.query('SELECT customer_id, company_name, contact_name, city, country FROM customers ORDER BY company_name');
  return result.rows;
}

module.exports = { getAllCustomers };