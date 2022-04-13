const express = require("express");
const router = express.Router();
const {verifyAuth} = require('../middleware/auth');

const {
  addNewuser,
  addStaking,
  getReward,
  collectReward,
  unStakeNft,
  trnasferNFT,
  GVOreward,
  CollectGVOreward
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
router.post(
  "/unStakeNft",
  verifyAuth,
  unStakeNft
);
router.post("/trnasferNFT",verifyAuth,trnasferNFT);
router.get("/GVOreward",verifyAuth,GVOreward);
router.post("/CollectGVOreward", verifyAuth, CollectGVOreward)
module.exports = router;
