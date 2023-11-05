import "dotenv/config";
import mongoose from "mongoose";

const dbUrl = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl)
            .then((data: any) => {
                console.info(`successfully connected to mongodb at ${data.connection.host}`);
            });
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;