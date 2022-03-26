var express = require("express");
var router = express.Router();
const Nfts = require("../models/nfts");
const User = require("../models/user");

router.post("/", async (req, res, next) => {
  //   Nfts.create({ tokenId: req.body.id });
  //   User.create({ address: `ad${req.body.id}`, nick: `ad${req.body.id}` });
  const nft = await Nfts.findOne({
    where: { tokenId: 1 },
  });
  const user = await User.findOne({ where: { address: "ad3" } });
  console.log(await user);

  try {
    const hate = await Nfts.findOne({
      where: { userId: userId, tokenId: tokenId },
    });
    if (!hate) {
      Nfts.create({
        userId: userId,
        tokenId: tokenId,
      });
    } else {
      Nfts.destroy({
        userId: userId,
        tokenId: tokenId,
      });
    }
    return res.json({ message: "ok" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
