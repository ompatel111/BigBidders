const mongoose = require('mongoose');

// Define schema for contacts collection
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  interestedInJoining: { type: Boolean, default: false }
});

// Define schema for interested_people collection
const interestedPersonSchema = new mongoose.Schema({
  email: { type: String, required: true },
  dateTime: { type: Date, default: Date.now }
});

// Create models from the schemas
const Contact = mongoose.model('Contact', contactSchema);
const InterestedPerson = mongoose.model('InterestedPerson', interestedPersonSchema);

// Export models
module.exports = {
  Contact,
  InterestedPerson
};
