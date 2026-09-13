const pool = require('../db');

async function getOrderById(id) {
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE order_id = $1',
    [id]
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const detailsResult = await pool.query(
    `SELECT od.product_id, p.product_name, od.unit_price, od.quantity, od.discount
     FROM order_details od
     JOIN products p ON od.product_id = p.product_id
     WHERE od.order_id = $1`,
    [id]
  );

  return {
    ...orderResult.rows[0],
    details: detailsResult.rows,
  };
}

async function createOrder({ customer_id, employee_id, order_date, products }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Validar que el cliente exista
    const customerCheck = await client.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [customer_id]
    );
    if (customerCheck.rows.length === 0) {
      throw { status: 400, message: `El cliente ${customer_id} no existe` };
    }

    // 2. Validar que el empleado exista
    const employeeCheck = await client.query(
      'SELECT employee_id FROM employees WHERE employee_id = $1',
      [employee_id]
    );
    if (employeeCheck.rows.length === 0) {
      throw { status: 400, message: `El empleado ${employee_id} no existe` };
    }

    // 3. Validar cada producto (formato, rango y existencia) y obtener su precio real
    const preciosPorProducto = {};
    for (const item of products) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        throw { status: 400, message: 'Cada producto necesita product_id y quantity mayor a 0' };
      }

      // Validar rango antes de consultar la base (product_id es smallint en Northwind: máx 32767)
      if (!Number.isInteger(item.product_id) || item.product_id > 32767 || item.product_id < 1) {
        throw { status: 400, message: `El product_id ${item.product_id} no es válido` };
      }

      const productCheck = await client.query(
        'SELECT unit_price FROM products WHERE product_id = $1',
        [item.product_id]
      );
      if (productCheck.rows.length === 0) {
        throw { status: 400, message: `El producto ${item.product_id} no existe` };
      }
      preciosPorProducto[item.product_id] = productCheck.rows[0].unit_price;
    }

    // 4. Calcular el siguiente order_id manualmente (no hay autoincremento)
    const nextIdResult = await client.query('SELECT COALESCE(MAX(order_id), 0) + 1 AS next_id FROM orders');
    const newOrderId = nextIdResult.rows[0].next_id;

    // 5. Insertar la cabecera
    await client.query(
      'INSERT INTO orders (order_id, customer_id, employee_id, order_date) VALUES ($1, $2, $3, $4)',
      [newOrderId, customer_id, employee_id, order_date]
    );

    // 6. Insertar cada línea de detalle, con el precio real de la base
    for (const item of products) {
      await client.query(
        'INSERT INTO order_details (order_id, product_id, unit_price, quantity, discount) VALUES ($1, $2, $3, $4, $5)',
        [newOrderId, item.product_id, preciosPorProducto[item.product_id], item.quantity, 0]
      );
    }

    await client.query('COMMIT');

    // Devolvemos la orden completa recién creada, reutilizando la misma lógica de lectura
    return await getOrderById(newOrderId);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getOrderById, createOrder };