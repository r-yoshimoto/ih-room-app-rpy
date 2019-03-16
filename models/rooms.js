const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dnyftiqap/image/upload/v1551913366/ironhack-rooms-app/rooms/Spring-for-Quality-HOST0416.jpg"
    },
    imageId: {
      type: String,
      default:
        "/ironhack-rooms-app/rooms/Spring-for-Quality-HOST0416.jpg"
    },
    location: { type: { type: String }, coordinates: [Number] },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
  },
  {
    timestamps: true
  }
);

roomSchema.index({ location: "2dsphere" });


const Room = mongoose.model("Room", roomSchema);
module.exports = Room;