const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mognoose');

const userSchema = new mongoose.Schema({
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
    steam: String,
    tokens: Array,

    profile:{
        name: String,
        gender: String,
        picture: String,
        location: String,
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
 * Helper methods for validating user's password
 */

userSchema.methods.comparePassword = function comparePassword(candidatePassword,cb){
    bcrypt.compare(user.password,this.password,(err,isMatch)=>{
        cb(err,isMatch);
    });
};

/**
 * Helper for loading user's gravatar
 */

userSchema.methods.gravatar = function gravatar(size){
    if(!size){
        size = 200;
    }
    if(!this.email){
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }

    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User',userSchema);

module.exports = User;