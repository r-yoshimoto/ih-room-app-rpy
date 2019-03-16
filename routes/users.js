const express = require("express");
const router = express.Router();
const User = require("../models/users");
const cloudinary = require("cloudinary");
const { uploadCloudProfile } = require("../services/cloudinary");


router.get("/", (req, res, next) => {
  User.find({})
    .then(users => {
      users.forEach(user => {
      user.imageUrl = cloudinary.url(user.imageId, {gravity: "center", height: 200, width: 200, crop: "fill"})
      })
      res.render("users", { users });
      
    })
    .catch(err => {
      throw new Error(err);
    });
});;

router.get("/edit", (req, res, next) => {
  
  User.findById(req.user._id)
    .then(user => {
      
        res.render("user-edit", { user, msgSuc: req.flash('success') });
      }
    )
    .catch(error => {
      console.log(error);
    });
});

router.post("/edit", uploadCloudProfile.single("photo"), (req, res, next) => {
 
  
  let { email, fullName } = req.body;
  
  const updateUser = {
    email, fullName
  }

  if (req.file) {
    updateUser.imageUrl = req.file.url;
    updateUser.imageId = req.file.public_id
  }



  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updateUser },
    { new: true }
  )
    .then(user => {
      req.flash('success', 'Success!!!!!!!!!!!!')
      res.redirect("/users/edit");
    })
    .catch(err => {
      throw new Error(err);
    });
});

module.exports = router;
