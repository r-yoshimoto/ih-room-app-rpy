const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: String,
    password: String,
    fullName: String,
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dnyftiqap/image/upload/v1551551240/ironhack-rooms-app/profiles/profile-placeholder.png"
    },
    imageId:{
      type: String,
      default:
        "ironhack-rooms-app/profiles/profile-placeholder.png"
    },
    facebookID: String,
    googleID: String,
    status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending"
    },
    confirmationCode: String
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
