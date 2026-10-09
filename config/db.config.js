import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const isMongoConfigured = () => {
    return (
        typeof process.env.MONGODB_URI === 'string' && process.env.MONGODB_URI.trim() !== '' && !process.env.MONGODB_URI.includes('<')
    );
};

export const connectDB = async () => {
    if (!isMongoConfigured()) {
        throw new Error('MONGODB_URI is not configured; cannot start the API without a database.');
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Success: MongoDB connected to database "${mongoose.connection.name}"`);
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
    }
};

export const ensureDatabase = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            error: 'Database is not configured or unavailable. Add a valid MONGODB_URI to enable data operations.'
        });
        return false;
    }
    return true;
};
