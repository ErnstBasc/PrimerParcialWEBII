const ordersService = require('../services/ordersService');

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await ordersService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: `Orden con id ${id} no encontrada` });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { customer_id, employee_id, order_date, products } = req.body;

    if (!customer_id || !employee_id || !order_date || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere customer_id, employee_id, order_date y una lista de products',
      });
    }

    const newOrder = await ordersService.createOrder({ customer_id, employee_id, order_date, products });
    res.status(201).json({ success: true, data: newOrder });

  } catch (error) {
    next(error);
  }
}

module.exports = { getById, create };
