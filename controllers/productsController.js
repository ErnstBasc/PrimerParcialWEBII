const productsService = require('../services/productsService');

async function getAll(req, res, next) {
  try {
    const products = await productsService.getAllProducts();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll };
