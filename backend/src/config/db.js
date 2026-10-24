import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_DB_URI;

  if (!uri) {
    console.error("❌ Error: MONGO_DB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host} [Database: ${connection.connection.name}]`);
    return connection;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not crash the entire process immediately in development so health check can report db status
    return null;
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err.message);
});
