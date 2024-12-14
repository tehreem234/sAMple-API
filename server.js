const express = require('express');
require('dotenv').config();
const { connectDB } = require('./config/database');
const vehicleRoutes = require('./routes/vehicleRoutes');
const vehicleInformationRoutes = require('./routes/vehicleInformationRoutes');
const carsInternetRoutes = require('./routes/carsInternetRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/vehicles', vehicleRoutes);
// Add these if you need them
app.use('/api/vehicle-info', vehicleInformationRoutes);
app.use('/api/cars-internet', carsInternetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});