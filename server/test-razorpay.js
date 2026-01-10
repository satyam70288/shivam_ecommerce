// test-razorpay.js (create a test file)
const Razorpay = require('razorpay');

const testKeys = async () => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  try {
   
    
    // Try to create a small test order
    const order = await razorpay.orders.create({
      amount: 100, // 1 rupee
      currency: "INR",
      receipt: "test_receipt"
    });
    
   
    
    // Try to fetch the order
    const fetched = await razorpay.orders.fetch(order.id);
    
    return true;
  } catch (error) {
    console.error("❌ FAILED: Razorpay keys are invalid");
    console.error("Error:", error.message);
    
    if (error.statusCode === 401) {
      console.error("🔑 Authentication failed. Please check:");
      console.error("1. Your RAZORPAY_KEY_ID is correct");
      console.error("2. Your RAZORPAY_KEY_SECRET is correct");
      console.error("3. Keys are not expired");
      console.error("4. You're using test keys for test mode");
    }
    
    return false;
  }
};

testKeys();