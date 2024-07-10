const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// MongoDB connection function
async function connectDB() {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB;