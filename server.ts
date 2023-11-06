import app from "./app";
import "dotenv/config";
import connectDB from "./database/mongodb";


// creating server
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.info(`Server is running on port ${port}`);
    connectDB()
});