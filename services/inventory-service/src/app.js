const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const warehouseRoutes = require('./routes/warehouses');
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');
const healthRoutes = require('./routes/health');
const eventRoutes = require('./routes/events');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
