const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, unique:true},
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    facebook: String,
    twitter: String,
    google: String,
    github: Stirng,
    linkedin: String,
    instagram: String,
    steam: String,
    tokens:Array,

    profile:{
        name: String,
        gender: String,
        location: String,
        website: String,
        picture : String
    }
},{timestamps: true});


/* Password hash middleware */

userSchema.pre('save',function save(err){
    const user = this;
    if(!user.isModified('password')){return next();}
    bcrypt.genSalt(10,(err,salt)=>{
        if(err){ return next(err);}
        bcrypt.hash(user.password,(err,hash)=>{
            if(err){return next(err);}
            user.password = hash;
            next();
        });
    });
});