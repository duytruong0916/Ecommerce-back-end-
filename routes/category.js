const express = require('express');
const router = express.Router()
const  {create,categoryById, read, remove, update,list} = require('../controllers/category')
const  {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const  {userById} = require('../controllers/user');

router.post('/category/create/:userid',requireSignin,isAuth, isAdmin,create)
router.get('/category/:categoryid', read);
router.delete('/category/:categoryid/:userid',requireSignin,isAuth, isAdmin, remove )
router.put('/category/update/:categoryid/:userid',requireSignin,isAuth, isAdmin, update )
router.get('/categories', list);
router.param('userid', userById);
router.param('categoryid', categoryById)
module.exports = router;
