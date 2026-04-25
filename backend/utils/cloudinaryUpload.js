const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} fileBase64 - Base64 encoded image file
 * @param {string} fileName - Name of the file for organization
 * @returns {Promise<Object>} - Upload result with secure_url
 */
exports.uploadImage = async (fileBase64, fileName) => {
  try {
    // Remove data:image/...; base64, prefix if present
    const base64Data = fileBase64.includes('base64,')
      ? fileBase64.split('base64,')[1]
      : fileBase64;

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: 'bepam-shop-products',
        public_id: `${Date.now()}-${fileName}`,
        overwrite: true,
      }
    );

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      cloudinaryId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 */
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get Cloudinary upload signature for client-side upload (optional)
 */
exports.getUploadSignature = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'bepam-shop-products',
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
};
