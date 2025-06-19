const mongoose = require('mongoose')


const UserVerifySchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true 
        },
        otp: String,
        createdAt: Date,
        expiresAt: Date
    }
);


const userVerify = mongoose.model('verification' , UserVerifySchema)
module.exports = userVerify