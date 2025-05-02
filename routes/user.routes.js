const express = require("express");
const router = express.Router();

router.post("/signup", (req, res) => {
  res.send("User signup route");
});

module.exports = router;
