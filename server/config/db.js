const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not set in your .env file!');
    console.error('   1. Open smart-study-planner/server/.env');
    console.error('   2. Set MONGO_URI=mongodb+srv://<user>:<pass>@cluster...');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('   Check your MONGO_URI in server/.env');
    console.error('   If using Atlas, whitelist your IP in Network Access.');
    process.exit(1);
  }
};

// Handle connection events after initial connect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Reconnecting...');
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;
