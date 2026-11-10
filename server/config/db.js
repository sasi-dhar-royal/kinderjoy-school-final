const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    throw new Error('MONGODB_URI environment variable is missing');
  }

  try {
    cachedConn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      bufferCommands: false
    });
    console.log(`✅ MongoDB Atlas Connected: ${cachedConn.connection.host}`);
    return cachedConn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
