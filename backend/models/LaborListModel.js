const mongoose = require('mongoose');

// Define the schema for the LabourList
const labourListSchema = new mongoose.Schema({
  LabourList: {
    type: [String],  // Array of strings
    required: true   // Ensures the array is provided
  }
});

// Create the Mongoose model
const LabourList = mongoose.model('LabourList', labourListSchema);

module.exports = LabourList;
