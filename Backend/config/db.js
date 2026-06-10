import mongoose from "mongoose"
import colors from "colors"

const connectDB = async () => {
  try {
    const url = process.env.MONGO_URL || process.env.MONGO_LOCAL_URL || "mongodb://127.0.0.1:27017/jobportal";
    const conn = await mongoose.connect(url);
    console.log(`Connected To Mongodb Database ${mongoose.connection.host}`.bgMagenta.white);
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