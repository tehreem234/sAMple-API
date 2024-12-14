const express = require('express');
const router = express.Router();
const carsInternetController = require('../controllers/carsInternetController');

router.get('/cars', carsInternetController.getAllCarsInternet);
router.get('/cars/:id', carsInternetController.getCarInternetById);
router.get('/cars/featured', carsInternetController.getFeaturedCars);
router.get('/cars/reduced-price', carsInternetController.getReducedPriceCars);
router.get('/cars/certified', carsInternetController.getCertifiedCars);
router.get('/cars/popular', carsInternetController.getPopularCars);

module.exports = router;