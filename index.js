const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db');
const customersRoutes = require('./routes/customersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/customers', customersRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);

pool.query('SELECT NOW()')
  .then(res => console.log('Conectado a Postgres:', res.rows[0]))
  .catch(err => console.error('Error de conexión:', err));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));