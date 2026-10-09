import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
        description: {
            type: String,
        },
        shopName: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "seller";
            },
        },
        avatar:
        {
            type: String,
        },
        password:
        {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters long'],
        },
        location: {
            type: String,
            required: true,
            index: true,
        },
        likedProducts: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
        ],
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ],
        role: {
            type: String,
            enum: {
                values: ['buyer', 'seller'],
                message: '{VALUE} is not a valid role',
            },
            default: 'buyer',
        },
        refreshToken:
        {
            type: String,
        },

    },
    { timestamps: true }
)




userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});







userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);   //compare the plain password with hashed password
}





userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        }
    )
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        }
    )
}

//create user model and export it
export const User = mongoose.model("User", userSchema);