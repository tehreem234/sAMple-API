const { sql } = require('../config/database');

const vehicleInformationController = {
    getAllVehicleInfo: async (req, res) => {
        try {
            const result = await sql.query`SELECT * FROM vehicleInformation`;
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getVehicleInfoById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await sql.query`
                SELECT * FROM vehicleInformation 
                WHERE VehicleID = ${id}`;
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Vehicle information not found' });
            }
            
            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getVehiclesByLocation: async (req, res) => {
        try {
            const { locationId } = req.params;
            const result = await sql.query`
                SELECT * FROM vehicleInformation 
                WHERE VehicleLocationID = ${locationId}`;
            
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getNewVehicles: async (req, res) => {
        try {
            const result = await sql.query`
                SELECT * FROM vehicleInformation 
                WHERE IsNew = 1`;
            
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = vehicleInformationController;