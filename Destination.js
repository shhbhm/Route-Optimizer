const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  description: {
    type: String,
    trim: true
  },
  activities: [{
    name: String,
    description: String,
    cost: Number,
    duration: Number,
    date: Date
  }],
  accommodation: {
    name: String,
    address: String,
    cost: Number,
    checkIn: Date,
    checkOut: Date
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
destinationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Destination', destinationSchema); 