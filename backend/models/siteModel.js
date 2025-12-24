const mongoose = require('mongoose');


const siteSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['gov', 'solo', 'private'],
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    dateOfCreation: {
      type: Date,
      required: true,  
    },

    siteMaterial: {
      type: [String],  
      default: [],    
    },
   
    materialID: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SiteMaterial',  
    }]
  },
  {
    timestamps: true,
  }
);

const Site = mongoose.model('Site', siteSchema);

module.exports = Site;
