const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {welcomeEmailTemplate}=require("../utils/userTemplate")
const sendMail = require("../utils/mailer"); // ✅ Adjust path as needed
// handles common MongoDB/Mongoose errors
const handleMongoError = (error) => {
  console.log(error,"errrr")
  if (error.name === "ValidationError") {
    // Mongoose validation errors
    const messages = Object.values(error.errors).map((val) => val.message);
    console.log(messages,"jjjj")
    return {
      statusCode: 400,
      message: messages.join(", "),
    };
  }

  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern)[0];
    return {
      statusCode: 400,
      message: `The ${field} is already in use. Please use a different one.`,
    };
  }

  // Fallback for unknown errors
  return {
    statusCode: 500,
    message: "Internal server error. Please try again later.",
  };
};

module.exports = handleMongoError;

const signup = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Please try again with a different email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    // ✅ 1. Send mail to ADMIN
    const adminHtml = `
      <h2>New User Registered</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    `;

    await sendMail(process.env.ADMIN_RECEIVER, "🚨 New User Signup", adminHtml);

    // ✅ 2. Send full HTML Welcome Email to USER
    const userHtml = welcomeEmailTemplate(
      name,
      "https://swag-fashion.vercel.app", // Website Link
      "support@swag-fashion.com"         // Support Info
    );

    await sendMail(email, "🎉 Welcome to Swag Fashion!", userHtml);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    const handled = handleMongoError(error);
    res.status(handled.statusCode).json({
      success: false,
      message: handled.message,
    });
  }
};


const login = async (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET // secret key
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const resetLink = `https://www.swagfashion.in/reset-password/${token}`;
  const html = `<p>Click below to reset your password:</p><a href="${resetLink}">Reset Password</a>`;

 const data= await sendMail(user.email, "Password Reset", html);
 console.log(data)
  res.json({ message: "Reset email sent" });
};
const resetPasword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
const adminSignup = async (req, res) => {
  const { username, password } = req.body;

  try {
    let admin = await Admin.findOne({ username });

    if (admin)
      return res.status(400).json({
        success: false,
        message: "Please try again with different username",
      });

    const securePassword = await bcrypt.hash(password, 10);

    admin = new Admin({
      username,
      password: securePassword,
    });

    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Admin signup successfull",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    let admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Please try again with different username",
      });
    }

    const comparePassword = await bcrypt.compare(password, admin.password);

    if (!comparePassword)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin logged in",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  signup,
  login,
  adminSignup,
  adminLogin,
  forgotPassword,
  resetPasword,
};
