const express = require("express");
const router = express.Router();
const { listCoins, triggerSync } = require("../controllers/coins.controller");

router.get("/", listCoins);
router.post("/sync", triggerSync);

module.exports = router;
