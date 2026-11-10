const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb+srv://neverfail2026_db_user:wU1Wd9DWLi2vlWek@cluster0.bolk1b8.mongodb.net/kinderjoy_db?retryWrites=true&w=majority&appName=Cluster0';

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  const uri = process.env.MONGODB_URI || DEFAULT_URI;

  try {
    cachedConn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      bufferCommands: false
    });
    console.log(`✅ MongoDB Atlas Connected: ${cachedConn.connection.host}`);
    return cachedConn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not throw fatal crash in serverless; return null so routes can handle gracefully
    return null;
  }
};

module.exports = connectDB;
