const mongoose = require('mongoose');

mongoose.set('strictQuery', false); // Suppress deprecation warning

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  console.log("Attempting to connect to MongoDB with URI:", uri);
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB:', uri);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
