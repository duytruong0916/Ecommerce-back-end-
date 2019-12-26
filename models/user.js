const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{ 
        type: String,
        trim: true,
        required:true,
        maxlength: 32
    },
    email:{ 
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required:true,
    },
    about: {
        type: String,
        trim: true
    },
    role:{
        type: Number,
        default: 0
    },
    history: {
        type: Array,
        default: []
    }
}, {timestamps: true});

const User = module.exports = mongoose.model('User', userSchema);

module.exports.getUserbyID = function(id, callback){
    User.findById(id, callback);
}
module.exports.findUser = function(email, callback){
    let query = {email: email};
    User.findOne(query, callback);
}
module.exports.RegisterUser = function(newuser, callback){
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(newuser.password, salt, (err,hash)=>{
            if(err) console.log(err);
            newuser.password = hash;
            newuser.save(callback);
        });
    })
}
module.exports.comparePassword = function(userpassword, hash, callback){
    bcrypt.compare(userpassword, hash, (err, isMatch)=>{
        if(err) throw err;
        callback(null, isMatch);
    })

}
