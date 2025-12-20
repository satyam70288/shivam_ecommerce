// config/razorpay.js - Alternative method
const Razorpay = require('razorpay');

// Get environment variables with fallbacks
const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log("🔄 Initializing Razorpay with key:", keyId.substring(0, 15) + '...');

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
    console.log("🔐 Testing Razorpay authentication...");
    
    // Method 1: Try to fetch account details
    const account = await razorpayInstance.api.get('/');
    console.log("✅ Razorpay authentication successful!");
    return true;
    
  } catch (error) {
    console.error("❌ Razorpay authentication failed:", {
      status: error.statusCode,
      code: error.error?.code,
      description: error.error?.description
    });
    
    // Provide specific guidance
    if (error.statusCode === 401) {
      console.error("\n🔑 AUTHENTICATION FAILURE SOLUTIONS:");
      console.error("1. Your API keys are INVALID or EXPIRED");
      console.error("2. Generate NEW keys from Razorpay dashboard");
      console.error("3. Ensure you copy COMPLETE key (no truncation)");
      console.error("4. Check for extra spaces or newlines in .env");
      console.error("5. Use test keys (rzp_test_) for development");
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