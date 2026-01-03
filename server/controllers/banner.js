const Banner = require('../models/banner');
const cloudinary=require("../utils/cloudinary")
const fs = require("fs");

// Get all active banners
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .select('title subtitle image tag link') // Only send necessary fields
      .limit(10);
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
};

// Create Banner with Image Upload

async function cloudinaryUploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}


exports.createBanner = async (req, res) => {

  try {
    const { title, subtitle, tag, link, priority, isActive } = req.body;
    
    console.log("Request body:", req.body);
    console.log("Request file exists:", !!req.file);
    
    let imageUrl = "";
    let publicId = "";

    // Priority 1: Check for uploaded file
    if (req.file) {
      console.log("File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer?.length || 0
      });
      
      try {
        console.log("Uploading to Cloudinary using buffer...");
        
        // Use the same upload function as products
        const uploadResult = await cloudinaryUploadBuffer(req.file.buffer, {
          folder: "banners",
          transformation: [
            { width: 1200, height: 500, crop: "fill" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        });
        
        console.log("Cloudinary upload successful!");
        console.log("Result:", {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
        
        imageUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
          error: cloudinaryError.message
        });
      }
    } 
    // Priority 2: Check if image URL is provided in form
    else if (req.body.image && req.body.image.startsWith('http')) {
      console.log("Using provided image URL:", req.body.image);
      imageUrl = req.body.image;
    } 
    else {
      console.log("No image provided");
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    console.log("Creating banner with data:", {
      title,
      subtitle,
      imageUrl,
      tag,
      link,
      priority,
      isActive
    });

    // Create banner in database
    const banner = new Banner({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      image: imageUrl,
      cloudinaryId: publicId, // Store Cloudinary public_id for future deletion
      tag: tag || "FEATURED",
      link: link || '/',
      priority: parseInt(priority) || 5,
      isActive: isActive === 'true' || isActive === true || isActive === '1'
    });

    await banner.save();
    
    console.log("Banner created successfully:", banner._id);
    
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner
    });
    
  } catch (error) {
    console.error("Create banner error:", error);
    
    res.status(500).json({
      success: false,
      message: "Error creating banner",
      error: error.message
    });
  }
};
// Update Banner with optional image update
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, tag, link, priority, isActive } = req.body;
    let updateData = { title, subtitle, tag, link, priority, isActive };

    // If new image is provided
    if (req.file) {
      try {
        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "banners",
          width: 1200,
          height: 500,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto"
        });
        
        updateData.image = result.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Error uploading image to Cloudinary",
          error: uploadError.message
        });
      }
    } else if (req.body.image) {
      // If image is provided as URL
      updateData.image = req.body.image;
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating banner',
      error: error.message
    });
  }
};

// Delete Banner (also delete image from Cloudinary)
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // If banner has Cloudinary image, delete it
    if (banner.image && banner.image.includes('cloudinary.com')) {
      try {
        // Better way to extract public_id from Cloudinary URL
        const urlParts = banner.image.split('/');
        const cloudinaryIndex = urlParts.findIndex(part => part.includes('cloudinary.com'));
        console.log(urlParts)
        console.log(cloudinaryIndex,"cloudinaryIndex")
        if (cloudinaryIndex !== -1) {
          // Get the public_id (everything after the version number)
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          console.log(uploadIndex)
          if (uploadIndex !== -1) {
            // Skip version number (e.g., v1712345678) and get remaining parts
            const publicIdParts = urlParts.slice(uploadIndex + 2);
            const publicId = publicIdParts.join('/').split('.')[0];
            console.log(publicId)
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with banner deletion even if image delete fails
      }
    }

    await Banner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message
    });
  }
};

// Get all banners (Admin panel)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ createdAt: -1 })
      .select('title subtitle image tag link isActive priority createdAt');
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    }); // Missing closing brace and parenthesis
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
};