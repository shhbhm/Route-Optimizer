const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cities: [{
    name: String,
    lat: Number,
    lng: Number
  }],
  optimizedRoute: [{
    name: String,
    order: Number
  }]
}, { collection: 'trips' });  // Explicitly specify collection name

module.exports = mongoose.model('Trip', tripSchema);