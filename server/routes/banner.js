const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner');
const upload = require('../middlewares/multer');
// const { protect, admin } = require('../middleware/auth');

// Public route - Get active banners
router.get('/banners/active', bannerController.getActiveBanners);

// Admin routes (Protected)
router.post("/banners", upload.single("image"), bannerController.createBanner);
router.put("/banners/:id", upload.single("image"), bannerController.updateBanner);router.delete('/banners/:id',   bannerController.deleteBanner);
router.get('/banners/all',   bannerController.getAllBanners);

module.exports = router;