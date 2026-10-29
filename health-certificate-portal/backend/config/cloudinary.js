// Cloudinary configuration helper.
// Cloudinary is optional. If credentials are not set, image uploads fall back to local storage.
const cloudinary = require('cloudinary').v2;

let configured = false;

function configureCloudinary() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
    console.log('Cloudinary configured');
  } else {
    console.log('Cloudinary not configured - using local image storage');
  }
}

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

module.exports = { cloudinary, configureCloudinary, isCloudinaryConfigured };