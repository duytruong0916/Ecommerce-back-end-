const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const expressJwt =require('express-jwt'); //for the signin requirement
exports.RegisterUser = (req, res) => {
  const {email, name, password,role, history, about} = req.body;
  User.findOne({ email: email }, (err, exist_email) => {
      if (err) res.send(err)
      if (exist_email) {
          return res.json({
              success: false,
              msg: "This email address is already associated with an account"
          })
      }
      else {
          bcrypt.hash(password, 10).then(hash => {
              const newuser = new User({
                  name: name,
                  password: hash,
                  email: email,
                  role: role,
                  history: history,
                  about: about
              });
              newuser.save().then(() => {
                  return res.json({
                      success: true,
                      msg: "User Created"
                  });
              })
                  .catch(err => {
                      return res.json({ error: err });
                  });
          })
      }
  })
}
exports.AuthenticateUser = (req, res) => {
  User.findUser(req.body.email, (err, user) => {
      if (err) return res.send(err);
      if (!user) {
          return res.json({success: false, msg: "INVALID EMAIL" });
      }
      else {
          User.comparePassword(req.body.password, user.password, (err, isMatch) => {
            console.log('heleo')
              if (err) throw err;
              if (isMatch) {
                  const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
                  res.cookie("t", token, {expire: new Date() + 3600})
                  const {name, _id, email, role} = user;
                  return res.json({
                      msg: "Successfully Authenticated",
                      success: true,
                      expirationTime: 3600,
                      token: token,
                      user: {_id, email,role,name}
                  });
              } else
                  return res.json({ success: false, msg: "INVALID PASSWORD" });
          });
      }
  });
}
exports.signout = (req,res)=>{
    res.clearCookie('t');
    res.json({msg: "Successfully SignOut"})

}

//middleware for authorizing token
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
})

exports.isAuth = (req,res,next)=>{
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!user){
        return res.status(403).json({error: "Access denied"})
    }
    next();

}
exports.isAdmin = (req,res, next)=>{
    if(req.profile.role ===0 ){
        return res.status(403).json({error: 'Admin resource! Access denied'})
    }
    next();
}