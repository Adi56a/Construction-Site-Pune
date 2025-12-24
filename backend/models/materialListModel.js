const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for Material List
const materialListSchema = new Schema({
  materialNames: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 100 materials']
  },
  materialUnits: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 100 units']
  }
});

// Custom validation for array length (you can adjust the limit)
function arrayLimit(val) {
  return val.length <= 100;
}

// Export the model properly
const MaterialList = mongoose.model('MaterialList', materialListSchema);
module.exports = MaterialList;
