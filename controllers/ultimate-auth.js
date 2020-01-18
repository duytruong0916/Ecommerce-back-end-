const User = require('../models/ultimate-user');
const jwt =require('jsonwebtoken');
const expressJwt =require('express-jwt'); //for the signin requirement
const sgMail =  require('@sendgrid/mail');
const fetch = require('node-fetch');
const _ =require('lodash'); //for update
const {OAuth2Client} = require('google-auth-library');
sgMail.setApiKey(process.env.SENDGRID_APIKEY);


exports.signup = (req,res)=>{
    //console.log(process.env.SENDGRID_APIKEY)
    const {firstname,lastname, email, password, address, phone} = req.body;
    User.findOne({email}).exec((err,user)=>{
        if(user){
           return res.status(400).json({error:'Email is already associate with an account'})
        }
        const token = jwt.sign({firstname,lastname,email,password,phone,address},process.env.JWT_ACCOUNT_ACCTIVATION, {expiresIn: '10m'});
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account Activation Link`,
            html: `
                    <p>Please use the following link to activate your account: </p>
                    <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                    <hr />
                    <p>This email might contain sensitive information </p>
                    <p>${process.env.CLIENT_URL}</p>
                `
        }
        sgMail.send(emailData).then(send=>{
            return res.json({message: `An email has been sent to ${email}. Follow the instruction to activate your account `})
        }).catch(err=>{
            res.status(400).json({error: err.message})
        })
    })
   
}

exports.accountActivation = (req,res)=>{
    const {token} = req.body;
    if(token){
        jwt.verify(token, process.env.JWT_ACCOUNT_ACCTIVATION, function(err,decoded){
            if(err){
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err)
                return res.status(401).json({error: 'Expired link. Signup again!'})
            }
            const {firstname,lastname, email, password, address, phone} = jwt.decode(token);
            const newUser  = new User({firstname,lastname, email, password, address, phone});
            console.log(newUser)
            newUser.save((error,user)=>{
                if(error){
                    console.log('Error saving user!')
                    return res.status(400).json({error: 'Error saving user'})
                }
                res.json({message: 'Your account has been activated. Login now!'})
            })
        })
    }
}

exports.signin = (req,res)=>{
    const {email, password} = req.body;
    User.findOne({email}).exec((error,user)=>{
        if(error||!user){
            return res.status(400).json({error: 'User does not exist.'});
        }
        //authenticate
        if(!user.authenticate(password)){
            return res.status(400).json({error: 'User and Password do not match'});

        }
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        const {_id, firstname,lastname, email, role, address, phone} = user;
        res.json({
            token: token,
            user: {_id, firstname,lastname, email, role, address, phone}
        })
    })
}
//forgot-reset password
exports.forgotpassword = (req,res)=>{
    const {email} = req.body;
    User.findOne({email}).exec((err,user)=>{
        if(err||!user){
            console.log(err)
            return res.status(400).json({error: 'User does not exist'})
        }
        const token = jwt.sign({_id: user._id},process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'});
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset Link`,
            html: `
                    <p>Please use the following link to reset your password: </p>
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    <hr />
                    <p>This email might contain sensitive information </p>
                    <p>${process.env.CLIENT_URL}</p>
                `
        }
        user.updateOne({resetPasswordLink: token}, (err, success)=>{
            if(err){
                console.log('RESET PASSWORD LINK ERROR:',err)
                return res.status(400).json({error:'DATABASE connection error on user password reset'})
            }else{
                sgMail.send(emailData).then(send=>{
                    return res.json({message: `An email has been sent to ${email}. Follow the instruction to activate your account `})
                }).catch(err=>{
                    res.status(400).json({message: err.message})
                })
            }
        })
    })
    
}
exports.resetpassword = (req,res)=>{
    const {resetPasswordLink, newpassword} = req.body;
    if(resetPasswordLink){
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err,decoded){
                if(err){
                    console.log('Expired link. Try Again')
                    return res.status(400).json({error:'Expired link. Try Again'})
                }
                User.findOne({resetPasswordLink},(err,user)=>{
                    if(err){
                        console.log('Something went wrong. Try later')
                        return res.status(400).json({error:'Something went wrong. Try later'})
                    }
                    const updatedFields = {
                        password:newpassword,
                        resetPasswordLink: ''
                    }
                    user = _.extend(user,updatedFields);//update fields
                    user.save((err,success)=>{
                        if(err){
                            console.log('Error updating user')
                            return res.status(400).json({error:'Error reseting user password'})
                        }
                        console.log('Updated password successfully')
                        res.json({message: 'Updated password successfully'})
                    })
                })

        })
    }else{
        return res.status(400).json({error: "Expired link. Try Again"});
    }
}
//google login
const client =  new OAuth2Client(process.env.GOOGLECLIENTID);
exports.googleLogin = (req,res)=>{
    const {idToken} = req.body;
    //console.log(idtoken)
    console.log(process.env.GOOGLECLIENTID);
    client.verifyIdToken({idToken,audience:process.env.GOOGLECLIENTID})
    .then(response=>{
        const{email_verified, email, name} = response.payload;
        if(email_verified){
            User.findOne({email}).exec((err, user)=>{
                if(user){
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET,{expiresIn: '7d'})
                    const {_id, firstname,lastname, email, role, address, phone} = user;
                    res.json({
                        token: token,
                        user: {_id, firstname,lastname, email, role, address, phone}
                    })
                }else{
                    let password = email + process.env.JWT_SECRET;
                    let user = new User({lastname:name,firstname:'Unknown',address: 'unknown', email,password})
                    user.save((err,data)=>{
                        if(err){
                            console.log('ERROR ON GOOGLE LOGIN USER SAVE', err)
                            return res.status(400).json({error: 'ERROR ON GOOGLE LOGIN USER SAVE'})
                        }
                        const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET,{expiresIn: '7d'})
                        const {_id, firstname,lastname, email, role, address, phone} = data;
                        res.json({
                            token: token,
                            user: {_id, firstname,lastname, email, role, address, phone}
                        })
                    })
                }
            })
        }else{
            return res.status(400).json({error: 'Google login failed. Try again!'})
        }
    })
}
//facebook login
exports.facebookLogin = (req,res)=>{
    const {userID, accessToken} = req.body;
    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`
    return(
        fetch(url,{
            method: 'GET',
        })
        .then(response=> response.json())
        .then(response=>{
            const {email, name} = response;
            User.findOne({email}).exec((error,user)=>{
                if(user){
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET,{expiresIn: '7d'})
                    const {_id, firstname,lastname, email, role, address, phone} = user;
                    res.json({
                        token: token,
                        user: {_id, firstname,lastname, email, role, address, phone}
                    })
                }else{
                    let password = email + process.env.JWT_SECRET;
                    let user = new User({lastname:name,firstname:'Unknown',address: 'unknown', email,password})
                    user.save((err,data)=>{
                        if(err){
                            console.log('ERROR ON FACEBOOK LOGIN USER SAVE', err)
                            return res.status(400).json({error: 'ERROR ON FACEBOOK LOGIN USER SAVE'})
                        }
                        const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET,{expiresIn: '7d'})
                        const {_id, firstname,lastname, email, role, address, phone} = data;
                        res.json({
                            token: token,
                            user: {_id, firstname,lastname, email, role, address, phone}
                        })
                    })
                }
            })
        })
        .catch(error =>{
            res.status(400).json({error: 'FACEBOOK login failed. Try again!'})
        })
    )
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