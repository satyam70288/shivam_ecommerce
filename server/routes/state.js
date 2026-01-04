// routes/locationRoutes.js
const express = require("express");
const { getStates } = require("../controllers/state");
const router = express.Router();

router.get("/location/states", getStates);

module.exports = router;