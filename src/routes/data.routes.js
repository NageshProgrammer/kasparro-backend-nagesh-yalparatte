const express = require("express");
const router = express.Router();
const { listPrices, triggerEtl } = require("../controllers/data.controller");

router.get("/latest", listPrices);
router.post("/run-etl", triggerEtl);

module.exports = router;
