const {check} = require('express-validator');

exports.userSignupValidator = [
    check('lastname')
    .not()
    .isEmpty()
    .withMessage('Lastname is required'),

    check('firstname')
    .not()
    .isEmpty()
    .withMessage('Firstname is required'),

    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),

    check('password')
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters'),

    check('phone')
    .isLength({min: 10})
    .withMessage('Invalid phone number')
]
exports.userSigninValidator = [

    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),

    check('password')
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters'),
]
exports.forgotPasswordValidator= [

    check('email')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Must be a valid email address'),
]
exports.resetPasswordValidator= [

    check('newpassword')
    .not()
    .isEmpty()
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters'),
]