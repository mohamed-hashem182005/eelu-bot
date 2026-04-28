const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    console.error('TROUBLESHOOTING:');
    console.error('1. Make sure MongoDB is running');
    console.error('2. For Windows: Start "MongoDB Server" service');
    console.error('3. For Mac: brew services start mongodb-community');
    console.error('4. For Linux: sudo systemctl start mongodb\n');
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB Disconnected');
};

module.exports = { connectDB, disconnectDB };