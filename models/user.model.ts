import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config';

const emailRegex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{courseId: string}>;
    comparePassword: (password: string) => Promise<boolean>;
    signAccessToken: () => string;
    signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: [true, 'please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'please enter your email'],
        unique: true,
        match: [emailRegex, 'please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'please enter your password'],
        minlength: [6, 'password must be at least 6 characters'],
    },
    avatar: {
        public_id: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        }
    },
    role: {
        type: String,
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: {
                type: String,
                required: true,
            }
        }
    ]
}, {
    timestamps: true
})


// hash password before saving it
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// sign access token
userSchema.methods.signAccessToken = function () {
    if(!process.env.ACCESS_TOKEN){
        throw new Error("ACCESS_TOKEN not found");
    }
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN)
}

// sign refresh token
userSchema.methods.signRefreshToken = function () {
    if(!process.env.REFRESH_TOKEN){
        throw new Error("REFRESH_TOKEN not found");
    }
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN)
}

// compare password
userSchema.methods.comparePassword = async function (password: string) {
    const pwd = this.password;
    console.debug('userSchema.methods.comparePassword pwd ', pwd);
    console.debug('userSchema.methods.comparePassword user ', this);
    console.debug('userSchema.methods.comparePassword', password, this.password);
    return await bcrypt.compare(password, this.password);
}

const userModel: Model<IUser> = mongoose.model('User', userSchema);

export default userModel;