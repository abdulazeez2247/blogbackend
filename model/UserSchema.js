const express = require('express')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {

        firstname:{
            type:String,
            required:[true , 'Enter your firstname'],
            trim:true,
        },
        lastname:{
            type:String,
            required:[true , 'Enter your lastname'],
            trim:true,
        },
        email:{
            type:String,
            required:[true , 'Enter your email'],
            trim:true,
            unique:true,
            match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ ,'enter a valid email' ]
        },
        phonenumber:{
            type:Number,
            required:[true , 'Enter your phone number'],
            trim:true,
        },
        password:{
            type:String,
            required:[true , 'Enter your password'],
            minLength:[7 , 'password must be at least 7 character '],
            maxLength:[1028 , 'password should not exceed 1028'],
            trim:true,
        },
        isVerified:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
)


const User = mongoose.model('users' , userSchema)
module.exports = User