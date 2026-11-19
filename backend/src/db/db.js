import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        const connected = await mongoose.connect(process.env.MONGODB_CONNECTION_URI)
        console.log(`DATABASE connected at: ${connected.connection.host}`);
    } catch (err) {
        console.error("database connection error: ", err.message);
        throw err;
    }
}


export default connectDB;
