
const express = require('express');
const Site = require('../models/siteModel');
const router = express.Router();
const MaterialList = require('../models/materialListModel')
const SiteMaterial = require('../models/siteMaterialModel')
const LabourList  = require('../models/LaborListModel')

router.get('/' , (req,res) => {
    res.send("Site api is running")
})

router.post('/create-site', async (req, res) => {
  try {
    const { ownerName, location, type, contactNumber, dateOfCreation } = req.body;

   
    const parsedDate = new Date(dateOfCreation);
    if (isNaN(parsedDate)) {
      return res.status(400).json({
        message: 'Invalid date format. Please provide a valid date.',
      });
    }

    const newSite = new Site({
      ownerName,
      location,
      type,
      contactNumber,
      dateOfCreation: parsedDate,  
    });

    await newSite.save();

    res.status(201).json({
      message: 'Site created successfully',
      site: {
        ownerName: newSite.ownerName,
        location: newSite.location,
        type: newSite.type,
        contactNumber: newSite.contactNumber,
        dateOfCreation: newSite.dateOfCreation,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error creating site',
      error: err.message,
    });
  }
});


router.get('/get-sites', async (req, res) => {
  try {
 
    const sites = await Site.find();

    if (!sites.length) {
      return res.status(404).json({
        message: 'No sites found.',
      });
    }

    res.status(200).json({
      message: 'Sites retrieved successfully',
      sites: sites.map(site => ({
       id: site._id,            // add this
    ownerName: site.ownerName,
    location: site.location,
    type: site.type,
    contactNumber: site.contactNumber,
    dateOfCreation: site.dateOfCreation,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error retrieving sites',
      error: err.message,
    });
  }
});

router.post('/addMaterialList', async (req, res) => {
  try {
    // Destructure materialNames and materialUnits from the request body
    const { materialNames, materialUnits } = req.body;

    // Basic validation: Check if both arrays are provided and have the same length
    if (!materialNames || !materialUnits) {
      return res.status(400).json({
        message: 'Both material names and units are required.',
      });
    }

    if (materialNames.length !== materialUnits.length) {
      return res.status(400).json({
        message: 'The number of material names must match the number of units.',
      });
    }

    // Find the document (you can modify this to find by a unique identifier if needed)
    const existingMaterialList = await MaterialList.findOne({});

    // If no document exists, create a new one
    if (!existingMaterialList) {
      const newMaterialList = new MaterialList({
        materialNames,
        materialUnits,
      });

      await newMaterialList.save();

      return res.status(201).json({
        message: 'Material list created and added successfully.',
        materialList: {
          id: newMaterialList._id,
          materialNames: newMaterialList.materialNames,
          materialUnits: newMaterialList.materialUnits,
        },
      });
    }

    // Check for duplicates and only add unique materials
    const existingNamesSet = new Set(existingMaterialList.materialNames);

    // Filter out existing materials from the incoming list
    const newMaterialNames = materialNames.filter((name, index) => {
      return !existingNamesSet.has(name);
    });

    const newMaterialUnits = newMaterialNames.map(name => {
      const index = materialNames.indexOf(name);
      return materialUnits[index];
    });

    // Append only the new (non-duplicate) materials to the arrays
    existingMaterialList.materialNames.push(...newMaterialNames);
    existingMaterialList.materialUnits.push(...newMaterialUnits);

    // Save the updated document
    await existingMaterialList.save();

    res.status(200).json({
      message: 'Material list updated successfully.',
      materialList: {
        id: existingMaterialList._id,
        materialNames: existingMaterialList.materialNames,
        materialUnits: existingMaterialList.materialUnits,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error while adding material list.',
      error: err.message,
    });
  }
});


router.get('/getAllMaterialList', async (req, res) => {
  try {
    // Find the material list document
    const materialList = await MaterialList.findOne({});

    // Check if the material list exists
    if (!materialList) {
      return res.status(404).json({
        message: 'No materials found.',
      });
    }

    // Respond with the material names and units
    res.status(200).json({
      message: 'Materials retrieved successfully.',
      materialList: {
        id: materialList._id,  // Return the document ID
        materialNames: materialList.materialNames,
        materialUnits: materialList.materialUnits,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error while retrieving material list.',
      error: err.message,
    });
  }
});

router.post('/addMaterialDetailsToSite', async (req, res) => {
  try {
    // ✅ EXACTLY MATCHING DATABASE SCHEMA
    const {
      material_name,
      received_quantity,
      unit,
      rate_of_material,
      total_money_amount,        // ✅ AUTO-CALCULATED FROM FRONTEND
      total_required_money_amount,   // ✅ USER INPUT
      total_required_material_amount, // ✅ USER INPUT
      siteId,
    } = req.body;

    // ✅ VALIDATE REQUIRED FIELDS
    if (!material_name || !received_quantity || !unit || !rate_of_material || !siteId) {
      return res.status(400).json({ 
        message: "All required fields must be provided: material_name, received_quantity, unit, rate_of_material, siteId" 
      });
    }

    // ✅ CREATE NEW MATERIAL WITH EXACT DATABASE FIELDS
    const newMaterial = new SiteMaterial({
      material_name: material_name.trim(),
      received_quantity: parseFloat(received_quantity),
      unit: unit.trim(),
      rate_of_material: parseFloat(rate_of_material),
      total_money_amount: parseFloat(total_money_amount) || 0,        // ✅ FROM FRONTEND CALCULATION
      total_required_money_amount: parseFloat(total_required_money_amount) || 0,   // ✅ USER INPUT
      total_required_material_amount: parseFloat(total_required_material_amount) || 0, // ✅ USER INPUT
      transaction_date: new Date(),
      siteId: siteId,
    });

    // ✅ SAVE THE MATERIAL
    const savedMaterial = await newMaterial.save();

    // ✅ UPDATE SITE DOCUMENT
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found." });
    }

    if (!site.materialID) {
      site.materialID = [];
    }

    site.materialID.push(savedMaterial._id);
    await site.save();

    // ✅ RETURN SUCCESS WITH SAVED MATERIAL
    return res.status(201).json({
      message: 'Material added successfully and Site updated.',
      material: savedMaterial,
    });

  } catch (error) {
    // ✅ BETTER ERROR LOGGING
    console.error('Error adding material:', error.message);
    return res.status(500).json({ 
      message: 'Error adding material to site.',
      error: error.message 
    });
  }
});



router.post('/addMaterialToSite', async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const { siteId, material_name } = req.body;

    // Check if the required fields are provided
    if (!siteId || !material_name) {
      return res.status(400).json({ message: "siteId and material_name are required." });
    }

    // Find the site by siteId
    const site = await Site.findById(siteId);
    
    // Check if the site exists
    if (!site) {
      return res.status(404).json({ message: "Site not found." });
    }

    // Check if the material already exists in the siteMaterial array
    if (site.siteMaterial.includes(material_name)) {
      return res.status(400).json({ message: "Material already exists in the siteMaterial array." });
    }

    // Add new material to the siteMaterial array
    site.siteMaterial.push(material_name);

    // Save the updated site document
    await site.save();

    // Respond with only the siteMaterial array
    return res.status(200).json({
      message: "Material added to site successfully.",
      siteMaterial: site.siteMaterial  // Return only the updated siteMaterial array
    });
  } catch (error) {
    // Handle any errors during the process
    console.error(error);
    return res.status(500).json({ message: "Server error. Could not add material." });
  }
});

router.get('/getSiteMaterial/:siteId', async (req, res) => {
  try {
    // Get the siteId from the URL parameters
    const { siteId } = req.params;

    // Validate if the siteId is provided
    if (!siteId) {
      return res.status(400).json({ message: "siteId is required." });
    }

    // Find the site by siteId
    const site = await Site.findById(siteId);

    // Check if the site exists
    if (!site) {
      return res.status(404).json({ message: "Site not found." });
    }

    // Respond with the siteMaterial array
    return res.status(200).json({
      message: "Site materials fetched successfully.",
      siteMaterial: site.siteMaterial  // Return only the siteMaterial array
    });
  } catch (error) {
    // Handle any errors during the process
    console.error(error);
    return res.status(500).json({ message: "Server error. Could not fetch site materials." });
  }
});


router.get('/getMaterialDetails', async (req, res) => {
  try {
    // Destructure the query parameters from the request
    const { siteId, material_name } = req.query;

    // Validate if siteId is provided
    if (!siteId) {
      return res.status(400).json({ message: "Site ID is required." });
    }

    // Find the Site document by ID and populate the materialID array
    const site = await Site.findById(siteId).populate('materialID'); // Populate materialID array
    if (!site) {
      return res.status(404).json({ message: "Site not found." });
    }

    // If material_name is provided, filter the materials by material_name
    let filteredMaterials = site.materialID;
    if (material_name) {
      filteredMaterials = filteredMaterials.filter((material) =>
        material.material_name.toLowerCase().includes(material_name.toLowerCase())
      );
    }

    // If no materials are found based on the filter
    if (filteredMaterials.length === 0) {
      return res.status(404).json({ message: "No matching materials found." });
    }

    // Return the filtered materials along with a success message
    return res.status(200).json({
      message: 'Materials retrieved successfully.',
      materials: filteredMaterials
    });
  } catch (error) {
    // Handle any errors during the process
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving material details.' });
  }
});


router.post('/addLabourList', async (req, res) => {
  const { name } = req.body;

 
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    
    let newNames = Array.isArray(name) ? name : [name];

   
    let labourList = await LabourList.findOne();

    if (!labourList) {
   
      labourList = new LabourList({
        LabourList: newNames
      });
    } else {
  
      labourList.LabourList.push(...newNames);
    }

    
    await labourList.save();

    
    res.status(200).json(labourList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getLabourList', async (req, res) => {
  try {
    // Find the LabourList document (assuming there is only one document)
    const labourList = await LabourList.findOne();

    // If no LabourList document is found, return a 404 error
    if (!labourList) {
      return res.status(404).json({ message: 'Labour list not found' });
    }

    // Return the LabourList array
    res.status(200).json(labourList.LabourList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
