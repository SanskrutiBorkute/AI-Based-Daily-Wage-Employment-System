import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaamsetu');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error("FULL ERROR:");
console.error(error);
    process.exit(1);
  }
};

export default connectDB;
