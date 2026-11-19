import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ['Recruiter', 'Candidate'],
        required: true
    },
    avatar: {
        type: String,
    },
    refreshToken: {
        type: String,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function () {
    if (this.isModified("password")) { 
        this.password = await bcrypt.hash(this.password, 10)
    }
})


userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
        role: this.role
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}



const userModel = mongoose.model("user", userSchema)

export default userModel