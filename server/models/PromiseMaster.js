const mongoose = require("mongoose");

const promiseMasterSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: String,
  description: String,
  iconId: String,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("PromiseMaster", promiseMasterSchema);
