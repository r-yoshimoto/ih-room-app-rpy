const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    location: { type: { type: String }, coordinates: [Number] },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
  },
  {
    timestamps: true
  }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;