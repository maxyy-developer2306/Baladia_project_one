// Mongoose schema for a Health Certificate record.
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    uniqueKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'deactive'],
        message: 'Status must be either "active" or "deactive".',
      },
      default: 'active',
      index: true,
    },
    // URL/path to the person's photograph (stored locally or on Cloudinary).
    userPhoto: {
      type: String,
      default: '',
      trim: true,
    },
    // Administrative / municipality identifiers.
    amanah: {
      type: String,
      default: '',
      trim: true,
    },
    municipality: {
      type: String,
      default: '',
      trim: true,
    },
    // Person's identity fields.
    name: {
      type: String,
      default: '',
      trim: true,
    },
    identityNumber: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      default: '',
      trim: true,
    },
    nationality: {
      type: String,
      default: '',
      trim: true,
    },
    certificateNumber: {
      type: String,
      default: '',
      trim: true,
    },
    profession: {
      type: String,
      default: '',
      trim: true,
    },
    // Dates. Hijri dates are kept exactly as entered by the admin.
    issueDateHijri: {
      type: String,
      default: '',
      trim: true,
    },
    issueDateGregorian: {
      type: String,
      default: '',
      trim: true,
    },
    expiryDateHijri: {
      type: String,
      default: '',
      trim: true,
    },
    expiryDateGregorian: {
      type: String,
      default: '',
      trim: true,
    },
    // Program and facility details.
    programType: {
      type: String,
      default: '',
      trim: true,
    },
    programEndDate: {
      type: String,
      default: '',
      trim: true,
    },
    licenseNumber: {
      type: String,
      default: '',
      trim: true,
    },
    facilityName: {
      type: String,
      default: '',
      trim: true,
    },
    facilityNumber: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically.
  }
);

// Index frequently searched fields.
certificateSchema.index({ name: 'text' });
certificateSchema.index({ certificateNumber: 'text' });

module.exports = mongoose.model('Certificate', certificateSchema);