/**
 * DevLens Lite – Seed Admin User
 * Run: node scripts/seed-admin.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../backend/.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/devlens";
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Inline minimal User schema
  const UserSchema = new mongoose.Schema({
    name:     String,
    email:    { type: String, unique: true },
    password: String,
    role:     { type: String, default: "admin" },
    isActive: { type: Boolean, default: true },
    avatar:   { type: String, default: "" },
    bio:      { type: String, default: "" },
    refreshTokens: [String],
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const email    = process.env.ADMIN_EMAIL    || "admin@devlens.io";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name     = process.env.ADMIN_NAME     || "DevLens Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role: "admin" });

  console.log("");
  console.log("✅ Admin user created!");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change this password immediately after first login.");
  console.log("");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
