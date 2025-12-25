const mongoose = require('mongoose');

// Import the RentDetails model to reference it
const RentDetails = require('../models/RentDetailsModel');

// Define the schema for the building
const buildingSchema = new mongoose.Schema({
  buildingName: {
    type: String,
    required: true,  
    trim: true       
  },
  location: {
    type: String,
    required: true,  
    trim: true
  },
  dateOfCreation: {
    type: Date,
    default: Date.now   
  },
  // Add RentDetailsId as an array of ObjectIds
  RentDetailsId: [{
    type: mongoose.Schema.Types.ObjectId,  // Store ObjectId references
    ref: 'RentDetails'  // Referencing the RentDetails model
  }]
});

// Create the model from the schema
const AddRentBuilding = mongoose.model('AddRentBuilding', buildingSchema);

// Export the model so it can be used in other parts of the application
module.exports = AddRentBuilding;
