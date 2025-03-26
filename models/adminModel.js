const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    profileImage: {
      type: String, // Store the image URL from Cloudinary
      required: false, // The profile image is optional
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
