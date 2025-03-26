const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

// Helper function to get Cloudinary storage configuration based on context
const getStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folder,  // Set dynamic folder name
      allowed_formats: ["jpg", "png", "jpeg"],  // Allowed formats
    },
  });
};

// Create upload middleware for trip images
const uploadTripImage = multer({ storage: getStorage("trips") });

// Create upload middleware for user profile images
const uploadProfileImage = multer({ storage: getStorage("users") });

module.exports = { uploadTripImage, uploadProfileImage };  // Export both upload middlewares
