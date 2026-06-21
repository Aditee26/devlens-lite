require("dotenv").config();
require("express-async-errors");

const app = require("./app");
const { connectDB } = require("./config/database");

const PORT = parseInt(process.env.PORT || "4000", 10);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀  DevLens API  →  http://localhost:${PORT}`);
    console.log(`    ENV  : ${process.env.NODE_ENV || "development"}`);
    console.log(`    Mongo: ${process.env.MONGO_URI}\n`);
  });
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
