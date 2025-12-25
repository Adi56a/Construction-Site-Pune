const express = require('express');
const router = express.Router();
const AddRentBuilding  = require('../models/AddRentBuilding')
const RentDetails  = require('../models/RentDetailsModel')


router.get('/' , (req,res) => {
    res.send("Rent API is running ")
})

router.post('/add-rent-building', async (req, res) => {
    
    const { buildingName, location } = req.body;

  
    if (!buildingName || !location) {
        return res.status(400).json({ message: 'Building name and location are required.' });
    }

    try {
        
        const newBuilding = new AddRentBuilding({
            buildingName,
            location,
        });

     
        await newBuilding.save();

       
        res.status(201).json({
            message: 'Building added successfully!',
            building: newBuilding
        });
    } catch (err) {
        
        console.error(err);
        res.status(500).json({ message: 'An error occurred while adding the building.' });
    }
});


router.get('/get-rent-buildings', async (req, res) => {
    try {
      
        const buildings = await AddRentBuilding.find();

        
        if (buildings.length === 0) {
            return res.status(404).json({ message: 'No buildings found.' });
        }

        
        res.status(200).json({
            message: 'Buildings fetched successfully!',
            buildings: buildings
        });
    } catch (err) {
        
        console.error(err);
        res.status(500).json({ message: 'An error occurred while fetching the buildings.' });
    }
});

router.post('/add-rent-details', async (req, res) => {
    try {
        // Extract data from the request body
        const {   owner_name, mobile_number, flat_number, deposit, rent, date, buildingId } = req.body;

        // Step 1: Create RentDetails first (for creating the rent contract)
        const rentDetails = new RentDetails({
            owner_name,
            mobile_number,
            flat_number,
            deposit,
            rent,
            date,
            buildingId  // This will link the rent details to a specific building
        });

        // Save the RentDetails document
        const savedRentDetails = await rentDetails.save();

        // Step 2: Find the AddRentBuilding document by buildingId
        const building = await AddRentBuilding.findById(buildingId);
        
        // If building does not exist, return an error
        if (!building) {
            return res.status(404).json({ message: 'Building not found.' });
        }

        // Step 3: Append the RentDetailsId to the RentDetailsId array
        building.RentDetailsId.push(savedRentDetails._id);

        // Step 4: Save the updated AddRentBuilding document
        const updatedBuilding = await building.save();

        // Step 5: Send a response with the saved data
        res.status(201).json({
            message: 'Rent details added and building updated successfully!',
            building: updatedBuilding,
            rentDetails: savedRentDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding rent details.' });
    }
});


router.get('/get-building/:buildingId', async (req, res) => {
    try {
        // Extract the buildingId from the request params
        const { buildingId } = req.params;

        // Find the building by buildingId and populate RentDetailsId
        const building = await AddRentBuilding.findById(buildingId)
            .populate('RentDetailsId')  // Populate the RentDetailsId array with RentDetails documents
            .exec();

        // If no building is found, return a 404 error
        if (!building) {
            return res.status(404).json({ message: 'Building not found.' });
        }

        // Send the response with the populated building and rent details
        res.status(200).json({
            message: 'Building and rent details fetched successfully!',
            building
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the building details.' });
    }
});


module.exports = router;