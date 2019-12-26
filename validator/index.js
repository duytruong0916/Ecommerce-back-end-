exports.userSignupValidator = (req,res,next)=>{
    req.check('name', 'Name is required').notEmpty();
    req.check('email', 'Email must be between 3-32 chacracters').notEmpty();
    req.check('email')
             .matches(/.+\@.+\..+/)
             .withMessage("Email must contain @")
    req.check('password', "Password is required").notEmpty();
    req.check('password')
            .isLength({ min: 6}).withMessage('Password must contain at least 6 characters')
            .matches(/\d/).withMessage('Password must contain a number')
        const errors = req.validationErrors();
        console.log(errors)
             if(errors){
                 const firstError = errors.map((error)=> error.msg)[0];
                 return res.status(400).json({success: false, msg: firstError});
             }
        next();
}