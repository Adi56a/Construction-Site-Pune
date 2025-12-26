const mongoose = require('mongoose');
const AddRentBuilding = require('../models/AddRentBuilding')

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason_of_expense: {
    type: String,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  BuildingID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AddRentBuilding',
    required: true
  }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
