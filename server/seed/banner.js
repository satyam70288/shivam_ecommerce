const mongoose = require('mongoose');
const Banner = require('../models/banner'); // Capital B
const MONGO_URI = "mongodb+srv://satyamb971_db_user:mQkimJ4UeyRnldla@cluster0.ajggbjn.mongodb.net/?retryWrites=true&w=majority"; // Database name add karna

const seedBanners = async () => {
  const defaultBanners = [
    {
      title: "Toys Collection",
      subtitle: "Fun & Educational",
      image: "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=1200&auto=format&fit=crop",
      tag: "BEST SELLER",
      link: "/category/toys",
      priority: 10,
      isActive: true
    },
    {
      title: "Gift Hampers",
      subtitle: "Perfect Presents",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop",
      tag: "POPULAR",
      link: "/category/gifts",
      priority: 9,
      isActive: true
    },
    {
      title: "Premium Stationery",
      subtitle: "Office & School",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop",
      tag: "SALE",
      link: "/category/stationery",
      priority: 8,
      isActive: true
    },
    {
      title: "Beauty & Cosmetic",
      subtitle: "Makeup & Skincare",
      image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=1200&auto=format&fit=crop",
      tag: "NEW",
      link: "/category/cosmetics",
      priority: 7,
      isActive: true
    },
    {
      title: "Fashion Jewellery",
      subtitle: "Latest Designs",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop",
      tag: "TRENDING",
      link: "/category/jewellery",
      priority: 6,
      isActive: true
    }
  ];

  try {
    // MongoDB connection
    await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected");
    
    console.log('🔗 MongoDB connected...');

    // Clear existing banners
    await Banner.deleteMany({});
    console.log('🗑️  Old banners cleared...');
    
    // Insert default banners
    await Banner.insertMany(defaultBanners);
    
    console.log('✅ Default banners seeded successfully!');
    console.log(`📊 Total banners: ${defaultBanners.length}`);
    
    // Connection close
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
    
    return defaultBanners;
  } catch (error) {
    console.error('❌ Error seeding banners:', error);
    
    // Ensure connection closes even on error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    throw error;
  }
};

// Agar directly run kar rahe ho to
if (require.main === module) {
  seedBanners()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedBanners;