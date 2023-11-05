import ErrorHandler from "../utils/ErrorHandler";
import {Request, Response, NextFunction} from "express";

const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // mongodb id error
    if(err.name == "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwterror
    if(err.name === "JsonWebTokenError"){
        const message = `JsonWebTokenError: ${err.message}`;
        err = new ErrorHandler(message, 400);
    }

    // jwt expired
    if(err.name === "TokenExpiredError"){
        const message = `JsonWebTokenError: ${err.message}`;
        err = new ErrorHandler(message, 400);
    }

    // send the error message
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

export default ErrorMiddleware;