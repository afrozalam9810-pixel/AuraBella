const mongoose = require("mongoose");

// A single atomic counter per calendar year prevents duplicate invoice numbers.
const invoiceCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  sequence: { type: Number, default: 0 },
});

module.exports = mongoose.model("InvoiceCounter", invoiceCounterSchema);
