const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    lastname: {
      type: String,
      required: [true, "Please provide a lastname"],
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
      type: String, // Store the image URL or path
      required: false, // The profile image is optional
    },
    resetPasswordCode: String, 
    resetPasswordCodeExpires: Date, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
