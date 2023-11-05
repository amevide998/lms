import {Request, Response, NextFunction} from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import {CatchAsyncError} from "../middleware/catchAsyncError";
import jwt, {Secret} from "jsonwebtoken";
import "dotenv/config";
import sendMail from "../utils/sendMail";

// register user
interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    avatar?: string
}



export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, email, password} = req.body as IRegisterUser;

        // cek email if exists
        const isEmailExists = await userModel.findOne({email});
        if (isEmailExists) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        const user: IRegisterUser = {
            name,
            email,
            password,
        };

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = {
            user: {name: user.name},
            activationCode
        }

        try {
            await sendMail({
                email:  user.email,
                subject: "Activate your account",
                template: "activation-email",
                data,
            })

            res.status(201).json({
                success: true,
                message: `User created successfully, cek your email :  ${user.email} to activate your account`,
                activationToken: activationToken.token,
            })

        }catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

interface IActivationToken {
    token: string;
    activationCode: string;
}
function createActivationToken(user: any): IActivationToken {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const token = jwt.sign({
        user, activationCode,
    }, process.env.ACTIVATION_TOKEN_SECRET as Secret, {
        expiresIn: "5m",
    });

    return {
        token,
        activationCode,
    };

}
