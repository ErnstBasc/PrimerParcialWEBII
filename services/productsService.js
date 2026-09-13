const pool = require('../db');

async function getAllProducts() {
  const result = await pool.query('SELECT product_id, product_name, unit_price, units_in_stock, discontinued FROM products ORDER BY product_name');
  return result.rows;
}

module.exports = { getAllProducts };
