const express = require('express');
const router = express.Router();
const vehicleInformationController = require('../controllers/vehicleInformationController');

router.get('/vehicle-info', vehicleInformationController.getAllVehicleInfo);
router.get('/vehicle-info/:id', vehicleInformationController.getVehicleInfoById);
router.get('/vehicle-info/location/:locationId', vehicleInformationController.getVehiclesByLocation);
router.get('/vehicle-info/new', vehicleInformationController.getNewVehicles);

module.exports = router;