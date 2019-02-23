const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");

router.get("/", (req, res, next) => {
  res.render("index");
});



/* Protected by Login */
router.use(ensureLogin.ensureLoggedIn());



module.exports = router;