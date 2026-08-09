import mongoose from "mongoose"
import colors from "colors"

const connectDB = async () => {
  try {
    const url = process.env.MONGO_URL || process.env.MONGO_LOCAL_URL || "mongodb://127.0.0.1:27017/jobportal";
    const conn = await mongoose.connect(url);
    console.log(`Connected To Mongodb Database ${mongoose.connection.host}`.bgMagenta.white);

    // ── Drop the old username_1 unique index if it exists ──────────────────
    // This index was causing "duplicate key" errors during registration
    // because multiple users had username: "" stored in the DB.
    // Uniqueness is now checked manually in the controller instead.
    try {
      const usersCollection = mongoose.connection.collection("users");
      const indexes = await usersCollection.indexes();
      const hasOldIndex = indexes.some(
        (idx) => idx.name === "username_1" && idx.unique === true
      );
      if (hasOldIndex) {
        await usersCollection.dropIndex("username_1");
        console.log("[DB] Dropped old username_1 unique index ✅".yellow);
      }
    } catch (idxErr) {
      // Non-fatal — index may not exist
      console.log(`[DB] Index cleanup skipped: ${idxErr.message}`.gray);
    }

  } catch (error) {
    console.log(`MongoDB Primary Connection Error: ${error.message}`.bgRed.white);
    if (process.env.MONGO_LOCAL_URL && process.env.MONGO_URL && process.env.MONGO_URL !== process.env.MONGO_LOCAL_URL) {
      try {
        console.log(`Attempting fallback to local MongoDB...`.yellow);
        const conn = await mongoose.connect(process.env.MONGO_LOCAL_URL);
        console.log(`Connected To Local Mongodb Database ${mongoose.connection.host}`.bgMagenta.white);
        return;
      } catch (fallbackError) {
        console.log(`MongoDB Local Fallback Connection Error: ${fallbackError.message}`.bgRed.white);
      }
    }
    console.log("Failed to connect to any database. Exiting server...".red);
    process.exit(1);
  }
};

export default connectDB;