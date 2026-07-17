const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const orderRoutes = require('./routes/orders');
const shipmentRoutes = require('./routes/shipments');
const driverRoutes = require('./routes/drivers');
const healthRoutes = require('./routes/health');
const eventRoutes = require('./routes/events');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/drivers', driverRoutes);

app.use(errorHandler);

module.exports = app;
