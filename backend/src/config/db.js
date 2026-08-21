const mongoose = require('mongoose');

const connectDB = async (customUri) => {
  try {
    const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticket-booking';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`\n⚠️ [MONGODB CONNECTION WARNING] ${error.message}`);
    console.warn(`The backend API server remains ACTIVE. Ensure local MongoDB service is running or set MONGODB_URI in backend/.env for database persistence.\n`);
    return null;
  }
};

module.exports = connectDB;
