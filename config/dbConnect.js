const { default: mongoose } = require("mongoose");

const dbConnect = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log('Database conected Successfully.');
    } catch (error) {
        console.log('Server error')
    }
};

module.exports = dbConnect