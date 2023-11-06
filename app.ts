import express,{Request, Response, NextFunction} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import ErrorMiddleware from "./middleware/error";
import userRouter from "./routes/user.route";
import fs from "fs";
import path from "path";
import morgan from "morgan";

const app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

/*
body parser - parse incoming request bodies in a middleware
The limit property specifies the maximum size limit of the JSON payload that can be parsed by the middleware.
 */
app.use(express.json({limit: "50mb"}));

// the cookieParser() function is used to create the middleware.
app.use(cookieParser());

/*
cors - explain
It is a mechanism that enables a server to serve the resource from another domain.
 */
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

app.use(ErrorMiddleware);


// route
app.use("/api/v1", userRouter)


// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.json({
        success: true,
        message: "api is working fine"
    })
})

// unkown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error() as any;
    err.status = "fail";
    err.statusCode = 404;
    err.message = `Can't find ${req.originalUrl} on this server!`;
    // return next(err);
})

app.use(ErrorMiddleware);

export default app;