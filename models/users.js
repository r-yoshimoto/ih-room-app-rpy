const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: String,
    password: String,
    fullName: String,
    imageUrl: String,
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