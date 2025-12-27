const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const siteMaterialSchema = new Schema({
  material_name: {
    type: String,
    trim: true
  },
  received_quantity: { 
    type: Number
  },
  unit: {
    type: String
  },
  rate_of_material: {
    type: Number
  },
  total_money_amount: {
    type: Number
  },
  total_required_money_amount: {
    type: Number
  },
  total_required_material_amount: {
    type: Number
  },

  transaction_date: {
    type: Date,
    default: Date.now
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required:true
  }
}, {
  timestamps: true  
});


const SiteMaterial = mongoose.model('SiteMaterial', siteMaterialSchema);

module.exports = SiteMaterial;
