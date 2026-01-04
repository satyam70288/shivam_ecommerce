
const mongoose = require('mongoose');
const State = require('../models/State'); // Capital B
const MONGO_URI = "mongodb+srv://satyamb971_db_user:mQkimJ4UeyRnldla@cluster0.ajggbjn.mongodb.net/?retryWrites=true&w=majority"; // Database name add karna

const seedBanners = async () => {
  
const stateData = [
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chhattisgarh", code: "CG" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OD" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TS" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UK" },
  { name: "West Bengal", code: "WB" },

  // Union Territories
  { name: "Andaman and Nicobar Islands", code: "AN" },
  { name: "Chandigarh", code: "CH" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN" },
  { name: "Delhi", code: "DL" },
  { name: "Jammu and Kashmir", code: "JK" },
  { name: "Ladakh", code: "LA" },
  { name: "Lakshadweep", code: "LD" },
  { name: "Puducherry", code: "PY" }
];
  try {
    // MongoDB connection
    await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected");
    
    console.log('🔗 MongoDB connected...');

    // Clear existing banners
    await State.deleteMany({});
    console.log('🗑️  Old banners cleared...');
    
    // Insert default banners
    await State.insertMany(stateData);
    
    console.log('✅ Default banners seeded successfully!');
    console.log(`📊 Total banners: ${stateData.length}`);
    
    // Connection close
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
    
    return stateData;
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