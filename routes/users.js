const express = require("express");
const router = express.Router();
const {verifyAuth} = require('../middleware/auth');

const {
  addNewuser,
  addStaking,
  getReward,
  collectReward
} = require("../controllers/users");


router.post(
    "/addNewuser",
    addNewuser
);
router.post(
    "/addStaking",
    verifyAuth,
    addStaking
);
router.get(
  "/getReward",
  verifyAuth,
  getReward
);
router.post(
  "/collectReward",
  verifyAuth,
  collectReward
);


module.exports = router;
