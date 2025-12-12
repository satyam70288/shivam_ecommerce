const express = require("express");
const { getAllCategories, getSingleCategory } = require("../controllers/categoryController");
const router = express.Router();


// GET all categories
router.get("/categories", getAllCategories);

// GET category by slug
router.get("/category/:slug", getSingleCategory);

module.exports = router;
