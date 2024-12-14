const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// ... existing code ...

router.post('/', async (req, res, next) => {
    try {
        await vehicleController.createVehicleData(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        await vehicleController.getAllVehicles(req, res);
    } catch (error) {
        next(error);
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        await vehicleController.getVehicleById(req, res);
    } catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        await vehicleController.updateVehicleData(req, res);
    } catch (error) {
        next(error);
    }
});
// ... existing code ...




// 1. Create: `POST http://localhost:3000/api/vehicles`

// 2. Get All: `GET http://localhost:3000/api/vehicles`

// 3. Get One: `GET http://localhost:3000/api/vehicles/1`

// 4. Update: `PUT http://localhost:3000/api/vehicles/1`

module.exports = router;