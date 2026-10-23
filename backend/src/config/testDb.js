import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db.js";

async function test() {
  console.log("Testing MongoDB connection to:", process.env.MONGO_DB_URI ? "URI provided" : "MISSING");
  const conn = await connectDB();
  if (conn) {
    console.log("Connection test SUCCESSFUL!");
    process.exit(0);
  } else {
    console.error("Connection test FAILED!");
    process.exit(1);
  }
}

test();
