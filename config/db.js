const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // We do not exit process here as the user might not have installed mongo yet 
        // and we want the express server to keep running serving the frontend.
        console.log('Ensure MongoDB is installed and running.');
    }
};

module.exports = connectDB;
