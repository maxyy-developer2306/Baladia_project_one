// Cryptographic helpers for generating unique keys.
const crypto = require('crypto');

// Generate a cryptographically random unique key for a certificate.
// Format: CERT-<8 hex chars>-<12 hex chars> (20 hex chars total).
function generateUniqueKey() {
  const part1 = crypto.randomBytes(4).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `CERT-${part1}-${part2}`;
}

module.exports = { generateUniqueKey };