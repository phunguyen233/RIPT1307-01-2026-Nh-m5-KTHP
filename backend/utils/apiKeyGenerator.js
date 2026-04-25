const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Generate a unique API key
 * Format: bepam_[random_hash]
 */
exports.generateApiKey = () => {
  const prefix = 'bepmam_';
  const randomPart = crypto.randomBytes(32).toString('hex');
  return prefix + randomPart;
};

/**
 * Generate a random shop identifier
 */
exports.generateShopId = () => {
  return uuidv4();
};
