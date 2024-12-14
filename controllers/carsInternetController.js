const { sql } = require('../config/database');

const carsInternetController = {
    getAllCarsInternet: async (req, res) => {
        try {
            const result = await sql.query`SELECT * FROM Cars_internet`;
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCarInternetById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await sql.query`
                SELECT * FROM Cars_internet 
                WHERE VehicleID = ${id}`;
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Car internet information not found' });
            }
            
            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getFeaturedCars: async (req, res) => {
        try {
            const result = await sql.query`
                SELECT * FROM Cars_internet 
                WHERE Featured = 1 AND IsPublished = 1`;
            
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getReducedPriceCars: async (req, res) => {
        try {
            const result = await sql.query`
                SELECT * FROM Cars_internet 
                WHERE ReducedPrice = 1 AND IsPublished = 1`;
            
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCertifiedCars: async (req, res) => {
        try {
            const result = await sql.query`
                SELECT * FROM Cars_internet 
                WHERE Certified = 1 AND IsPublished = 1`;
            
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPopularCars: async (req, res) => {
        try {
            const result = await sql.query`
                SELECT TOP 10 * FROM Cars_internet 
                WHERE IsPublished = 1 
                ORDER BY VehicleViewCount DESC`;
            
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = carsInternetController;