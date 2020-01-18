const express = require('express');
const router = express.Router()
const  {signout,requireSignin,signup,signin,accountActivation,forgotpassword,resetpassword,googleLogin,facebookLogin} = require('../controllers/ultimate-auth')
const {userSignupValidator,userSigninValidator,resetPasswordValidator,forgotPasswordValidator} = require('../validators/auth');
const {runValidation} = require('../validators/index');


// Register request
//router.post('/user/register',userSignupValidator,RegisterUser)
// Authentiticate request
//router.post('/user/authenticate', AuthenticateUser);
//signout
router.get('/user/signout', signout);
//testing
router.get('/user/hello',requireSignin, (req,res)=>{
    res.send('hello')
})
//asdads

router.post('/signup',userSignupValidator,runValidation,signup)
router.post('/account-activation',accountActivation)
router.post('/signin',userSigninValidator,runValidation,signin)
//Google login
router.post('/google-login',googleLogin)
router.post('/facebook-login',facebookLogin)
//forgot - reset password
router.put('/forgot-password',forgotPasswordValidator,runValidation,forgotpassword )
router.put('/reset-password',resetPasswordValidator,runValidation,resetpassword )
module.exports = router;
