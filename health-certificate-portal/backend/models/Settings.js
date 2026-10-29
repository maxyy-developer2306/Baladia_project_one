// Settings model.
// Stores simple key/value configuration, such as the active redirect deployment.
// Only one document is expected (singleton pattern).
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSetting = async function (key, defaultValue = null) {
  const doc = await this.findOne({ key });
  return doc ? doc.value : defaultValue;
};

settingsSchema.statics.setSetting = async function (key, value) {
  return this.findOneAndUpdate(
    { key },
    { value: String(value) },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Setting', settingsSchema);