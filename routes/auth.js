const express = require('express');
const router = express.Router()
const  {RegisterUser,AuthenticateUser,signout,requireSignin} = require('../controllers/auth')
const {userSignupValidator} = require('../validator/index');


// Register request
router.post('/user/register',userSignupValidator,RegisterUser)
// Authentiticate request
router.post('/user/authenticate', AuthenticateUser);
//signout
router.get('/user/signout', signout);
//testing
router.get('/user/hello',requireSignin, (req,res)=>{
    res.send('hello')
})
module.exports = router;
