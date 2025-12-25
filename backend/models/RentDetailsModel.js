const mongoose = require('mongoose');


const AddRentBuilding = require('../models/AddRentBuilding');


const rentDetailsSchema = new mongoose.Schema({
  owner_name: {
    type: String,
    required: true,  // Owner's name is required
    trim: true
  },
  mobile_number: {
    type: String,
    required: true,  
      
  },
  flat_number: {
    type: String,
    required: true,  
    trim: true
  },
  deposit: {
    type: Number,
    required: true,  
    min: 0  
  },
  rent: {
    type: Number,
    required: true, 
    min: 0  
  },
  date: {
    type: Date,
    required: true,  
    default: Date.now   
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AddRentBuilding',  
    required: true 
  }
});


const RentDetails = mongoose.model('RentDetails', rentDetailsSchema);


module.exports = RentDetails;
