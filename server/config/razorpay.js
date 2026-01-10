// config/razorpay.js - Alternative method
const Razorpay = require('razorpay');

// Get environment variables with fallbacks
const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();



if (!keyId || !keySecret) {
  console.error("❌ Razorpay keys are missing in environment variables");
  throw new Error("Razorpay configuration error: Missing API keys");
}

// Create Razorpay instance with validation
const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

// Test the instance immediately
async function testRazorpay() {
  try {
  
    
    // Method 1: Try to fetch account details
    const account = await razorpayInstance.api.get('/');

    return true;
    
  } catch (error) {
    console.error("❌ Razorpay authentication failed:", {
      status: error.statusCode,
      code: error.error?.code,
      description: error.error?.description
    });
    
    // Provide specific guidance
    if (error.statusCode === 401) {
      
    }
    
    return false;
  }
}

// Run test on startup
testRazorpay().then(success => {
  if (!success) {
    console.error("⚠️ WARNING: Razorpay authentication failed on startup");
  }
});

module.exports = razorpayInstance;