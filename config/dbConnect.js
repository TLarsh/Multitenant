const mongoose = require("mongoose");
const dotenv = require('dotenv').config(); // Only needed if you're testing locally with a .env file

mongoose.set('strictQuery', false);


const dbConnect = () => {

    const dbUri = process.env.MONGODB_URL;

    if (!dbUri) {
      console.error('MONGODB_URL is not defined. Please set it in your environment variables.');
      process.exit(1); // Stop the app if no URI is provided
    }

    mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.error('Error connecting to MongoDB:', err));
    // try{
    //     const conn = mongoose.connect(process.env.MONGODB_URL);
    //     console.log('Database conected Successfully.');
    // } catch (error) {
    //     console.log('Server error')
    // }
};

module.exports = dbConnect