// QR code generation helper.
// Uses the 'qrcode' package to generate a PNG data URL for a verification URL.
const QRCode = require('qrcode');

// Generate a QR code as a PNG data URL (base64).
// @param {string} url - The verification URL to encode.
// @param {object} options - Optional QR code options.
// @returns {Promise<string>} Base64 PNG data URL.
async function generateQRDataUrl(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: 300,
  };

  return QRCode.toDataURL(url, { ...defaultOptions, ...options });
}

module.exports = { generateQRDataUrl };