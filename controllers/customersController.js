const customersService = require('../services/customersService');

async function getAll(req, res, next) {
  try {
    const customers = await customersService.getAllCustomers();
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll };