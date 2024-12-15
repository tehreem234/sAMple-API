




const updateVehicleData = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();

        const {
            // vehicle table data
            VehicleID, VIN, ModelYear, ModelID, TrimID, BodyStyleID,
            EngineID, TransmissionID, FuelTypeID, DriveTypeID,
            MPGCity, MPGHwy, NoOfDoors, SubTitle,

            // vehicleInformation table data
            InStockDate, Mileage, CurbWeight, ExteriorColorID,
            InteriorSurfaceID, InteriorColorID, TitleInHouse, TitleNo, TitleComments,
            VehicleLocationID, VehicleReconID,
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
            .input('VehicleID', sql.Int, VehicleID)
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
        if (InStockDate || Mileage || CurbWeight || ExteriorColorID || InteriorSurfaceID || InteriorColorID) {
            const infoQuery = `
                UPDATE vehicleInformation
                SET 
                    InStockDate = @InStockDate,
                    Mileage = @Mileage,
                    CurbWeight = @CurbWeight,
                    ExteriorColorID = @ExteriorColorID,
                    InteriorSurfaceID = @InteriorSurfaceID,
                    InteriorColorID = @InteriorColorID,
                    TitleInHouse = @TitleInHouse,
                    TitleNo = @TitleNo,
                    TitleComments = @TitleComments,
                    VehicleLocationID = @VehicleLocationID,
                    VehicleReconID = @VehicleReconID
                WHERE VehicleID = @VehicleID
            `;

            await new sql.Request(transaction)
                .input('VehicleID', sql.Int, VehicleID)
                .input('InStockDate', sql.DateTime, InStockDate)
                .input('Mileage', sql.Int, Mileage)
                .input('CurbWeight', sql.VarChar(50), CurbWeight)
                .input('ExteriorColorID', sql.SmallInt, ExteriorColorID)
                .input('InteriorSurfaceID', sql.TinyInt, InteriorSurfaceID)
                .input('InteriorColorID', sql.SmallInt, InteriorColorID)
                .input('TitleInHouse', sql.Bit, TitleInHouse)
                .input('TitleNo', sql.VarChar(50), TitleNo)
                .input('TitleComments', sql.VarChar(1000), TitleComments)
                .input('VehicleLocationID', sql.Int, VehicleLocationID)
                .input('VehicleReconID', sql.Int, VehicleReconID)
                .query(infoQuery);
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
                    InteriorSurfaceID, InteriorColorID, TitleInHouse, TitleNo, TitleComments,
                    VehicleLocationID, VehicleReconID
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

const updateCar = async (req, res) => {
    try {
        const { 
            VehicleID,
            UseRetailPrice,
            InternetPrice,
            RetailPrice, 
            WholesalePrice,
            WholesaleLightID,
            WholesaleComments,
            isBlueForWholesale,
            ReducedPrice,
            MonthlyPayment,
            Financed,
            KBBPrice,
            VehicleNADAPrice,
            isPublished,
            SpotLight,
            Featured,
            Certified,
            LowMileage,
            isSoldPublished,
            ShowHighLights,
            ShowCarFaxReportLink,
            HideCarFaxSnapshot,
            IsFrameDamage,
            LocalTrade,
            NoHagglePricing,
            ShowCarGurusLink,
            WarrantyTypeID
        } = req.body;

        // First verify the vehicle exists
        const carExists = await checkVehicleExists(VehicleID);
        
        if (!carExists) {
            return res.status(404).json({
                error: 'Vehicle not found',
                code: 'VEHICLE_NOT_FOUND'
            });
        }

        const carInternet = {
            VehicleID,
            InternetPrice,
            RetailPrice,
            WholesalePrice,
            WholesaleLightID,
            WholesaleComments,
            isBlueForWholesale: isBlueForWholesale || false,
            ReducedPrice,
            MonthlyPayment,
            Financed: Financed || false,
            KBBPrice,
            VehicleNADAPrice,
            isPublished: isPublished || false,
            SpotLight: SpotLight || false,
            Featured: Featured || false,
            Certified: Certified || false,
            LowMileage: LowMileage || false,
            isSoldPublished: isSoldPublished || false,
            ShowHighLights: ShowHighLights || false,
            ShowCarFaxReportLink: ShowCarFaxReportLink || false,
            HideCarFaxSnapshot: HideCarFaxSnapshot || false,
            IsFrameDamage: IsFrameDamage || false,
            UseRetailPrice: UseRetailPrice || false,
            LocalTrade: LocalTrade || false,
            NoHagglePricing: NoHagglePricing || false,
            ShowCarGurusLink: ShowCarGurusLink || false,
            WarrantyTypeID
        };

        try {
            await updateCarWithTransaction(carInternet);
            
            res.status(200).json({ 
                message: 'Car internet data updated successfully',
                VehicleID 
            });
        } catch (dbError) {
            console.error('Error updating car internet data:', dbError);
            throw new Error('Failed to update car internet data');
        }
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to update car internet data',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};


