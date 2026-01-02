// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { 
  
  getWishlist, 
  checkWishlistStatus, 
  toggleWishlist
} = require('../controllers/wishlistController');
const verifyToken = require('../middlewares/verifyToken');


// All routes require authentication
// router.use(verifyToken);

router.post('/toggle',verifyToken, toggleWishlist);
router.get('/wishlist',verifyToken, getWishlist);
router.get('/check/:productId',verifyToken, checkWishlistStatus);

module.exports = router;