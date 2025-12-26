const mongoose = require('mongoose');

// Import the Expense model to reference it
const Expense = require('../models/ExpenseModel');

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
  RentDetailsId: [{
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'RentDetails'  
  }],
  ExpenseIds: [{
    type: mongoose.Schema.Types.ObjectId,  // Array of ObjectIds for Expenses
    ref: 'Expense'  // Referencing the Expense model
  }]
});

// Create the model from the schema
const AddRentBuilding = mongoose.model('AddRentBuilding', buildingSchema);

// Export the model so it can be used in other parts of the application
module.exports = AddRentBuilding;
