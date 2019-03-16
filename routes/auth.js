const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const { uploadCloudProfile } = require("../services/cloudinary");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const User = require("../models/users");

const nodemailer = require("nodemailer")




router.get("/sign-up", (req, res, next) => {
  res.render("auth/sign-up");
});

router.post("/sign-up", uploadCloudProfile.single("photo"), (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const fullName = req.body.fullName;

  if (email == "" || password == "") {
    res.render("auth/sign-up", {
      msgError: `email and password can't be empty`
    });
    return;
  }

  User.findOne({ email: email })
    .then(user => {
      if (user !== null) {
        res.render("auth/sign-up", {
          msgError: "The email already exists!"
        });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let confirmationCode = "";
    for (let i = 0; i < 25; i++) {
      confirmationCode +=
        characters[Math.floor(Math.random() * characters.length)];
    }

      const newUser = new User({
        // quando a chave do objecto igual a uma variavel n precisa repertir (ex. fullname: fullname)
        email,
        password: hashPass,
        fullName,
        confirmationCode
      });

      if (req.file) {
        newUser.imageUrl = req.file.url;
        newUser.imageId = req.file.public_id
      }

      newUser
        .save()
        .then(user => {
          let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.NODEMAILER_USER,
              pass: process.env.NODEMAILER_PASS
            }
          });
          transporter
            .sendMail({
              from: '"My Awesome Project 👻" <noreply@project.com>',
              to: email,
              subject: "email confirmation required",
              // text: message,
              html: `please click <a href="http://localhost:3000/confirm/${confirmationCode}">here</a>
              `
            })
            .then(info => console.log("nodemailer success -->", info))
            .catch(error => console.log(error));
         
        req.flash('success', "Please check your email to active your account")
        res.redirect("/login");
    })
        .catch(err => {
          throw new Error(err);
        });
      })
    .catch(err => {
      throw new Error(err);
    });
  });

router.get('/confirm/resend/:confirmationCode', (req,res) => {

  const { confirmationCode } = req.params;


  User.findOne({confirmationCode})
  .then(user => {
    let transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
      }
    });
    transporter
      .sendMail({
        from: '"My Awesome Project 👻" <noreply@project.com>',
        to: user.email,
        subject: "[RESEND] email confirmation required",
        // text: message,
        html: `please click <a href="http://localhost:3000/confirm/${confirmationCode}">here</a>
        `
      })
      .then(info => console.log("nodemailer success -->", info))
      .catch(error => console.log(error));

      req.flash('success', "We've resend your code, please check your email ")
      res.redirect("/login");
    })
  .catch(err => {
    throw new Error(err);
  })

})

router.get('/confirm/:confirmationCode', (req,res) => {
  const { confirmationCode } = req.params;

  User.findOneAndUpdate({confirmationCode},{ $set: {status: 'Active'}},
    // traz o dado atualizado pq se nao ele fica cached o antigo
    {new: true })
  .then(user => {
    if ((user)){ 
    
    req.flash('success', "Your account has been activated!")
    res.redirect("/login");
    
     } else {
     
      req.flash('error', "Invalid confirmation code")
      res.redirect("/login");
    
    }
  })
  .catch(err => { throw new Error(err)})

});

router.get("/login", (req,res,next) => {

  if(req.user){
    req.flash('error', `You are already logged in YOU FOOL!! Butcha can logout <a href="/logout?=fool">clicking here</a> and login again if needed.`
    )
    res.redirect("/rooms")

  } 

  res.render("auth/login", {msgError: req.flash("error"), msgSuc: req.flash('success')})

})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/rooms",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});


router.get("/change-password", (req,res,next) => {
  res.render("auth/change-password")

})


router.post("/change-password", (req, res, next) => {
  const {email, currentPassword, password, passwordCheck} = req.body;

  if (password == "" || currentPassword == "" || passwordCheck == "" ) {
    res.render("auth/change-password", {
      msgError: `Please fill all fields`
    });
    return;
  }
 
  if (password == currentPassword) {
    res.render("auth/change-password", {
      msgError: `Who are you trying to fool changing your password for your current password?`
    });
    return;
  }


  if (password !== passwordCheck) {
    res.render("auth/change-password", {
      msgError: `New password doesn't match`
    });
    return;
  }

  if (!bcrypt.compareSync(currentPassword, req.user.password)){
    res.render("auth/change-password", {
      msgError: `Current Password Doesnt Match!`
    });
    return;
  }


    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let confirmationCode = "";
  for (let i = 0; i < 25; i++) {
    confirmationCode +=
      characters[Math.floor(Math.random() * characters.length)];
  }


    User.findOneAndUpdate({email},{ $set: {status: 'Pending', confirmationCode: confirmationCode, password: hashPass }},
    {new: true })
  .then(user => {
    if ((user)){ 

      let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS
        }
      });
      transporter
        .sendMail({
          from: '"My Awesome Project 👻" <noreply@project.com>',
          to: user.email,
          subject: "[PASSWORD CHANGE] email confirmation required",
          // text: message,
          html: `please click <a href="http://localhost:3000/confirm/${confirmationCode}">here</a>
          `
        })
        .then(info => console.log("nodemailer success -->", info))
        .catch(error => console.log(error));

    req.logout();
    req.flash('success', "Your password have been changed, please confirm your email!")
    res.redirect("/login");
      } 
  })
  .catch(err => { throw new Error(err)})

});

router.get("/retrive", (req, res, next) => {
  res.render("auth/retrive")
});

router.post("/retrive", (req, res, next) => {
  const {email} = req.body;

  const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
let resetPasswordCode = "";
for (let i = 0; i < 25; i++) {
  resetPasswordCode +=
    characters[Math.floor(Math.random() * characters.length)];
}

  User.findOneAndUpdate({email},{ $set: {resetPasswordCode: resetPasswordCode }},
  {new: true })
  .then(user => {
    if ((user)){ 

      let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS
        }
      });
      transporter
        .sendMail({
          from: '"My Awesome Project 👻" <noreply@project.com>',
          to: user.email,
          subject: "[FORGOT PASSWORD] email confirmation required",
          // text: message,
          html: `please click <a href="http://localhost:3000/retrive/${resetPasswordCode}">here</a>
          `
        })
        .then(info => console.log("nodemailer success -->", info))
        .catch(error => console.log(error));

    req.flash('success', "An e-mail with instruction have been send!")
    res.redirect("/login");
      } 
  })
  .catch(err => { throw new Error(err)})
});

router.get("/retrive/:resetPasswordCode", (req, res, next) => {
  
  const { resetPasswordCode } = req.params;

  User.findOne({resetPasswordCode},
    // traz o dado atualizado pq se nao ele fica cached o antigo
    {new: true })
  .then(user => {
    if ((user)){ 
    
      

    res.render("auth/retrive-new-password", {code: resetPasswordCode});
    
     } else {
     
      req.flash('error', "Invalid confirmation code")
      res.redirect("/login");
    
    }
  })
  .catch(err => { throw new Error(err)})
  
});

router.post("/retrive/change-password", (req, res, next) => {
  
  const { resetPasswordCode, password, passwordCheck } = req.body;

  if (password == "" || passwordCheck == "" ) {
    res.render("auth/retrive-new-password", {
      msgError: `Please fill all fields`, code: resetPasswordCode
    });
    return;
  }
 
  if (password !== passwordCheck) {
    res.render("auth/retrive-new-password", {
      msgError: `New password doesn't match`, code: resetPasswordCode
    });
    return;
  }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);


  User.findOneAndUpdate({resetPasswordCode},{$set: {resetPasswordCode: "", password: hashPass}},
    {new: true })
  .then(user => {
    if ((user)){ 
    
      req.flash('success', "Password changed, grats")

      req.body.email = user.email;
      req.body.password = password;

      passport.authenticate("local", {
        successRedirect: "/rooms",
        failureRedirect: "/login",
        failureFlash: true,
        passReqToCallback: true
      })(req, res, next)

     } else {
     
      req.flash('error', "Invalid confirmation code")
      res.redirect("/login");
    
    }
  })
  .catch(err => { throw new Error(err)})
  
});

module.exports = router;
