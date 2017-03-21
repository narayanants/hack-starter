const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.model({
    email: {type:String, unique: true},
    password: String,
    passwordResetToken: String,
    passwordResetExpires: String,

    facebook: String,
    google: String,
    github: String,
    linkedin: String,
    instagram: String,
    twitter: String,

    profile:{
        name:String,
        gender: String,
        profile: String,
        picture: String,
        website: String
    }
},{timestamps:true});

/* Password hashing middleware */

userSchema.pre('save',function save(next){
    const user = this;
    if(!user.isModified('password')){return next();}
    bcrypt.genSalt(10,(err,salt)=>{
        if(err){return next(err);}
        bcrypt.hash(user.password,salt,null,(err,hash)=>{
            if(err){return next(err);}
            user.password = hash;
            next();
        });
    });
}); 

/**
 * Helper method for validating user's password
 */

userSchema.methods.comparePassword = function comparePassword(candidatePassword,cb){
    bcrypt.compare(candidatePassword,this.password,(err,isMatch)=>{
        cb(err,isMatch);
    });
};

/**
 * Helper method for getting user's gravatar.
 */

userSchema.methods.gravatar = function gravatar(size){
    if(!size){
        size = 200;
    }
    if(!this.email){
        return `https://gravatar.com/avatar/?s=${size}&r=retro`;
    }

    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&r=retro`;
};

const User = mongoose.model('User',userSchema);

module.exports = User;