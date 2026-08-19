const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/devlens";

  mongoose.connection.on("connected",    () => console.log("✅  MongoDB connected"));
  mongoose.connection.on("error",    (e) => console.error("❌  MongoDB error:", e.message));
  mongoose.connection.on("disconnected", () => console.warn("⚠️   MongoDB disconnected"));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
