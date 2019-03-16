const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const { uploadCloudRoom } = require("../services/cloudinary");
const Room = require("../models/rooms");
const Reviews = require ("../models/reviews");
const cloudinary = require("cloudinary");


router.get('/api', (req, res, next) => {
  //Poderia enviar apenas alguns parametros da DB
	Room.find({}, (error, allPlacesFromDB) => {
		if (error) { 
			next(error); 
		} else { 
			res.status(200).json({ places: allPlacesFromDB });
		}
	});
});

router.get('/api/:roomId', (req, res, next) => {
	Room.findById(req.params.roomId, (error, allPlacesFromDB) => {
		if (error) { 
			next(error); 
		} else { 
			res.status(200).json({ places: allPlacesFromDB });
		}
	});
});

router.get("/", (req, res, next) => {
  


  Room.find({})
  .populate("owner")
  .populate("reviews")
  // ao usar .populate o anterior room.onwer virou um objeto, por isso foi necessario adicionar ._id
    .then(rooms => {
    
      rooms.forEach(room => {
      room.imageUrl = cloudinary.url(room.imageId, {gravity: "center", height: 250, width: 200, crop: "fill"})
      
      if (room.reviews.length !== 0) {
      room.ratings = Math.round(room.reviews.reduce((a,b) => a+b.rating , 0) / room.reviews.length ) }
      else {room.ratings = ""}

      if (req.user && req.user._id.equals(room.owner.id)  ) { room.owned = true }
      
    })
      res.render("rooms", { rooms, msgError: req.flash('error') });
      
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get("/add", (req, res, next) => {
  res.render("rooms-add");
});

// para deletar talvez post seja melhor pra nao só dar o retorno mas garantir quem está fazendo a ação é de fato a pessoa que pode fazer a ação

router.get("/delete/:roomId", (req, res, next) => {

  Room.findById(req.params.roomId).then(room=> {  if (req.user._id.equals(room.owner)) { 

    Room.findByIdAndRemove(req.params.roomId)
  .then(
    res.redirect("/rooms"))
  .catch(err => {
    throw new Error(err);
  })

   }

   req.flash('error', "Errroooooou!")
   res.redirect("/rooms")
  })
  .catch(err => {
    throw new Error(err);
  })

  
});

router.post("/add", uploadCloudRoom.single("photo"), (req, res, next) => {
  const location = {
    type: "Point",
    coordinates: [req.body.longitude, req.body.latitude]
  };

const {name, photo, description } = req.body;
  
  if (name == "" || photo == "" || description == "" || location == "") {
    res.render("rooms-add", {
      msgError: `sorry all info should be input`
    });
    return;
  }

  const newRoom = new Room({
    name: req.body.name,
    description: req.body.description,
    location: location,
    owner: req.user._id
  });

  if (req.file) {
    newRoom.imageUrl = req.file.url;
    newRoom.imageId = req.file.public_id
  }

  newRoom
    .save()
    .then(room => {
      res.redirect("/rooms");
    })
    .catch(err => {
      throw new Error(err);
    });
    

});

router.post("/reviews/:room", (req, res, next) => {

  const {rating, comment } = req.body;
  const room = req.params.room
    
    if (rating == "" || comment == "") {
      
      req.flash('error', "Fill all the fields");
      res.redirect(`/rooms/${room}`);
      return;
    }
  
    const newReview = new Reviews({
      rating,
      comment,
      room,
      user: req.user._id
    });
  
  
    newReview
      .save()
      .then(review => {

        Room.findOneAndUpdate({_id: room},{ $push: {reviews: review._id }},
        {new: true }).then(_ => {          
          req.flash('success', "Your comment have been added to this room.")
        res.redirect(`/rooms/${room}`);})


      })
      .catch(err => {
        throw new Error(err);
      });
      
  
  });


// Rotas com /:id pegam qualquer coisa , entao tem q ser a ultima dentro das rotas
router.get("/:roomId", (req, res, next) => {


  Room.findById(req.params.roomId)
  .populate({ path: 'reviews', populate: { path: 'user' } })
  .then(room =>{
     
    room.imageUrl = cloudinary.url(room.imageId, {height: 500, crop: "fill"})
      
res.render("room-detail", {msgError: req.flash("error"), msgSuc: req.flash('success'), room})
    
  })
  .catch(err => {
    throw new Error(err);
  })

  
});



module.exports = router;
