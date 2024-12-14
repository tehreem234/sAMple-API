const { sql } = require('../config/database');

exports.getAllVehicles = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM vehicle`;
        const result1 = await sql.query`SELECT * FROM Cars_internet`;
        const result2 = await sql.query`SELECT * FROM vehicleInformation`;
        res.json({ result, result1, result2 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
                SELECT 
                    v.VIN,
                    v.ModelYear,
                    v.ModelID,
                    v.TrimID,
                    v.BodyStyleID,
                    v.EngineID,
                    v.TransmissionID,
                    v.FuelTypeID as FuelType,
                    v.DriveTypeID,
                    v.MPGCity,
                    v.MPGHwy,
                    v.NoOfDoors,
                    v.SubTitle,
                    
                    vi.InStockDate,
                    vi.Mileage,
                    vi.CurbWeight,
                    vi.ExteriorColorID,
                    vi.InteriorSurfaceID,
                    vi.TitleInHouse,
                    vi.TitleNo,
                    vi.TitleComments,
                    vi.VehicleLocationID,
                    vi.VehicleReconID,
                    
                    ci.SpotLight,
                    ci.SellerComment,
                    ci.InternetPrice,
                    ci.ReducedAmount,
                    ci.MonthlyPaymentAmount
                  
                FROM vehicle v
                LEFT JOIN vehicleInformation vi ON v.VehicleID = vi.VehicleID
                LEFT JOIN Cars_internet ci ON v.VehicleID = ci.VehicleID
                WHERE v.VehicleID = @VehicleID`;

        const result = await new sql.Request()
            .input('VehicleID', sql.Int, id)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createVehicleData = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();

        const {
            // vehicle table data
            VIN, ModelYear, ModelID, TrimID, BodyStyleID,
            EngineID, TransmissionID, FuelTypeID, DriveTypeID,
            MPGCity, MPGHwy, NoOfDoors, SubTitle,

            // vehicleInformation table data
            InStockDate, Mileage, CurbWeight, ExteriorColorID,
            InteriorSurfaceID, TitleInHouse, TitleNo, TitleComments,
            VehicleLocationID, VehicleReconID,

            // Cars_internet table data
            SpotLight, SellerComment, InternetPrice, ReducedAmount,
            MonthlyPaymentAmount, SpinCode,
        } = req.body;

        // Validate VIN
        if (!VIN) {
            return res.status(400).json({ error: 'VIN is required' });
        }

        // 1. Insert into vehicle table
        const vehicleQuery = `
                INSERT INTO vehicle (
                    VIN, ModelYear, ModelID, TrimID, BodyStyleID,
                    EngineID, TransmissionID, FuelTypeID, DriveTypeID,
                    MPGCity, MPGHwy, NoOfDoors, SubTitle
                )
                OUTPUT INSERTED.VehicleID
                VALUES (
                    @VIN, @ModelYear, @ModelID, @TrimID, @BodyStyleID,
                    @EngineID, @TransmissionID, @FuelTypeID, @DriveTypeID,
                    @MPGCity, @MPGHwy, @NoOfDoors, @SubTitle
                )
            `;

        const vehicleResult = await new sql.Request(transaction)
            .input('VIN', sql.VarChar(17), VIN)
            .input('ModelYear', sql.SmallInt, ModelYear)
            .input('ModelID', sql.Int, ModelID)
            .input('TrimID', sql.Int, TrimID)
            .input('BodyStyleID', sql.TinyInt, BodyStyleID)
            .input('EngineID', sql.Int, EngineID)
            .input('TransmissionID', sql.TinyInt, TransmissionID)
            .input('FuelTypeID', sql.TinyInt, FuelTypeID)
            .input('DriveTypeID', sql.TinyInt, DriveTypeID)
            .input('MPGCity', sql.TinyInt, MPGCity)
            .input('MPGHwy', sql.TinyInt, MPGHwy)
            .input('NoOfDoors', sql.TinyInt, NoOfDoors)
            .input('SubTitle', sql.VarChar(100), SubTitle)
            .query(vehicleQuery);

        const VehicleID = vehicleResult.recordset[0].VehicleID;

        // 2. Insert into vehicleInformation
        if (InStockDate || Mileage || CurbWeight || ExteriorColorID || InteriorSurfaceID) {
            const infoQuery = `
                    INSERT INTO vehicleInformation (
                        VehicleID, InStockDate, Mileage, CurbWeight,
                        ExteriorColorID, InteriorSurfaceID, TitleInHouse,
                        TitleNo, TitleComments, VehicleLocationID, VehicleReconID
                    )
                    VALUES (
                        @VehicleID, @InStockDate, @Mileage, @CurbWeight,
                        @ExteriorColorID, @InteriorSurfaceID, @TitleInHouse,
                        @TitleNo, @TitleComments, @VehicleLocationID, @VehicleReconID
                    )
                `;

            await new sql.Request(transaction)
                .input('VehicleID', sql.Int, VehicleID)
                .input('InStockDate', sql.DateTime, InStockDate)
                .input('Mileage', sql.Int, Mileage)
                .input('CurbWeight', sql.VarChar(50), CurbWeight)
                .input('ExteriorColorID', sql.SmallInt, ExteriorColorID)
                .input('InteriorSurfaceID', sql.TinyInt, InteriorSurfaceID)
                .input('TitleInHouse', sql.Bit, TitleInHouse)
                .input('TitleNo', sql.VarChar(50), TitleNo)
                .input('TitleComments', sql.VarChar(1000), TitleComments)
                .input('VehicleLocationID', sql.Int, VehicleLocationID)
                .input('VehicleReconID', sql.Int, VehicleReconID)
                .query(infoQuery);
        }

        // 3. Insert into Cars_internet
        if (SpotLight || SellerComment || InternetPrice) {
            const internetQuery = `
                    INSERT INTO Cars_internet (
                        VehicleID, SpotLight, SellerComment, InternetPrice,
                        ReducedAmount, MonthlyPaymentAmount, SpinCode
                    )
                    VALUES (
                        @VehicleID, @SpotLight, @SellerComment, @InternetPrice,
                        @ReducedAmount, @MonthlyPaymentAmount, @SpinCode
                    )
                `;

            await new sql.Request(transaction)
                .input('VehicleID', sql.Int, VehicleID)
                .input('SpotLight', sql.Int, SpotLight)
                .input('SellerComment', sql.NVarChar(sql.MAX), SellerComment)
                .input('InternetPrice', sql.Money, InternetPrice)
                .input('ReducedAmount', sql.Money, ReducedAmount)
                .input('MonthlyPaymentAmount', sql.SmallMoney, MonthlyPaymentAmount)
                .input('SpinCode', sql.NVarChar(256), SpinCode)
                .query(internetQuery);
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Vehicle and related data created successfully',
            VehicleID,
            data: {
                vehicle: {
                    VIN, ModelYear, ModelID, TrimID, BodyStyleID,
                    EngineID, TransmissionID, FuelTypeID, DriveTypeID,
                    MPGCity, MPGHwy, NoOfDoors, SubTitle
                },
                vehicleInformation: {
                    InStockDate, Mileage, CurbWeight, ExteriorColorID,
                    InteriorSurfaceID, TitleInHouse, TitleNo, TitleComments,
                    VehicleLocationID, VehicleReconID
                },
                carsInternet: {
                    SpotLight, SellerComment, InternetPrice, ReducedAmount,
                    MonthlyPaymentAmount, SpinCode
                }
            }
        });

    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error creating vehicle data:', error);
        res.status(500).json({
            error: 'Failed to create vehicle data',
            details: error.message
        });
    }
};

exports.updateVehicleData = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();
        const { id } = req.params;

        const {
            // vehicle table data
            VIN, ModelYear, ModelID, TrimID, BodyStyleID,
            EngineID, TransmissionID, FuelTypeID, DriveTypeID,
            MPGCity, MPGHwy, NoOfDoors, SubTitle,

            // vehicleInformation table data
            InStockDate, Mileage, CurbWeight, ExteriorColorID,
            InteriorSurfaceID, TitleInHouse, TitleNo, TitleComments,
            VehicleLocationID, VehicleReconID,

            // Cars_internet table data
            SpotLight, SellerComment, InternetPrice, ReducedAmount,
            MonthlyPaymentAmount, SpinCode
        } = req.body;

        // 1. Update vehicle table
        const vehicleQuery = `
            UPDATE vehicle 
            SET 
                VIN = @VIN,
                ModelYear = @ModelYear,
                ModelID = @ModelID,
                TrimID = @TrimID,
                BodyStyleID = @BodyStyleID,
                EngineID = @EngineID,
                TransmissionID = @TransmissionID,
                FuelTypeID = @FuelTypeID,
                DriveTypeID = @DriveTypeID,
                MPGCity = @MPGCity,
                MPGHwy = @MPGHwy,
                NoOfDoors = @NoOfDoors,
                SubTitle = @SubTitle
            WHERE VehicleID = @VehicleID
        `;

        await new sql.Request(transaction)
            .input('VehicleID', sql.Int, id)
            .input('VIN', sql.VarChar(17), VIN)
            .input('ModelYear', sql.SmallInt, ModelYear)
            .input('ModelID', sql.Int, ModelID)
            .input('TrimID', sql.Int, TrimID)
            .input('BodyStyleID', sql.TinyInt, BodyStyleID)
            .input('EngineID', sql.Int, EngineID)
            .input('TransmissionID', sql.TinyInt, TransmissionID)
            .input('FuelTypeID', sql.TinyInt, FuelTypeID)
            .input('DriveTypeID', sql.TinyInt, DriveTypeID)
            .input('MPGCity', sql.TinyInt, MPGCity)
            .input('MPGHwy', sql.TinyInt, MPGHwy)
            .input('NoOfDoors', sql.TinyInt, NoOfDoors)
            .input('SubTitle', sql.VarChar(100), SubTitle)
            .query(vehicleQuery);

        // 2. Update vehicleInformation
        if (InStockDate || Mileage || CurbWeight || ExteriorColorID || InteriorSurfaceID) {
            const infoQuery = `
                UPDATE vehicleInformation
                SET 
                    InStockDate = @InStockDate,
                    Mileage = @Mileage,
                    CurbWeight = @CurbWeight,
                    ExteriorColorID = @ExteriorColorID,
                    InteriorSurfaceID = @InteriorSurfaceID,
                    TitleInHouse = @TitleInHouse,
                    TitleNo = @TitleNo,
                    TitleComments = @TitleComments,
                    VehicleLocationID = @VehicleLocationID,
                    VehicleReconID = @VehicleReconID
                WHERE VehicleID = @VehicleID
            `;

            await new sql.Request(transaction)
                .input('VehicleID', sql.Int, id)
                .input('InStockDate', sql.DateTime, InStockDate)
                .input('Mileage', sql.Int, Mileage)
                .input('CurbWeight', sql.VarChar(50), CurbWeight)
                .input('ExteriorColorID', sql.SmallInt, ExteriorColorID)
                .input('InteriorSurfaceID', sql.TinyInt, InteriorSurfaceID)
                .input('TitleInHouse', sql.Bit, TitleInHouse)
                .input('TitleNo', sql.VarChar(50), TitleNo)
                .input('TitleComments', sql.VarChar(1000), TitleComments)
                .input('VehicleLocationID', sql.Int, VehicleLocationID)
                .input('VehicleReconID', sql.Int, VehicleReconID)
                .query(infoQuery);
        }

        // 3. Update Cars_internet
        if (SpotLight || SellerComment || InternetPrice) {
            const internetQuery = `
                UPDATE Cars_internet
                SET 
                    SpotLight = @SpotLight,
                    SellerComment = @SellerComment,
                    InternetPrice = @InternetPrice,
                    ReducedAmount = @ReducedAmount,
                    MonthlyPaymentAmount = @MonthlyPaymentAmount,
                    SpinCode = @SpinCode
                WHERE VehicleID = @VehicleID
            `;

            await new sql.Request(transaction)
                .input('VehicleID', sql.Int, id)
                .input('SpotLight', sql.Int, SpotLight)
                .input('SellerComment', sql.NVarChar(sql.MAX), SellerComment)
                .input('InternetPrice', sql.Money, InternetPrice)
                .input('ReducedAmount', sql.Money, ReducedAmount)
                .input('MonthlyPaymentAmount', sql.SmallMoney, MonthlyPaymentAmount)
                .input('SpinCode', sql.NVarChar(256), SpinCode)
                .query(internetQuery);
        }

        await transaction.commit();

        res.json({
            message: 'Vehicle and related data updated successfully',
            data: {
                vehicle: {
                    VIN, ModelYear, ModelID, TrimID, BodyStyleID,
                    EngineID, TransmissionID, FuelTypeID, DriveTypeID,
                    MPGCity, MPGHwy, NoOfDoors, SubTitle
                },
                vehicleInformation: {
                    InStockDate, Mileage, CurbWeight, ExteriorColorID,
                    InteriorSurfaceID, TitleInHouse, TitleNo, TitleComments,
                    VehicleLocationID, VehicleReconID
                },
                carsInternet: {
                    SpotLight, SellerComment, InternetPrice, ReducedAmount,
                    MonthlyPaymentAmount, SpinCode
                }
            }
        });

    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error updating vehicle data:', error);
        res.status(500).json({
            error: 'Failed to update vehicle data',
            details: error.message
        });
    }
};


module.exports = {
    getAllVehicles: exports.getAllVehicles,
    getVehicleById: exports.getVehicleById,
    createVehicleData: exports.createVehicleData,
    updateVehicleData: exports.updateVehicleData,

};